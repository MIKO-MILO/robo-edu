import { NextRequest, NextResponse } from "next/server";
import {
  createMembershipTransaction,
  type PendingPurchaseExistsError,
} from "@/src/lib/services/membership-transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/checkout/membership
 *
 * Creates a pending membership_purchase + payments row using Midtrans Core API
 * and returns the payment instruction for the custom payment page.
 *
 * Body:
 *   {
 *     package: "PLUS",
 *     payment_method: string,       // e.g. "bank_transfer", "gopay"
 *     payment_channel: string,      // e.g. "bca_va", "bni_va"
 *     payer_phone_number?: string,  // required for OVO
 *   }
 *
 * Response (success 200):
 *   {
 *     success: true,
 *     data: {
 *       purchase_id, purchase_number, payment_instruction,
 *       expiry_time, status
 *     }
 *   }
 *
 * Response (409 — PENDING purchase exists):
 *   { success: false, code: "PENDING_PURCHASE_EXISTS", purchase_id, purchase_number }
 *
 * Response (422 — Midtrans charge failed):
 *   { success: false, code: "PAYMENT_CHARGE_FAILED" }
 *
 * PRD Bab 6.8 | FR-022 | US-011
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body tidak valid." },
        { status: 400 },
      );
    }

    // ── Validate package ──────────────────────────────────────────────────
    const pkg = typeof body.package === "string" ? body.package.toUpperCase() : "";
    if (pkg !== "PLUS") {
      return NextResponse.json(
        {
          success: false,
          message: 'Paket tidak valid. Saat ini hanya paket "PLUS" yang tersedia.',
        },
        { status: 400 },
      );
    }

    // ── Guard: voucher not supported ──────────────────────────────────────
    if (body.voucher_code !== undefined && body.voucher_code !== null) {
      return NextResponse.json(
        {
          success: false,
          code: "VOUCHER_NOT_SUPPORTED",
          message: "Voucher tidak dapat digunakan untuk pembelian membership.",
        },
        { status: 400 },
      );
    }

    // ── Validate payment fields ───────────────────────────────────────────
    const paymentMethod =
      typeof body.payment_method === "string" ? body.payment_method.trim() : "";
    const paymentChannel =
      typeof body.payment_channel === "string" ? body.payment_channel.trim() : "";

    if (!paymentMethod || !paymentChannel) {
      return NextResponse.json(
        {
          success: false,
          message: "payment_method dan payment_channel wajib diisi.",
        },
        { status: 400 },
      );
    }

    const payerPhoneNumber =
      typeof body.payer_phone_number === "string"
        ? body.payer_phone_number.trim()
        : undefined;

    if (paymentChannel === "ovo" && !payerPhoneNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "payer_phone_number wajib diisi untuk pembayaran OVO.",
        },
        { status: 400 },
      );
    }

    // ── Create transaction ────────────────────────────────────────────────
    const result = await createMembershipTransaction({
      userId,
      package: "PLUS",
      paymentMethod,
      paymentChannel,
      payerPhoneNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        purchase_id: result.purchaseId,
        purchase_number: result.purchaseNumber,
        payment_instruction: result.paymentInstruction,
        expiry_time: result.expiryTime,
        status: result.status,
      },
    });
  } catch (error) {
    // ── PENDING_PURCHASE_EXISTS ───────────────────────────────────────────
    if (
      error instanceof Error &&
      (error as Error & { code?: string }).code === "PENDING_PURCHASE_EXISTS"
    ) {
      const e = error as Error & PendingPurchaseExistsError;
      return NextResponse.json(
        {
          success: false,
          code: "PENDING_PURCHASE_EXISTS",
          purchase_id: e.purchaseId,
          purchase_number: e.purchaseNumber,
          message: "Kamu sudah memiliki pembelian membership yang belum dibayar.",
        },
        { status: 409 },
      );
    }

    // ── PAYMENT_CHARGE_FAILED ─────────────────────────────────────────────
    const raw = error instanceof Error ? error.message : "";
    const code = error instanceof Error ? (error as NodeJS.ErrnoException).code ?? "" : "";
    if (code === "PAYMENT_CHARGE_FAILED" || raw === "PAYMENT_CHARGE_FAILED") {
      return NextResponse.json(
        {
          success: false,
          code: "PAYMENT_CHARGE_FAILED",
          message:
            "Gagal menghubungi payment gateway. Pembelian sudah tercatat — gunakan retry untuk mencoba lagi.",
        },
        { status: 422 },
      );
    }

    console.error("POST /api/checkout/membership error:", error);

    let userMessage = "Gagal membuat transaksi membership. Silakan coba lagi.";
    if (raw.includes("not configured") || raw.includes("invalid")) {
      userMessage =
        "Konfigurasi harga membership belum tersedia. Hubungi administrator.";
    }

    return NextResponse.json(
      { success: false, message: userMessage },
      { status: 400 },
    );
  }
}
