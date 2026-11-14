import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import {
  retryMembershipPayment,
} from "@/src/lib/services/membership-transaction-service";

export const runtime = "nodejs";

/**
 * POST /api/membership-purchases/[id]/payment/retry
 *
 * Retry / change payment method for a PENDING membership purchase.
 * Requires the `Idempotency-Key` header to prevent double-charges on network
 * retries.
 *
 * Flow:
 *   1. Auth — must be the purchase owner.
 *   2. Validate purchase is PENDING.
 *   3. Load all payment attempts; check attempt count ≤ MAX_ATTEMPTS.
 *   4. Idempotency — if the same key already has an attempt, return it.
 *   5. Cancel the current PENDING attempt via Midtrans Cancel API.
 *   6. Mark the old attempt FAILED in the DB.
 *   7. Charge Midtrans Core API with new midtransOrderId = {purchaseNumber}-{N+1}.
 *   8. Insert new payment row with instruction + expiry_time.
 *
 * Error codes:
 *   PURCHASE_NOT_FOUND   → 404
 *   PURCHASE_NOT_PENDING → 409
 *   MAX_ATTEMPTS_REACHED → 422
 *   PAYMENT_CHARGE_FAILED → 502
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    paymentMethod?: string;
    paymentChannel?: string;
    payerPhoneNumber?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const paymentChannel = body.paymentChannel?.trim() ?? "";
  const paymentMethod = body.paymentMethod?.trim() ?? paymentChannel;

  if (!paymentChannel) {
    return NextResponse.json(
      { success: false, message: "paymentChannel wajib diisi." },
      { status: 400 },
    );
  }

  if (paymentChannel === "ovo" && !body.payerPhoneNumber) {
    return NextResponse.json(
      {
        success: false,
        message: "payerPhoneNumber wajib diisi untuk pembayaran OVO.",
      },
      { status: 400 },
    );
  }

  const idempotencyKey = req.headers.get("Idempotency-Key") ?? undefined;

  // ── Delegate to service ───────────────────────────────────────────────────
  try {
    const result = await retryMembershipPayment({
      userId,
      purchaseId: id,
      paymentMethod,
      paymentChannel,
      payerPhoneNumber: body.payerPhoneNumber,
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      data: {
        purchase_id: result.purchaseId,
        purchase_number: result.purchaseNumber,
        payment_instruction: result.paymentInstruction,
        expiry_time: result.expiryTime,
        status: result.status,
        amount: result.amount,
        attempt_number: result.attemptNumber,
      },
    });
  } catch (error) {
    const code =
      error instanceof Error
        ? (error as Error & { code?: string }).code ?? ""
        : "";
    const message = error instanceof Error ? error.message : "";

    if (code === "PURCHASE_NOT_FOUND" || message === "PURCHASE_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          code: "PURCHASE_NOT_FOUND",
          message: "Pembelian membership tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (code === "PURCHASE_NOT_PENDING" || message.startsWith("PURCHASE_NOT_PENDING")) {
      const status = message.split(":")[1] ?? "";
      return NextResponse.json(
        {
          success: false,
          code: "PURCHASE_NOT_PENDING",
          message: `Pembelian membership tidak dapat di-retry (status: ${status || "tidak valid"}).`,
        },
        { status: 409 },
      );
    }

    if (code === "MAX_ATTEMPTS_REACHED" || message === "MAX_ATTEMPTS_REACHED") {
      return NextResponse.json(
        {
          success: false,
          code: "MAX_ATTEMPTS_REACHED",
          message: "Batas percobaan pembayaran (5) telah tercapai.",
        },
        { status: 422 },
      );
    }

    if (code === "PAYMENT_CHARGE_FAILED" || message === "PAYMENT_CHARGE_FAILED") {
      return NextResponse.json(
        {
          success: false,
          code: "PAYMENT_CHARGE_FAILED",
          message:
            "Gagal memproses pembayaran. Silakan coba lagi dengan metode lain.",
        },
        { status: 502 },
      );
    }

    console.error("POST /api/membership-purchases/[id]/payment/retry error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}
