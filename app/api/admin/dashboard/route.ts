import { NextRequest, NextResponse } from "next/server";
import {
  and,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lt,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "@/src/db";
import {
  orders,
  orderItems,
  users,
  products,
  productVariants,
} from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { getLowStockDefaultThreshold } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/admin/dashboard
 *
 * Returns:
 *  - revenue_this_month         — SUM(total) for orders paid within the current calendar month
 *  - revenue_trend_percentage   — % change vs last month (null when last month = 0)
 *  - total_orders               — COUNT(*) all orders
 *  - pending_orders             — COUNT(*) orders with status = "pending"
 *  - total_customers            — COUNT(*) users with role = "CUSTOMER"
 *  - top_products               — up to 5 products by total quantity sold (paid orders this month)
 *  - low_stock_products         — up to 10 variants with stock <= low_stock_threshold
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // ── 1. Revenue this month (paid orders) ────────────────────────────────
  const [{ revenueThisMonth }] = await db
    .select({
      revenueThisMonth: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.paidAt, firstDayThisMonth),
        lt(orders.paidAt, firstDayNextMonth),
      ),
    );

  // ── 2. Revenue last month (for trend calculation) ──────────────────────
  const [{ revenueLastMonth }] = await db
    .select({
      revenueLastMonth: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.paidAt, firstDayLastMonth),
        lt(orders.paidAt, firstDayThisMonth),
      ),
    );

  const revenueThisMonthNum = Number(revenueThisMonth);
  const revenueLastMonthNum = Number(revenueLastMonth);
  const revenueTrendPercentage =
    revenueLastMonthNum === 0
      ? null
      : Math.round(
          ((revenueThisMonthNum - revenueLastMonthNum) /
            revenueLastMonthNum) *
            100 *
            100,
        ) / 100;

  // ── 3. Total orders (all-time) ──────────────────────────────────────────
  const [{ totalOrders }] = await db
    .select({ totalOrders: count() })
    .from(orders);

  // ── 4. Pending orders ──────────────────────────────────────────────────
  const [{ pendingOrders }] = await db
    .select({ pendingOrders: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));

  // ── 5. Total customers ─────────────────────────────────────────────────
  const [{ totalCustomers }] = await db
    .select({ totalCustomers: count() })
    .from(users)
    .where(eq(users.role, "CUSTOMER"));

  // ── 6. Top products (by quantity sold, paid orders this month) ─────────
  const topProductRows = await db
    .select({
      product_id: orderItems.productId,
      name: orderItems.productNameSnapshot,
      total_sold: sql<number>`CAST(SUM(${orderItems.quantity}) AS UNSIGNED)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.paidAt, firstDayThisMonth),
        lt(orders.paidAt, firstDayNextMonth),
      ),
    )
    .groupBy(orderItems.productId, orderItems.productNameSnapshot)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(5);

  // ── 7. Low stock products ──────────────────────────────────────────────
  // Effective threshold = per-variant value when configured (> 0),
  // otherwise fall back to the global default from settings (default: 5).
  // A variant with threshold = 0 means "not yet configured", NOT "disabled".
  const globalThreshold = await getLowStockDefaultThreshold();

  const lowStockRows = await db
    .select({
      product_id: productVariants.productId,
      name: products.name,
      variant_id: productVariants.id,
      variant_name: productVariants.variantName,
      stock: productVariants.stock,
      threshold: productVariants.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      sql`${productVariants.stock} <= IF(${productVariants.lowStockThreshold} > 0, ${productVariants.lowStockThreshold}, ${globalThreshold})`,
    )
    .orderBy(productVariants.stock)
    .limit(10);

  return NextResponse.json({
    success: true,
    data: {
      revenue_this_month: revenueThisMonthNum,
      revenue_trend_percentage: revenueTrendPercentage,
      total_orders: Number(totalOrders),
      pending_orders: Number(pendingOrders),
      total_customers: Number(totalCustomers),
      top_products: topProductRows.map((r) => ({
        product_id: r.product_id,
        name: r.name,
        total_sold: Number(r.total_sold),
      })),
      low_stock_products: lowStockRows.map((r) => ({
        product_id: r.product_id,
        name: r.name,
        variant_id: r.variant_id,
        variant_name: r.variant_name,
        stock: r.stock,
        threshold: r.threshold,
      })),
    },
  });
}
