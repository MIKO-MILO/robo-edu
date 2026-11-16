import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { parseReportDateRange } from "@/src/lib/reports/date-range";

export const runtime = "nodejs";

/**
 * GET /api/admin/reports/order-status
 *
 * Query params:
 *   start_date  — ISO date string for the start of the range (inclusive)
 *   end_date    — ISO date string for the end of the range (inclusive)
 *
 * Defaults to the current calendar month when start_date / end_date are
 * not provided.
 *
 * Returns count and total amount per order status (PENDING, PAID,
 * PROCESSING, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED) for the
 * given date range. Unlike the payment-methods and category-sales endpoints,
 * ALL orders in the range are included regardless of payment state — the
 * purpose is to show the full status distribution.
 *
 * The status is normalised to uppercase so consumers can match against the
 * documented OrderStatus enum without worrying about case drift.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const parsed = parseReportDateRange(searchParams);
  if ("error" in parsed) return parsed.error;
  const { startDate, endDate } = parsed.range;

  const dateFilter = and(
    gte(orders.createdAt, startDate),
    lte(orders.createdAt, endDate),
  );

  // Group by UPPER(status) to normalise case across DB rows
  const rows = await db
    .select({
      status: sql<string>`UPPER(${orders.status})`,
      count: count(),
      total_amount: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(dateFilter)
    .groupBy(sql`UPPER(${orders.status})`)
    .orderBy(desc(count()));

  // ── Summary ───────────────────────────────────────────────────────────────
  const [summary] = await db
    .select({
      total_orders: count(),
      total_amount: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(dateFilter);

  const totalOrders = Number(summary.total_orders);
  const totalAmount = Number(summary.total_amount);

  return NextResponse.json({
    success: true,
    data: {
      statuses: rows.map((r) => ({
        status: r.status,
        count: Number(r.count),
        total_amount: Number(r.total_amount),
        percentage:
          totalOrders > 0
            ? Math.round((Number(r.count) / totalOrders) * 1000) / 10
            : 0,
      })),
      summary: {
        total_orders: totalOrders,
        total_amount: totalAmount,
      },
    },
  });
}
