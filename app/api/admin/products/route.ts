import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/src/db";
import {
  products,
  categories,
  productTypes,
  productVariants,
  productImages,
} from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/admin/products
 * Query params: search, category (slug), product_type (slug), status, page, limit
 */
export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";
  const productType = searchParams.get("product_type")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
  const offset = (page - 1) * limit;

  // ── Filters ─────────────────────────────────────────────────────────────
  const filters = [];

  if (search) {
    filters.push(
      or(
        like(products.name, `%${search}%`),
        like(products.sku, `%${search}%`),
      )!,
    );
  }

  if (category) {
    filters.push(eq(categories.slug, category));
  }

  if (productType) {
    filters.push(eq(productTypes.slug, productType));
  }

  if (status) {
    filters.push(eq(products.status, status.toLowerCase()));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // ── Total count ──────────────────────────────────────────────────────────
  const [totalResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${products.id})` })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
    .where(whereClause);

  const total = Number(totalResult?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  // ── Rows ─────────────────────────────────────────────────────────────────
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      status: products.status,

      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,

      basePrice: sql<string | null>`MIN(
        CASE WHEN ${productVariants.status} = 'active' THEN ${productVariants.price} END
      )`,
      resellerPrice: sql<string | null>`MIN(
        CASE WHEN ${productVariants.status} = 'active' THEN ${productVariants.resellerPrice} END
      )`,

      ratingAverage: sql<number | null>`NULL`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .where(whereClause)
    .groupBy(
      products.id,
      products.name,
      products.slug,
      products.sku,
      products.status,
      categories.id,
      categories.name,
      categories.slug,
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);

  // ── Thumbnail images — batch query per product IDs ───────────────────────
  // Primary image diutamakan; fallback ke sort_order terkecil.
  const productIds = rows.map((r) => r.id);
  const imageMap: Record<string, string> = {};

  if (productIds.length > 0) {
    const imageRows = await db
      .select({
        productId: productImages.productId,
        imageUrl: productImages.imageUrl,
        isPrimary: productImages.isPrimary,
        sortOrder: productImages.sortOrder,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    for (const row of imageRows) {
      if (!imageMap[row.productId]) {
        imageMap[row.productId] = row.imageUrl;
      }
    }
  }

  const data = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    sku: r.sku,
    status: r.status.toUpperCase(),
    category: r.categoryId
      ? { id: r.categoryId, name: r.categoryName!, slug: r.categorySlug! }
      : null,
    primary_image_url: imageMap[r.id] ?? null,
    price: {
      base_price: r.basePrice ? Number(r.basePrice) : 0,
      reseller_price: r.resellerPrice ? Number(r.resellerPrice) : null,
    },
    rating_average: r.ratingAverage ?? null,
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: {
      current_page: page,
      per_page: limit,
      total_pages: totalPages,
      total_count: total,
    },
  });
}

/**
 * POST /api/admin/products
 * Body: { category_id, product_type_id, name, slug, sku, description?, status? }
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body tidak valid." },
      { status: 400 },
    );
  }

  const { category_id, product_type_id, name, slug, sku, description } = body as {
    category_id?: string;
    product_type_id?: string;
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
  };

  if (!name || !slug || !sku || !category_id || !product_type_id) {
    return NextResponse.json(
      { success: false, message: "Field name, slug, sku, category_id, dan product_type_id wajib diisi." },
      { status: 422 },
    );
  }

  // Cek slug / sku duplikat
  const [dupSlug] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (dupSlug) {
    return NextResponse.json(
      { success: false, message: "Slug sudah digunakan produk lain." },
      { status: 422 },
    );
  }

  const [dupSku] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  if (dupSku) {
    return NextResponse.json(
      { success: false, message: "SKU sudah digunakan produk lain." },
      { status: 422 },
    );
  }

  const id = randomUUID();

  await db.insert(products).values({
    id,
    categoryId: category_id,
    productTypeId: product_type_id,
    name,
    slug,
    sku,
    description: description ?? null,
    status: "active",
  });

  // Ambil data lengkap dengan relasi
  const [created] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      status: products.status,
      description: products.description,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      productTypeId: productTypes.id,
      productTypeName: productTypes.name,
      productTypeSlug: productTypes.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
    .where(eq(products.id, id));

  return NextResponse.json(
    {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        sku: created.sku,
        description: created.description ?? null,
        status: created.status.toUpperCase(),
        category: created.categoryId
          ? { id: created.categoryId, name: created.categoryName!, slug: created.categorySlug! }
          : null,
        product_type: created.productTypeId
          ? { id: created.productTypeId, name: created.productTypeName!, slug: created.productTypeSlug! }
          : null,
        variants: [],
        images: [],
        price: { base_price: 0, reseller_price: null, currency: "IDR" },
        rating: { average: 0, count: 0 },
      },
    },
    { status: 201 },
  );
}
