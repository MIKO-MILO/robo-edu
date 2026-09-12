import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, orderItems, productImages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

// Tab → status mapping (sama dengan frontend ORDER_TABS)
const TAB_STATUS_MAP: Record<string, OrderStatus[]> = {
  processing: ["PENDING", "PAID", "PROCESSING"],
  shipped: ["SHIPPED"],
  completed: ["DELIVERED", "COMPLETED"],
  cancelled: ["CANCELLED", "REFUNDED"],
};

/**
 * GET /api/orders
 * Query params:
 *   tab    = all | processing | shipped | completed | cancelled
 *   status = PENDING|PAID|... (override tab, opsional)
 *   page   = 1-based, default 1
 *   limit  = default 10
 *   q      = search by order_number atau product_name_snapshot
 */
export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const tab = searchParams.get("tab") ?? "all";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const q = searchParams.get("q")?.trim() ?? "";
  const offset = (page - 1) * limit;

  // ── Build filters ─────────────────────────────────────────────────────
  const filters = [eq(orders.userId, userId)];

  const tabStatuses = TAB_STATUS_MAP[tab];
  if (tabStatuses) {
    filters.push(inArray(orders.status, tabStatuses));
  }

  // ── Count total (untuk pagination) ───────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(orders)
    .where(and(...filters));

  // ── Fetch orders ─────────────────────────────────────────────────────
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      subtotal: orders.subtotal,
      shippingCost: orders.shippingCost,
      discountAmount: orders.discountAmount,
      voucherCodeSnapshot: orders.voucherCodeSnapshot,
      recipientName: orders.recipientName,
      recipientPhone: orders.recipientPhone,
      shippingAddress: orders.shippingAddress,
      shippingCity: orders.shippingCity,
      shippingProvince: orders.shippingProvince,
      paidAt: orders.paidAt,
      shippedAt: orders.shippedAt,
      deliveredAt: orders.deliveredAt,
      cancelledAt: orders.cancelledAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(...filters))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: Number(total), totalPages: 0 },
    });
  }

  const orderIds = rows.map((r) => r.id);

  // ── Fetch first item per order (untuk card preview) ──────────────────
  // Ambil semua items dari order-order di halaman ini, lalu grouping di JS
  const items = await db
    .select({
      orderId: orderItems.orderId,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantNameSnapshot: orderItems.variantNameSnapshot,
      createdAt: orderItems.createdAt,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(orderItems.createdAt);

  // ── Fetch item counts per order ───────────────────────────────────────
  const countRows = await db
    .select({
      orderId: orderItems.orderId,
      itemCount: sql<number>`count(*)`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = Object.fromEntries(
    countRows.map((r) => [r.orderId, Number(r.itemCount)]),
  );

  // Group items per order, ambil yang pertama (earliest createdAt)
  const firstItemMap: Record<string, typeof items[number]> = {};
  for (const item of items) {
    if (!firstItemMap[item.orderId]) {
      firstItemMap[item.orderId] = item;
    }
  }

  // ── Search filter (post-fetch — order_number / product name) ─────────
  let result = rows;
  if (q) {
    const ql = q.toLowerCase();
    // Kumpulkan orderIds yang punya produk cocok
    const matchingOrderIds = new Set(
      items
        .filter((i) => i.productNameSnapshot.toLowerCase().includes(ql))
        .map((i) => i.orderId),
    );
    result = rows.filter(
      (r) =>
        r.orderNumber.toLowerCase().includes(ql) ||
        matchingOrderIds.has(r.id),
    );
  }

  // ── Shape response ────────────────────────────────────────────────────
  const data = result.map((order) => ({
    id: order.id,
    order_number: order.orderNumber,
    status: order.status as OrderStatus,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shipping_cost: Number(order.shippingCost),
    discount_amount: Number(order.discountAmount),
    voucher_code_snapshot: order.voucherCodeSnapshot ?? null,
    recipient_name: order.recipientName,
    recipient_phone: order.recipientPhone,
    shipping_address: order.shippingAddress,
    shipping_city: order.shippingCity,
    shipping_province: order.shippingProvince,
    paid_at: order.paidAt?.toISOString() ?? null,
    shipped_at: order.shippedAt?.toISOString() ?? null,
    delivered_at: order.deliveredAt?.toISOString() ?? null,
    cancelled_at: order.cancelledAt?.toISOString() ?? null,
    created_at: order.createdAt.toISOString(),
    item_count: countMap[order.id] ?? 0,
    first_item: firstItemMap[order.id]
      ? {
          product_name_snapshot: firstItemMap[order.id].productNameSnapshot,
          variant_name_snapshot: firstItemMap[order.id].variantNameSnapshot ?? null,
          image_url: null, // TODO: join ke product_images jika diperlukan
        }
      : null,
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  });
}
