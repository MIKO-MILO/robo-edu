import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
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
 *   tab   = all | processing | shipped | completed | cancelled
 *   page  = 1-based, default 1
 *   limit = default 10, max 50
 *   q     = search by order_number atau product_name_snapshot
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
  const tab   = searchParams.get("tab") ?? "all";
  const page  = Math.max(1, Number(searchParams.get("page")  ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const q     = searchParams.get("q")?.trim() ?? "";
  const offset = (page - 1) * limit;

  // ── Build base filters ─────────────────────────────────────────────────
  const baseFilters = [eq(orders.userId, userId)];

  const tabStatuses = TAB_STATUS_MAP[tab];
  if (tabStatuses) {
    baseFilters.push(inArray(orders.status, tabStatuses));
  }

  // ── Search: find matching orderIds first (DB-side, not post-fetch) ────
  // This ensures meta.total reflects the search result count accurately.
  let searchOrderIds: string[] | null = null;
  if (q) {
    const ql = `%${q}%`;

    // Orders whose order_number matches
    const byNumber = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.userId, userId), like(orders.orderNumber, ql)));

    // Orders that have an item whose product_name_snapshot matches
    const byProduct = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orders.userId, userId), like(orderItems.productNameSnapshot, ql)));

    const matchSet = new Set<string>([
      ...byNumber.map((r) => r.id),
      ...byProduct.map((r) => r.orderId),
    ]);
    searchOrderIds = [...matchSet];

    // No matches at all — return early
    if (searchOrderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }

    baseFilters.push(inArray(orders.id, searchOrderIds));
  }

  // ── Count total (accurate — search already folded into filters) ───────
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(orders)
    .where(and(...baseFilters));

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, totalPages: 0 },
    });
  }

  // ── Fetch paginated orders ─────────────────────────────────────────────
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
    .where(and(...baseFilters))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  }

  const orderIds = rows.map((r) => r.id);

  // ── Fetch all items for this page's orders ────────────────────────────
  const items = await db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantNameSnapshot: orderItems.variantNameSnapshot,
      createdAt: orderItems.createdAt,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(orderItems.createdAt);

  // ── Item counts per order ─────────────────────────────────────────────
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

  // Group items per order — first item (earliest createdAt) is the preview
  const firstItemMap: Record<string, typeof items[number]> = {};
  for (const item of items) {
    if (!firstItemMap[item.orderId]) {
      firstItemMap[item.orderId] = item;
    }
  }

  // ── Fetch primary images for first-item products ──────────────────────
  const firstProductIds = [
    ...new Set(Object.values(firstItemMap).map((i) => i.productId)),
  ];

  const imageMap: Record<string, string> = {};
  if (firstProductIds.length > 0) {
    const imageRows = await db
      .select({
        productId: productImages.productId,
        imageUrl: productImages.imageUrl,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, firstProductIds))
      .orderBy(productImages.isPrimary, productImages.sortOrder);

    // For each product keep the primary image, or fallback to first row
    for (const img of imageRows) {
      // overwrite with primary if not already set, or if this one is primary
      if (!imageMap[img.productId] || img.isPrimary) {
        imageMap[img.productId] = img.imageUrl;
      }
    }
  }

  // ── Shape response ────────────────────────────────────────────────────
  const data = rows.map((order) => {
    const fi = firstItemMap[order.id];
    return {
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
      first_item: fi
        ? {
            product_name_snapshot: fi.productNameSnapshot,
            variant_name_snapshot: fi.variantNameSnapshot ?? null,
            image_url: imageMap[fi.productId] ?? null,
          }
        : null,
    };
  });

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
