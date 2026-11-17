import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { parseReportDateRange } from "@/src/lib/reports/date-range";

export const runtime = "nodejs";

/**
 * GET /api/admin/reports/payment-methods
 *
 * Query params:
 *   start_date  — ISO date string for the start of the range (inclusive)
 *   end_date    — ISO date string for the end of the range (inclusive)
 *
 * Defaults to the current calendar month when start_date / end_date are
 * not provided.
 *
 * Returns a breakdown of transaction count and revenue per `payment_type` /
 * `payment_channel` for the given date range. Only orders with
 * `paid_at IS NOT NULL` are counted — consistent with the sales report and
 * dashboard revenue logic.
 *
 * Only successful payment attempts (status IN ('settlement', 'capture',
 * 'PAID')) are included so that failed/expired retries are not counted.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const parsed = parseReportDateRange(searchParams);
  if ("error" in parsed) return parsed.error;
  const { startDate, endDate } = parsed.range;

  // Join orders → payments, filter to paid orders in the date range with a
  // successful payment status. Group by payment_type and payment_channel.
  const rows = await db
    .select({
      payment_type: payments.paymentType,
      payment_channel: payments.paymentChannel,
      transaction_count: count(),
      total_revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
        // Only count successful payment attempts
        sql`${payments.status} IN ('settlement', 'capture', 'PAID')`,
      ),
    )
    .groupBy(payments.paymentType, payments.paymentChannel)
    .orderBy(desc(sql`COALESCE(SUM(${orders.total}), 0)`));

  // ── Summary (overall totals for the range) ──────────────────────────────
  const [summary] = await db
    .select({
      total_transactions: count(),
      total_revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .innerJoin(payments, eq(payments.orderId, orders.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate),
        sql`${payments.status} IN ('settlement', 'capture', 'PAID')`,
      ),
    );

  const totalRevenue = Number(summary.total_revenue);

  return NextResponse.json({
    success: true,
    data: {
      methods: rows.map((r) => ({
        payment_type: r.payment_type,
        payment_channel: r.payment_channel,
        transaction_count: Number(r.transaction_count),
        total_revenue: Number(r.total_revenue),
        percentage:
          totalRevenue > 0
            ? Math.round((Number(r.total_revenue) / totalRevenue) * 1000) / 10
            : 0,
      })),
      summary: {
        total_transactions: Number(summary.total_transactions),
        total_revenue: totalRevenue,
      },
    },
  });
}
