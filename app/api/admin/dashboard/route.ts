import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, orderItems, users, productImages } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/dashboard
 *
 * Aggregates the following from the DB:
 *  - total_orders_all_time      — COUNT(*) from orders
 *  - total_orders_this_month    — COUNT(*) for orders created this calendar month
 *  - total_revenue              — SUM(total) for orders that have been paid
 *                                  (paidAt IS NOT NULL, i.e. status >= PAID)
 *  - total_customers            — COUNT(*) of users with role = "CUSTOMER"
 *  - pending_orders             — COUNT(*) of orders with status = "pending"
 *  - recent_orders              — 5 most recent orders with customer info
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  // ── 1. Total orders (all-time) ──────────────────────────────────────────
  const [{ totalOrdersAllTime }] = await db
    .select({ totalOrdersAllTime: count() })
    .from(orders);

  // ── 2. Total orders (this calendar month) ──────────────────────────────
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [{ totalOrdersThisMonth }] = await db
    .select({ totalOrdersThisMonth: count() })
    .from(orders)
    .where(gte(orders.createdAt, firstDayOfMonth));

  // ── 3. Total revenue from paid orders ──────────────────────────────────
  // An order is "paid" once `paid_at` is set (Midtrans callback confirmed it).
  // We sum `total` — the final charge the customer paid.
  const [{ totalRevenue }] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(isNotNull(orders.paidAt));

  // ── 4. Total customers ─────────────────────────────────────────────────
  // "Customers" = users with role CUSTOMER (case-insensitive stored as "CUSTOMER").
  const [{ totalCustomers }] = await db
    .select({ totalCustomers: count() })
    .from(users)
    .where(eq(users.role, "CUSTOMER"));

  // ── 5. Pending orders ──────────────────────────────────────────────────
  const [{ pendingOrders }] = await db
    .select({ pendingOrders: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));

  // ── 6. 5 most recent orders with customer name and email ───────────────
  const recentOrderRows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const recentOrders = recentOrderRows.map((r) => ({
    id: r.id,
    order_number: r.orderNumber,
    status: r.status,
    total: Number(r.total),
    created_at: r.createdAt.toISOString(),
    customer_name: r.customerName,
    customer_email: r.customerEmail,
  }));

  return NextResponse.json({
    success: true,
    data: {
      total_orders_all_time: Number(totalOrdersAllTime),
      total_orders_this_month: Number(totalOrdersThisMonth),
      total_revenue: Number(totalRevenue),
      total_customers: Number(totalCustomers),
      pending_orders: Number(pendingOrders),
      recent_orders: recentOrders,
    },
  });
}
