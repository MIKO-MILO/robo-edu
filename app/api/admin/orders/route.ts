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

export const runtime = "nodejs";

/**
 * GET /api/admin/orders
 * Query params:
 *   search  — cari berdasarkan order_number, nama customer, atau nama produk
 *   status  — filter status (PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | COMPLETED | CANCELLED)
 *   page    — default 1
 *   limit   — default 10, max 100
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
  const search = searchParams.get("search")?.trim() ?? "";
  const statusFilter = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const offset = (page - 1) * limit;

  // ── Build filters ─────────────────────────────────────────────────────
  const filters = [];

  if (statusFilter && statusFilter !== "ALL") {
    filters.push(eq(orders.status, statusFilter.toLowerCase()));
  }

  // Search: by order_number, customer name, or product name snapshot
  let searchOrderIds: string[] | null = null;
  if (search) {
    const ql = `%${search}%`;

    const byNumber = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.orderNumber, ql));

    const byCustomer = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(or(like(users.name, ql), like(users.email, ql))!);

    const byProduct = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(like(orderItems.productNameSnapshot, ql));

    const matchSet = new Set<string>([
      ...byNumber.map((r) => r.id),
      ...byCustomer.map((r) => r.id),
      ...byProduct.map((r) => r.orderId),
    ]);

    searchOrderIds = [...matchSet];

    if (searchOrderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, total_pages: 0 },
      });
    }

    filters.push(inArray(orders.id, searchOrderIds));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Count ─────────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${orders.id})` })
    .from(orders)
    .where(whereClause);

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, total_pages: 0 },
    });
  }

  // ── Fetch orders ──────────────────────────────────────────────────────
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      shippingCost: orders.shippingCost,
      discountAmount: orders.discountAmount,
      createdAt: orders.createdAt,
      // Customer info via join
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: totalCount, total_pages: Math.ceil(totalCount / limit) },
    });
  }

  const orderIds = rows.map((r) => r.id);

  // ── Item counts per order ─────────────────────────────────────────────
  const countRows = await db
    .select({
      orderId: orderItems.orderId,
      itemCount: sql<number>`COUNT(*)`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = Object.fromEntries(
    countRows.map((r) => [r.orderId, Number(r.itemCount)]),
  );

  // ── First item per order (for preview) ───────────────────────────────
  const allItems = await db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantNameSnapshot: orderItems.variantNameSnapshot,
      createdAt: orderItems.createdAt,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt));

  const firstItemMap: Record<string, typeof allItems[number]> = {};
  for (const item of allItems) {
    if (!firstItemMap[item.orderId]) {
      firstItemMap[item.orderId] = item;
    }
  }

  // ── Payments per order ────────────────────────────────────────────────
  const paymentRows = await db
    .select({
      orderId: payments.orderId,
      status: payments.status,
      paymentType: payments.paymentType,
    })
    .from(payments)
    .where(inArray(payments.orderId, orderIds));

  const paymentMap = Object.fromEntries(
    paymentRows.map((p) => [p.orderId, p]),
  );

  // ── Thumbnail images ──────────────────────────────────────────────────
  const firstProductIds = [
    ...new Set(Object.values(firstItemMap).map((i) => i.productId)),
  ];

  const imageMap: Record<string, string> = {};
  if (firstProductIds.length > 0) {
    const imageRows = await db
      .select({
        productId: productImages.productId,
        imageUrl: productImages.imageUrl,
      })
      .from(productImages)
      .where(inArray(productImages.productId, firstProductIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    for (const img of imageRows) {
      if (!imageMap[img.productId]) {
        imageMap[img.productId] = img.imageUrl;
      }
    }
  }

  // ── Shape response ────────────────────────────────────────────────────
  const data = rows.map((order) => {
    const fi = firstItemMap[order.id];
    const pmt = paymentMap[order.id];
    return {
      id: order.id,
      order_number: order.orderNumber,
      status: order.status.toUpperCase(),
      total: Number(order.total),
      created_at: order.createdAt.toISOString(),
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone ?? null,
      item_count: countMap[order.id] ?? 0,
      first_item_name: fi?.productNameSnapshot ?? "-",
      first_item_image: fi ? (imageMap[fi.productId] ?? null) : null,
      payment_status: pmt ? pmt.status.toUpperCase() : "PENDING",
      payment_method: pmt ? pmt.paymentType : "-",
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
    },
  });
}
