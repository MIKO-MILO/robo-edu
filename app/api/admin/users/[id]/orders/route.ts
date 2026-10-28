import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, orderItems, payments, productImages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/users/[id]/orders
 *
 * Semua order milik satu customer, diurutkan terbaru dulu.
 * Dipakai oleh halaman detail customer untuk menghitung LTV & histori pesanan.
 *
 * Query params:
 *   limit  — default 100, max 200
 *   page   — default 1
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: customerId } = await params;
  const { searchParams } = request.nextUrl;
  const limit  = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? "100")));
  const page   = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const offset = (page - 1) * limit;

  // ── Count ──────────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(orders)
    .where(eq(orders.userId, customerId));

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, total_pages: 0 },
    });
  }

  // ── Fetch orders ───────────────────────────────────────────────────────
  const rows = await db
    .select({
      id:            orders.id,
      orderNumber:   orders.orderNumber,
      status:        orders.status,
      total:         orders.total,
      subtotal:      orders.subtotal,
      shippingCost:  orders.shippingCost,
      discountAmount: orders.discountAmount,
      createdAt:     orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  const orderIds = rows.map((r) => r.id);

  // ── Item counts + first item ───────────────────────────────────────────
  const countRows = await db
    .select({
      orderId:   orderItems.orderId,
      itemCount: sql<number>`COUNT(*)`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = Object.fromEntries(
    countRows.map((r) => [r.orderId, Number(r.itemCount)]),
  );

  const firstItemRows = await db
    .select({
      orderId:             orderItems.orderId,
      productId:           orderItems.productId,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantNameSnapshot: orderItems.variantNameSnapshot,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt));

  const firstItemMap: Record<string, typeof firstItemRows[number]> = {};
  for (const item of firstItemRows) {
    if (!firstItemMap[item.orderId]) firstItemMap[item.orderId] = item;
  }

  // ── Payments ───────────────────────────────────────────────────────────
  const paymentRows = await db
    .select({
      orderId:     payments.orderId,
      status:      payments.status,
      paymentType: payments.paymentType,
    })
    .from(payments)
    .where(inArray(payments.orderId, orderIds));

  const paymentMap: Record<string, typeof paymentRows[number]> = {};
  for (const p of paymentRows) paymentMap[p.orderId] = p;

  // ── Images ─────────────────────────────────────────────────────────────
  const firstProductIds = [
    ...new Set(Object.values(firstItemMap).map((i) => i.productId)),
  ];
  const imageMap: Record<string, string> = {};
  if (firstProductIds.length > 0) {
    const imageRows = await db
      .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
      .from(productImages)
      .where(inArray(productImages.productId, firstProductIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));
    for (const img of imageRows) {
      if (!imageMap[img.productId]) imageMap[img.productId] = img.imageUrl;
    }
  }

  // ── Shape — kompatibel dengan OrderListItem type ───────────────────────
  const data = rows.map((order) => {
    const fi  = firstItemMap[order.id];
    const pmt = paymentMap[order.id];
    return {
      id:             order.id,
      order_number:   order.orderNumber,
      status:         order.status.toUpperCase(),
      total:          Number(order.total),
      subtotal:       Number(order.subtotal),
      shipping_cost:  Number(order.shippingCost),
      discount_amount: Number(order.discountAmount),
      created_at:     order.createdAt.toISOString(),
      item_count:     countMap[order.id] ?? 0,
      // nested first_item — kompatibel dengan OrderListItem
      first_item: fi
        ? {
            product_name_snapshot: fi.productNameSnapshot,
            variant_name_snapshot: fi.variantNameSnapshot ?? null,
            image_url: imageMap[fi.productId] ?? null,
          }
        : null,
      payment_status: pmt?.status?.toUpperCase() ?? "PENDING",
      payment_method: pmt?.paymentType ?? "-",
    };
  });

  return NextResponse.json({
    success: true,
    data,
    meta: { page, limit, total: totalCount, total_pages: Math.ceil(totalCount / limit) },
  });
}
