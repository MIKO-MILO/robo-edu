import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, like, or, sql } from "drizzle-orm";

import { db } from "@/src/db";
import { productVariants, products, categories } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import { getLowStockDefaultThreshold } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/admin/inventory
 *
 * Lists every product variant joined with its parent product and category,
 * flattened into `InventoryVariantRow` rows for the admin inventory
 * monitoring page. This is the primary read endpoint — the `low-stock`
 * sub-route covers the alert subset, while this route shows the full table.
 *
 * Query params:
 *  - search    — matches product name, product SKU, variant name, or variant SKU
 *  - status    — product variant status (ACTIVE, INACTIVE, OUT_OF_STOCK, …)
 *  - low_stock — "1" or "true" to filter to variants at/below their threshold
 *  - page / limit — pagination (default 15, max 100)
 *
 * The `low_stock` filter uses the same definition as the low-stock endpoint:
 * `stock <= low_stock_threshold AND low_stock_threshold > 0`. A threshold of 0
 * means alerts are disabled for that variant, so such variants are excluded
 * from the filtered view even when stock is 0.
 *
 * Status is stored lowercase in the DB but returned uppercase to match the
 * `ProductStatus` union. `price` is `decimal(15,2)` in DB (returned as string
 * by the driver) and converted to `number` for the `Money` type.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";
  const lowStockParam = searchParams.get("low_stock");
  const lowStock = lowStockParam === "1" || lowStockParam === "true";

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 15));
  const offset = (page - 1) * limit;

  // ── Build WHERE conditions ───────────────────────────────────────────────
  const filters = [];

  if (search) {
    filters.push(
      or(
        like(products.name, `%${search}%`),
        like(products.sku, `%${search}%`),
        like(productVariants.sku, `%${search}%`),
        like(productVariants.variantName, `%${search}%`),
      )!,
    );
  }

  if (status) {
    // DB stores lowercase; query param arrives uppercase from the frontend.
    filters.push(eq(productVariants.status, status.toLowerCase()));
  }

  if (lowStock) {
    // Same condition as /api/admin/inventory/low-stock: use per-variant
    // threshold when configured (> 0), otherwise fall back to global default.
    const globalThreshold = await getLowStockDefaultThreshold();
    filters.push(
      sql`${productVariants.stock} <= IF(${productVariants.lowStockThreshold} > 0, ${productVariants.lowStockThreshold}, ${globalThreshold})`,
    );
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Rows + total count in parallel ─────────────────────────────────────────
  // Both joins are innerJoin — productId and categoryId are NOT NULL, so no
  // rows are dropped.
  const [rows, [countRow]] = await Promise.all([
    db
      .select({
        variant_id: productVariants.id,
        variant_name: productVariants.variantName,
        variant_sku: productVariants.sku,
        stock: productVariants.stock,
        status: productVariants.status,
        product_id: products.id,
        product_name: products.name,
        product_sku: products.sku,
        category_name: categories.name,
        price: productVariants.price,
        updated_at: productVariants.updatedAt,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause)
      .orderBy(asc(products.name), asc(productVariants.variantName))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause),
  ]);

  const total = Number(countRow?.count ?? 0);

  // ── Map to DTO ────────────────────────────────────────────────────────────
  // Decimal price → number; status lowercase → uppercase.
  const data = rows.map((r) => ({
    variant_id: r.variant_id,
    variant_name: r.variant_name,
    variant_sku: r.variant_sku,
    stock: r.stock,
    status: r.status.toUpperCase(),
    product_id: r.product_id,
    product_name: r.product_name,
    product_sku: r.product_sku,
    category_name: r.category_name,
    price: Number(r.price),
    updated_at: r.updated_at,
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: {
      current_page: page,
      per_page: limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
      total_count: total,
    },
  });
}
