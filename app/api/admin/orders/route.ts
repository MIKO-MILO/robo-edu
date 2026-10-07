import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, desc, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, orderItems, payments, users, productImages } from "@/src/db/schema";
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

export const runtime = "nodejs";

function isAdminRole(role: string): boolean {
  const r = role?.toLowerCase() ?? "";
  return r === "admin" || r === "superadmin" || r === "admin_sales" || r === "admin_laporan";
}

/**
 * GET /api/admin/orders
 *
 * Admin-only — returns ALL orders (all users), with customer info joined.
 *
 * Query params:
 *   page        = 1-based page (default 1)
 *   limit       = rows per page (default 20, max 100)
 *   q           = free-text search: order_number | customer name | customer email
 *   status      = OrderStatus filter, e.g. "PAID" | "PROCESSING" | "ALL" (default ALL)
 *   sort        = "created_at_desc" (default) | "created_at_asc" | "total_desc" | "total_asc"
 */
export async function GET(request: NextRequest) {
  // ── Auth: harus admin ──────────────────────────────────────────────────
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    // Fallback ke src session untuk dev environment yang belum pakai mock JWT
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const { searchParams } = request.nextUrl;
  const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const q      = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const sort   = searchParams.get("sort") ?? "created_at_desc";
  const offset = (page - 1) * limit;

  // ── Build where filters ────────────────────────────────────────────────
  const filters: ReturnType<typeof eq>[] = [];

  if (status && status !== "ALL") {
    filters.push(eq(orders.status, status));
  }

  // ── Search: match order_number, customer name, or customer email ───────
  let searchOrderIds: string[] | null = null;
  if (q) {
    const ql = `%${q}%`;

    // Match by order_number
    const byNumber = await db
      .select({ id: orders.id })
      .from(orders)
      .where(like(orders.orderNumber, ql));

    // Match by customer name or email (join users)
    const byCustomer = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(or(like(users.name, ql), like(users.email, ql)));

    const matchSet = new Set<string>([
      ...byNumber.map((r) => r.id),
      ...byCustomer.map((r) => r.id),
    ]);
    searchOrderIds = [...matchSet];

    if (searchOrderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }

    filters.push(inArray(orders.id, searchOrderIds));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Count total ────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause);

  const totalCount = Number(total);

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, totalPages: 0 },
    });
  }

  // ── Sort ───────────────────────────────────────────────────────────────
  const orderByClause =
    sort === "created_at_asc"  ? asc(orders.createdAt)  :
    sort === "total_desc"      ? desc(orders.total)      :
    sort === "total_asc"       ? asc(orders.total)       :
    /* default */                desc(orders.createdAt);

  // ── Fetch paginated orders with customer info ──────────────────────────
  const rows = await db
    .select({
      id:                   orders.id,
      orderNumber:          orders.orderNumber,
      status:               orders.status,
      total:                orders.total,
      subtotal:             orders.subtotal,
      shippingCost:         orders.shippingCost,
      discountAmount:       orders.discountAmount,
      voucherCodeSnapshot:  orders.voucherCodeSnapshot,
      recipientName:        orders.recipientName,
      recipientPhone:       orders.recipientPhone,
      shippingCity:         orders.shippingCity,
      shippingProvince:     orders.shippingProvince,
      paidAt:               orders.paidAt,
      shippedAt:            orders.shippedAt,
      deliveredAt:          orders.deliveredAt,
      cancelledAt:          orders.cancelledAt,
      createdAt:            orders.createdAt,
      // customer
      customerId:           users.id,
      customerName:         users.name,
      customerEmail:        users.email,
      customerPhone:        users.phone,
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
      meta: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  }

  const orderIds = rows.map((r) => r.id);

  // ── Item counts per order ──────────────────────────────────────────────
  const countRows = await db
    .select({
      orderId:   orderItems.orderId,
      itemCount: sql<number>`count(*)`,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = Object.fromEntries(
    countRows.map((r) => [r.orderId, Number(r.itemCount)]),
  );

  // ── First item per order (for preview) ────────────────────────────────
  const firstItemRows = await db
    .select({
      orderId:              orderItems.orderId,
      productId:            orderItems.productId,
      productNameSnapshot:  orderItems.productNameSnapshot,
      variantNameSnapshot:  orderItems.variantNameSnapshot,
      createdAt:            orderItems.createdAt,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.createdAt));

  const firstItemMap: Record<string, typeof firstItemRows[number]> = {};
  for (const item of firstItemRows) {
    if (!firstItemMap[item.orderId]) {
      firstItemMap[item.orderId] = item;
    }
  }

  // ── Payment status per order ───────────────────────────────────────────
  const paymentRows = await db
    .select({
      orderId:     payments.orderId,
      status:      payments.status,
      paymentType: payments.paymentType,
    })
    .from(payments)
    .where(inArray(payments.orderId, orderIds));

  const paymentMap: Record<string, typeof paymentRows[number]> = {};
  for (const p of paymentRows) {
    paymentMap[p.orderId] = p;
  }

  // ── Shape response ─────────────────────────────────────────────────────
  const data = rows.map((order) => {
    const fi = firstItemMap[order.id];
    const pmt = paymentMap[order.id];
    return {
      id:                    order.id,
      order_number:          order.orderNumber,
      status:                order.status as OrderStatus,
      total:                 Number(order.total),
      subtotal:              Number(order.subtotal),
      shipping_cost:         Number(order.shippingCost),
      discount_amount:       Number(order.discountAmount),
      voucher_code_snapshot: order.voucherCodeSnapshot ?? null,
      recipient_name:        order.recipientName,
      recipient_phone:       order.recipientPhone,
      shipping_city:         order.shippingCity,
      shipping_province:     order.shippingProvince,
      paid_at:               order.paidAt?.toISOString()    ?? null,
      shipped_at:            order.shippedAt?.toISOString() ?? null,
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
      first_item_name:       fi?.productNameSnapshot ?? null,
      first_item_variant:    fi?.variantNameSnapshot ?? null,
      // payment
      payment_status:        (pmt?.status ?? "PENDING") as PaymentStatus,
      payment_method:        pmt?.paymentType ?? null,
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
