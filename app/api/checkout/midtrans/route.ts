import { NextRequest, NextResponse } from "next/server";
import { createPaymentTransaction } from "@/src/lib/services/transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/checkout/midtrans
 * Body: { addressId: string; shippingCost: number; voucherCode?: string }
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
    const addressId   = typeof body.addressId   === "string" ? body.addressId.trim()   : "";
    const shippingCost = typeof body.shippingCost === "number" ? Math.round(body.shippingCost) : 0;
    const voucherCode  = typeof body.voucherCode  === "string" ? body.voucherCode.trim() : undefined;

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
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("POST /api/checkout/midtrans error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Gagal membuat pembayaran.",
      },
      { status: 400 },
    );
  }
}
