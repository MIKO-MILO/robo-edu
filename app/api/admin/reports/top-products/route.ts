import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orderItems, orders, products } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/reports/top-products
 *
 * Query params:
 *   from   — ISO date string for the start of the range (inclusive, against orders.createdAt)
 *   to     — ISO date string for the end of the range (inclusive, end of day)
 *   limit  — number of top products to return (default: 10, max: 100)
 *
 * Returns:
 *   products — array ranked by total units sold DESC, each entry includes:
 *     product_id, product_name, total_sold (units), total_revenue
 *
 * Only order items belonging to paid orders (orders.paidAt IS NOT NULL) are
 * counted — consistent with the sales report and the dashboard revenue logic.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const limitParam = searchParams.get("limit") ?? "10";

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

  const limitNum = Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 100);

  // Make `to` inclusive by setting time to end-of-day
  toDate.setHours(23, 59, 59, 999);

  // Join order_items → orders (paid + in date range) → products
  const rows = await db
    .select({
      product_id: orderItems.productId,
      product_name: products.name,
      total_sold: sql<string>`SUM(${orderItems.quantity})`,
      total_revenue: sql<string>`COALESCE(SUM(${orderItems.subtotal}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(
      and(
        isNotNull(orders.paidAt),
        gte(orders.createdAt, fromDate),
        lte(orders.createdAt, toDate),
      ),
    )
    .groupBy(orderItems.productId, products.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(limitNum);

  return NextResponse.json({
    success: true,
    data: {
      products: rows.map((r) => ({
        product_id: r.product_id,
        product_name: r.product_name,
        total_sold: Number(r.total_sold),
        total_revenue: Number(r.total_revenue),
      })),
    },
  });
}
