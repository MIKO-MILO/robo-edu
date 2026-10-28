import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/src/db";
import { vouchers } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/vouchers/validate
 * Body: { code: string, subtotal: number }
 * Returns estimated discount and voucher metadata without creating any record.
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Kode voucher wajib diisi." },
        { status: 400 },
      );
    }

    const now = new Date();
    const [voucher] = await db
      .select()
      .from(vouchers)
      .where(
        and(
          eq(vouchers.code, code),
          eq(vouchers.isActive, true),
          lte(vouchers.startAt, now),
          gte(vouchers.endAt, now),
        ),
      )
      .limit(1);

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "Kode voucher tidak valid atau sudah kadaluwarsa." },
        { status: 422 },
      );
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Voucher sudah mencapai batas penggunaan." },
        { status: 422 },
      );
    }

    const minPurchase = Number(voucher.minimumPurchase);
    if (subtotal < minPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum pembelian untuk voucher ini adalah ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(minPurchase)}.`,
        },
        { status: 422 },
      );
    }

    // Calculate estimated discount (same logic as transaction-service)
    const discountValue = Number(voucher.discountValue);
    const maxDiscount = voucher.maximumDiscount !== null ? Number(voucher.maximumDiscount) : Infinity;

    const rawDiscount =
      voucher.discountType === "PERCENTAGE"
        ? Math.floor((subtotal * discountValue) / 100)
        : discountValue;

    const estimatedDiscount = Math.min(subtotal, rawDiscount, maxDiscount);

    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        discount_type: voucher.discountType,
        discount_value: discountValue,
        estimated_discount: estimatedDiscount,
        is_valid: true,
      },
    });
  } catch (error) {
    console.error("POST /api/vouchers/validate error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memvalidasi voucher." },
      { status: 500 },
    );
  }
}
