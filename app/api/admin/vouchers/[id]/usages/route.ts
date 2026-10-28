import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { vouchers, voucherUsages, users, orders } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/vouchers/[id]/usages
 *
 * Histori pemakaian voucher tertentu.
 * Query params:
 *   page  — default 1
 *   limit — default 10, max 100
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Pastikan voucher ada
  const [voucher] = await db
    .select({ id: vouchers.id })
    .from(vouchers)
    .where(eq(vouchers.id, id))
    .limit(1);

  if (!voucher) {
    return NextResponse.json(
      { success: false, message: "Voucher tidak ditemukan." },
      { status: 404 },
    );
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const offset = (page - 1) * limit;

  // ── Count ────────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(voucherUsages)
    .where(eq(voucherUsages.voucherId, id));

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, total_pages: 0 },
    });
  }

  // ── Fetch dengan join ke users dan orders ────────────────────────────
  const rows = await db
    .select({
      id: voucherUsages.id,
      voucherId: voucherUsages.voucherId,
      userId: voucherUsages.userId,
      orderId: voucherUsages.orderId,
      discountAmount: voucherUsages.discountAmount,
      createdAt: voucherUsages.createdAt,
      userName: users.name,
      userEmail: users.email,
      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
      orderTotal: orders.total,
    })
    .from(voucherUsages)
    .innerJoin(users, eq(voucherUsages.userId, users.id))
    .innerJoin(orders, eq(voucherUsages.orderId, orders.id))
    .where(eq(voucherUsages.voucherId, id))
    .orderBy(desc(voucherUsages.createdAt))
    .limit(limit)
    .offset(offset);

  const data = rows.map((r) => ({
    id: r.id,
    voucher_id: r.voucherId,
    user_id: r.userId,
    order_id: r.orderId,
    discount_amount: Number(r.discountAmount),
    created_at: r.createdAt.toISOString(),
    user_name: r.userName,
    user_email: r.userEmail,
    order_number: r.orderNumber,
    order_status: r.orderStatus,
    order_total: Number(r.orderTotal),
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
    },
  });
}
