import { NextRequest, NextResponse } from "next/server";
import { and, count, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/reports/sales
 *
 * Query params:
 *   from  — ISO date string for the start of the range (inclusive, compared against createdAt)
 *   to    — ISO date string for the end of the range (inclusive, end of day)
 *
 * Returns:
 *   summary          — overall revenue + transaction count for the range
 *   by_day           — per-day breakdown (date string, revenue, transaction_count)
 *   by_week          — per-week breakdown (YYYY-Www label, revenue, transaction_count)
 *   by_month         — per-month breakdown (YYYY-MM label, revenue, transaction_count)
 *
 * Only orders that have been paid (paidAt IS NOT NULL) are included in the
 * revenue and transaction count — consistent with the dashboard route.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam || !toParam) {
    return NextResponse.json(
      {
        success: false,
        message: "Parameter 'from' dan 'to' wajib diisi (format ISO date).",
      },
      { status: 400 },
    );
  }

  const fromDate = new Date(fromParam);
  const toDate = new Date(toParam);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json(
      {
        success: false,
        message: "Format tanggal tidak valid. Gunakan format ISO date.",
      },
      { status: 400 },
    );
  }

  // Make `to` inclusive by setting time to end-of-day
  toDate.setHours(23, 59, 59, 999);

  const dateFilter = and(
    isNotNull(orders.paidAt),
    gte(orders.createdAt, fromDate),
    lte(orders.createdAt, toDate),
  );

  // ── Summary (overall totals for the range) ────────────────────────────────
  const [summary] = await db
    .select({
      total_revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      transaction_count: count(),
    })
    .from(orders)
    .where(dateFilter);

  // ── Per-day breakdown ─────────────────────────────────────────────────────
  const byDayRows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      transaction_count: count(),
    })
    .from(orders)
    .where(dateFilter)
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // ── Per-week breakdown (ISO year-week) ───────────────────────────────────
  const byWeekRows = await db
    .select({
      week: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-W%v')`,
      revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      transaction_count: count(),
    })
    .from(orders)
    .where(dateFilter)
    .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-W%v')`)
    .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-W%v')`);

  // ── Per-month breakdown ───────────────────────────────────────────────────
  const byMonthRows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`,
      revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      transaction_count: count(),
    })
    .from(orders)
    .where(dateFilter)
    .groupBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${orders.createdAt}, '%Y-%m')`);

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        total_revenue: Number(summary.total_revenue),
        transaction_count: Number(summary.transaction_count),
      },
      by_day: byDayRows.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        transaction_count: Number(r.transaction_count),
      })),
      by_week: byWeekRows.map((r) => ({
        week: r.week,
        revenue: Number(r.revenue),
        transaction_count: Number(r.transaction_count),
      })),
      by_month: byMonthRows.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
        transaction_count: Number(r.transaction_count),
      })),
    },
  });
}
