import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  orders,
  orderItems,
  payments,
  users,
  productImages,
} from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

export const runtime = "nodejs";

/**
 * GET /api/admin/orders
 *
 * Returns ALL orders (all users) with customer info joined.
 *
 * Query params:
 *   page     — 1-based (default 1)
 *   limit    — rows per page (default 20, max 100)
 *   q        — full-text: order_number | customer name/email | product name
 *   search   — alias for q (untuk kompatibilitas OrderFilters component)
 *   status   — OrderStatus filter, e.g. "PAID" | "PROCESSING" | "ALL"
 *   user_id  — filter by specific customer (dipakai oleh customer detail page)
 *   sort     — "created_at_desc" (default) | "created_at_asc" | "total_desc" | "total_asc"
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
  const page       = Math.max(1, Number(searchParams.get("page")   ?? "1"));
  const limit      = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const offset     = (page - 1) * limit;
  // "q" dari orderService, "search" dari admin UI filter
  const q          = (searchParams.get("q") ?? searchParams.get("search") ?? "").trim();
  const status     = (searchParams.get("status") ?? "ALL").trim().toUpperCase();
  const userIdParam = searchParams.get("user_id")?.trim() ?? "";
  const sort       = searchParams.get("sort") ?? "created_at_desc";

  // ── Build base filters ─────────────────────────────────────────────────
  const filters = [];

  // Filter per customer (untuk halaman detail customer)
  if (userIdParam) {
    filters.push(eq(orders.userId, userIdParam));
  }

  // Filter status
  if (status && status !== "ALL") {
    // DB simpan lowercase, UI kirim uppercase
    filters.push(eq(orders.status, status.toLowerCase()));
  }

  // ── Search ─────────────────────────────────────────────────────────────
  if (q) {
    const ql = `%${q}%`;

    const byNumber = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.orderNumber, ql));

    const byCustomer = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(or(like(users.name, ql), like(users.email, ql)));

    const byProduct = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(like(orderItems.productNameSnapshot, ql));

    const matchSet = new Set<string>([
      ...byNumber.map((r) => r.id),
      ...byCustomer.map((r) => r.id),
      ...byProduct.map((r) => r.orderId),
    ]);

    const searchIds = [...matchSet];

    if (searchIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, total_pages: 0, totalPages: 0 },
      });
    }

    filters.push(inArray(orders.id, searchIds));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Count total ────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${orders.id})` })
    .from(orders)
    .where(whereClause);

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, total_pages: 0, totalPages: 0 },
    });
  }

  // ── Sort ───────────────────────────────────────────────────────────────
  const orderByClause =
    sort === "created_at_asc" ? asc(orders.createdAt)  :
    sort === "total_desc"     ? desc(orders.total)      :
    sort === "total_asc"      ? asc(orders.total)       :
    /* default */               desc(orders.createdAt);

  // ── Fetch rows ─────────────────────────────────────────────────────────
  const rows = await db
    .select({
      id:                  orders.id,
      orderNumber:         orders.orderNumber,
      status:              orders.status,
      total:               orders.total,
      subtotal:            orders.subtotal,
      shippingCost:        orders.shippingCost,
      discountAmount:      orders.discountAmount,
      voucherCodeSnapshot: orders.voucherCodeSnapshot,
      recipientName:       orders.recipientName,
      recipientPhone:      orders.recipientPhone,
      shippingCity:        orders.shippingCity,
      shippingProvince:    orders.shippingProvince,
      paidAt:              orders.paidAt,
      shippedAt:           orders.shippedAt,
      deliveredAt:         orders.deliveredAt,
      cancelledAt:         orders.cancelledAt,
      createdAt:           orders.createdAt,
      customerId:          users.id,
      customerName:        users.name,
      customerEmail:       users.email,
      customerPhone:       users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        page, limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  }

  const orderIds = rows.map((r) => r.id);

  // ── Item counts ────────────────────────────────────────────────────────
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

  // ── First item per order ───────────────────────────────────────────────
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

  // ── Thumbnail images ───────────────────────────────────────────────────
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

  // ── Shape response ─────────────────────────────────────────────────────
  const data = rows.map((order) => {
    const fi  = firstItemMap[order.id];
    const pmt = paymentMap[order.id];
    return {
      id:                    order.id,
      order_number:          order.orderNumber,
      status:                order.status.toUpperCase() as OrderStatus,
      total:                 Number(order.total),
      subtotal:              Number(order.subtotal),
      shipping_cost:         Number(order.shippingCost),
      discount_amount:       Number(order.discountAmount),
      voucher_code_snapshot: order.voucherCodeSnapshot ?? null,
      recipient_name:        order.recipientName,
      recipient_phone:       order.recipientPhone,
      shipping_city:         order.shippingCity,
      shipping_province:     order.shippingProvince,
      paid_at:               order.paidAt?.toISOString()      ?? null,
      shipped_at:            order.shippedAt?.toISOString()   ?? null,
      delivered_at:          order.deliveredAt?.toISOString() ?? null,
      cancelled_at:          order.cancelledAt?.toISOString() ?? null,
      created_at:            order.createdAt.toISOString(),
      // customer
      customer_id:           order.customerId,
      customer_name:         order.customerName,
      customer_email:        order.customerEmail,
      customer_phone:        order.customerPhone ?? null,
      // items
      item_count:            countMap[order.id] ?? 0,
      first_item_name:       fi?.productNameSnapshot ?? "-",
      first_item_image:      fi ? (imageMap[fi.productId] ?? null) : null,
      // Shape kompatibel dengan OrderListItem.first_item
      first_item: fi
        ? {
            product_name_snapshot: fi.productNameSnapshot,
            variant_name_snapshot: fi.variantNameSnapshot ?? null,
            image_url:             imageMap[fi.productId] ?? null,
          }
        : null,
      // payment
      payment_status:  (pmt?.status?.toUpperCase() ?? "PENDING") as PaymentStatus,
      payment_method:  pmt?.paymentType ?? "-",
    };
  });

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total: totalCount,
      total_pages: Math.ceil(totalCount / limit),
      // alias untuk kompatibilitas service layer lama
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
