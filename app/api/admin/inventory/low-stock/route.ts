import { NextRequest, NextResponse } from "next/server";
import { eq, sql, asc } from "drizzle-orm";

import { db } from "@/src/db";
import { productVariants, products } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

/**
 * GET /api/admin/inventory/low-stock
 *
 * Lists product variants whose stock has fallen at or below their per-variant
 * `low_stock_threshold` (added in ticket 01) so the admin inventory dashboard
 * can surface what needs reordering. Each row carries the product name,
 * variant name, current stock, and the threshold that was tripped.
 *
 * "Low stock" = `stock <= low_stock_threshold`. A threshold of 0 means alerts
 * are disabled for that variant (the column default, documented in
 * `src/db/schema/product-variant.ts`), so such variants are never flagged here
 * — even when stock is 0 — to keep the view free of rows the admin never opted
 * in to monitor. The threshold itself is configurable per variant through the
 * admin product-variant management.
 *
 * The response uses the legacy collection envelope (`{ success, data, meta }`)
 * so the frontend consumers (`getLowStockItems` /
 * `adminService.getLowStockInventory`) can read it directly. Optional
 * `page` / `limit` query params drive the pagination `meta`.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 50));
  const offset = (page - 1) * limit;

  // Variants at or below their own threshold; threshold 0 (alerts disabled) is
  // excluded so unconfigured variants never surface as low-stock noise.
  const where = sql`${productVariants.stock} <= ${productVariants.lowStockThreshold} AND ${productVariants.lowStockThreshold} > 0`;

  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        product_id: products.id,
        product_name: products.name,
        variant_id: productVariants.id,
        variant_name: productVariants.variantName,
        stock: productVariants.stock,
        threshold: productVariants.lowStockThreshold,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(where)
      // Most-depleted first, then deterministic by name.
      .orderBy(
        asc(productVariants.stock),
        asc(products.name),
        asc(productVariants.variantName),
      )
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productVariants)
      .where(where),
  ]);

  const total = Number(countRow?.count ?? 0);

  return NextResponse.json({
    success: true,
    data: rows,
    meta: {
      current_page: page,
      per_page: limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      total_count: total,
    },
  });
}
