import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createPaymentTransaction } from "@/src/lib/services/transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

/**
 * Shared handler for POST /api/checkout and POST /api/checkout/midtrans.
 *
 * Both routes forward the raw Request here so the logic lives in one place.
 * The only difference is the route path; behaviour is identical.
 */
export async function handleCheckout(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    // ── Idempotency-Key header ───────────────────────────────────────────────
    const idempotencyKey = request.headers.get("idempotency-key")?.trim() || null;
    if (!idempotencyKey) {
      return NextResponse.json(
        { success: false, message: "Header Idempotency-Key wajib disertakan." },
        { status: 400 },
      );
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body tidak valid." },
        { status: 400 },
      );
    }

    const addressId      = typeof body.addressId      === "string" ? body.addressId.trim()      : "";
    const shippingCost   = typeof body.shippingCost   === "number" ? Math.round(body.shippingCost)   : -1;
    const providerId     = typeof body.providerId     === "string" ? body.providerId.trim()     : "";
    const voucherCode    = typeof body.voucherCode    === "string" ? body.voucherCode.trim()    : undefined;
    const notes          = typeof body.notes          === "string" ? body.notes.trim().slice(0, 500) : undefined;
    const paymentMethod  = typeof body.paymentMethod  === "string" ? body.paymentMethod.trim()  : "";
    const paymentChannel = typeof body.paymentChannel === "string" ? body.paymentChannel.trim() : "";
    // OVO phone lives in `ovoPhone` from the frontend, stored as payer_phone_number
    const payerPhoneNumber =
      typeof body.ovoPhone === "string" && body.ovoPhone.trim()
        ? body.ovoPhone.trim()
        : typeof body.payerPhoneNumber === "string" && body.payerPhoneNumber.trim()
          ? body.payerPhoneNumber.trim()
          : undefined;
    const cardToken   = typeof body.cardToken   === "string" ? body.cardToken.trim()   : undefined;
    const isDropship  = body.isDropship === true;
    const senderName  = typeof body.senderName  === "string" ? body.senderName.trim()  : undefined;
    const senderPhone = typeof body.senderPhone === "string" ? body.senderPhone.trim() : undefined;

    // ── Validation ───────────────────────────────────────────────────────────
    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Alamat pengiriman wajib dipilih." },
        { status: 400 },
      );
    }
    if (shippingCost < 0) {
      return NextResponse.json(
        { success: false, message: "Biaya pengiriman tidak valid." },
        { status: 400 },
      );
    }
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: "Jasa pengiriman wajib dipilih." },
        { status: 400 },
      );
    }
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Metode pembayaran wajib dipilih." },
        { status: 400 },
      );
    }
    if (!paymentChannel) {
      return NextResponse.json(
        { success: false, message: "Saluran pembayaran wajib dipilih." },
        { status: 400 },
      );
    }
    if (paymentChannel === "ovo" && !payerPhoneNumber) {
      return NextResponse.json(
        { success: false, message: "Nomor HP wajib diisi untuk pembayaran OVO." },
        { status: 400 },
      );
    }
    if (paymentMethod === "credit_card" && !cardToken) {
      return NextResponse.json(
        { success: false, message: "Token kartu kredit wajib diisi." },
        { status: 400 },
      );
    }
    if (isDropship && !senderName) {
      return NextResponse.json(
        { success: false, message: "Nama pengirim wajib diisi untuk pesanan dropship." },
        { status: 400 },
      );
    }
    if (isDropship && !senderPhone) {
      return NextResponse.json(
        { success: false, message: "Telepon pengirim wajib diisi untuk pesanan dropship." },
        { status: 400 },
      );
    }

    // ── Call service ─────────────────────────────────────────────────────────
    const transaction = await createPaymentTransaction({
      userId,
      addressId,
      shippingCost,
      providerId,
      voucherCode: voucherCode || undefined,
      notes: notes || undefined,
      paymentMethod,
      paymentChannel,
      payerPhoneNumber,
      cardToken,
      idempotencyKey,
      isDropship,
      senderName: isDropship ? senderName : undefined,
      senderPhone: isDropship ? senderPhone : undefined,
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "";

    // ── Specific 409 / 422 error codes ────────────────────────────────────
    if (raw.includes("STOCK_INSUFFICIENT")) {
      return NextResponse.json(
        { success: false, error: "STOCK_INSUFFICIENT", message: "Stok produk tidak mencukupi untuk memenuhi pesanan ini." },
        { status: 409 },
      );
    }
    if (raw.includes("PENDING_ORDER_LIMIT")) {
      return NextResponse.json(
        { success: false, error: "PENDING_ORDER_LIMIT", message: "Kamu sudah memiliki 3 pesanan yang menunggu pembayaran. Selesaikan atau batalkan salah satu dulu." },
        { status: 409 },
      );
    }
    if (raw.includes("PAYMENT_CHARGE_FAILED")) {
      return NextResponse.json(
        { success: false, error: "PAYMENT_CHARGE_FAILED", message: "Gagal menghubungi payment gateway. Pesanan belum dibuat — silakan coba lagi." },
        { status: 422 },
      );
    }

    // ── Friendly 400 messages for domain errors ───────────────────────────
    console.error("POST /api/checkout error:", error);
    let userMessage = "Gagal membuat pesanan. Silakan coba lagi.";
    if (raw.includes("Shipping address was not found")) {
      userMessage = "Alamat pengiriman tidak ditemukan. Silakan pilih alamat lain.";
    } else if (raw.includes("Shipping provider")) {
      userMessage = "Jasa pengiriman tidak ditemukan atau tidak aktif.";
    } else if (raw.includes("Cart is empty") || raw.includes("unavailable")) {
      userMessage = "Beberapa produk di keranjang sudah tidak tersedia. Perbarui keranjang Anda.";
    } else if (raw.includes("Voucher is invalid") || raw.includes("usage limit")) {
      userMessage = "Voucher tidak lagi valid. Silakan hapus voucher dan coba lagi.";
    } else if (raw.includes("Dropship")) {
      userMessage = raw;
    }

    return NextResponse.json(
      { success: false, message: userMessage },
      { status: 400 },
    );
  }
}
