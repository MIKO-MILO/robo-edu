import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { categories, orderItems, orders, products } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { parseReportDateRange } from "@/src/lib/reports/date-range";

export const runtime = "nodejs";

/**
 * GET /api/admin/reports/category-sales
 *
 * Query params:
 *   start_date  — ISO date string for the start of the range (inclusive)
 *   end_date    — ISO date string for the end of the range (inclusive)
 *
 * Defaults to the current calendar month when start_date / end_date are
 * not provided.
 *
 * Returns total units sold and revenue per product category by joining
 * order_items → products → categories. Only items belonging to paid orders
 * (orders.paid_at IS NOT NULL) are counted — consistent with the sales
 * report and top-products endpoint.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const parsed = parseReportDateRange(searchParams);
  if ("error" in parsed) return parsed.error;
  const { startDate, endDate } = parsed.range;

  // Join order_items → orders (paid + in date range) → products → categories
  const rows = await db
    .select({
      category_id: categories.id,
      category_name: categories.name,
      total_sold: sql<string>`SUM(${orderItems.quantity})`,
      total_revenue: sql<string>`COALESCE(SUM(${orderItems.subtotal}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
      ),
    )
    .groupBy(categories.id, categories.name)
    .orderBy(desc(sql`COALESCE(SUM(${orderItems.subtotal}), 0)`));

  // ── Summary ───────────────────────────────────────────────────────────────
  const [summary] = await db
    .select({
      total_sold: sql<string>`COALESCE(SUM(${orderItems.quantity}), 0)`,
      total_revenue: sql<string>`COALESCE(SUM(${orderItems.subtotal}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
      ),
    );

  const totalSold = Number(summary.total_sold);
  const totalRevenue = Number(summary.total_revenue);

  return NextResponse.json({
    success: true,
    data: {
      categories: rows.map((r) => ({
        category_id: r.category_id,
        category_name: r.category_name,
        total_sold: Number(r.total_sold),
        total_revenue: Number(r.total_revenue),
        percentage:
          totalRevenue > 0
            ? Math.round((Number(r.total_revenue) / totalRevenue) * 1000) / 10
            : 0,
      })),
      summary: {
        total_sold: totalSold,
        total_revenue: totalRevenue,
      },
    },
  });
}
