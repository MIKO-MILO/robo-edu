import { NextRequest, NextResponse } from "next/server";
import { createPaymentTransaction } from "@/src/lib/services/transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/checkout/midtrans
 * Body: {
 *   addressId:    string   — ID alamat pengiriman (wajib)
 *   shippingCost: number   — biaya ongkir dalam Rupiah (wajib, >= 0)
 *   voucherCode?: string   — kode voucher (opsional)
 *   notes?:       string   — catatan pengiriman (opsional, maks 500 karakter)
 * }
 *
 * Creates a Snap transaction, inserts order + payment rows, and returns
 * the Midtrans-hosted checkout URL for client-side redirect.
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

    const body = await request.json();
    const addressId    = typeof body.addressId    === "string" ? body.addressId.trim()    : "";
    const shippingCost = typeof body.shippingCost === "number" ? Math.round(body.shippingCost) : -1;
    const voucherCode  = typeof body.voucherCode  === "string" ? body.voucherCode.trim()  : undefined;
    const notes        = typeof body.notes        === "string" ? body.notes.trim().slice(0, 500) : undefined;

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

    const transaction = await createPaymentTransaction({
      userId,
      addressId,
      shippingCost,
      voucherCode: voucherCode || undefined,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("POST /api/checkout/midtrans error:", error);

    // Petakan error dari transaction-service ke pesan yang lebih ramah pengguna
    const raw = error instanceof Error ? error.message : "";
    let userMessage = "Gagal membuat pesanan. Silakan coba lagi.";
    if (raw.includes("Shipping address was not found")) {
      userMessage = "Alamat pengiriman tidak ditemukan. Silakan pilih alamat lain.";
    } else if (raw.includes("Cart is empty") || raw.includes("unavailable")) {
      userMessage = "Beberapa produk di keranjang sudah tidak tersedia. Perbarui keranjang Anda.";
    } else if (raw.includes("enough stock")) {
      userMessage = "Stok produk tidak mencukupi untuk memenuhi pesanan ini.";
    } else if (raw.includes("Voucher is invalid") || raw.includes("usage limit")) {
      userMessage = "Voucher tidak lagi valid. Silakan hapus voucher dan coba lagi.";
    } else if (raw.includes("MIDTRANS") || raw.includes("Snap")) {
      userMessage = "Gagal menghubungi payment gateway. Pesanan belum dibuat — silakan coba lagi.";
    }

    return NextResponse.json(
      { success: false, message: userMessage },
      { status: 400 },
    );
  }
}
