import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

type RouteParams = { params: Promise<{ id: string }> };

// ── Helpers ────────────────────────────────────────────────────────────────

async function buildProductDetail(productId: string) {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      description: products.description,
      status: products.status,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
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
    .where(eq(products.id, productId));

  if (!row) return null;

  const variantRows = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const imageRows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.sortOrder);

  const baseVariant = variantRows[0];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description ?? null,
    status: row.status.toUpperCase(),
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug! }
      : null,
    product_type: row.productTypeId
      ? { id: row.productTypeId, name: row.productTypeName!, slug: row.productTypeSlug! }
      : null,
    price: {
      base_price: baseVariant ? Number(baseVariant.price) : 0,
      reseller_price: baseVariant ? Number(baseVariant.resellerPrice) : null,
      currency: "IDR" as const,
    },
    variants: variantRows.map((v) => ({
      id: v.id,
      product_id: v.productId,
      variant_name: v.variantName,
      sku: v.sku,
      price: Number(v.price),
      reseller_price: Number(v.resellerPrice),
      stock: v.stock,
      weight: v.weight ?? null,
      status: v.status.toUpperCase(),
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    })),
    images: imageRows.map((img) => ({
      id: img.id,
      product_id: img.productId,
      variant_id: img.variantId ?? null,
      image_url: img.imageUrl,
      alt_text: img.altText ?? null,
      sort_order: img.sortOrder,
      is_primary: img.isPrimary,
      created_at: img.createdAt,
      updated_at: img.updatedAt,
    })),
    rating: { average: 0, count: 0 },
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

// ── GET /api/admin/products/:id ────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const detail = await buildProductDetail(id);

  if (!detail) {
    return NextResponse.json(
      { success: false, message: "Produk tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: detail });
}

// ── PATCH /api/admin/products/:id ──────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Pastikan produk ada
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Produk tidak ditemukan." },
      { status: 404 },
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

  const { category_id, product_type_id, name, slug, sku, description, status } = body as {
    category_id?: string;
    product_type_id?: string;
    name?: string;
    slug?: string;
    sku?: string;
    description?: string;
    status?: string;
  };

  // Cek slug duplikat (kecuali milik produk ini sendiri)
  if (slug) {
    const [dup] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (dup && dup.id !== id) {
      return NextResponse.json(
        { success: false, message: "Slug sudah digunakan produk lain." },
        { status: 422 },
      );
    }
  }

  // Cek sku duplikat (kecuali milik produk ini sendiri)
  if (sku) {
    const [dup] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);
    if (dup && dup.id !== id) {
      return NextResponse.json(
        { success: false, message: "SKU sudah digunakan produk lain." },
        { status: 422 },
      );
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (sku !== undefined) updateData.sku = sku;
  if (description !== undefined) updateData.description = description;
  if (category_id !== undefined) updateData.categoryId = category_id;
  if (product_type_id !== undefined) updateData.productTypeId = product_type_id;
  if (status !== undefined) updateData.status = status.toLowerCase();

  await db.update(products).set(updateData).where(eq(products.id, id));

  const detail = await buildProductDetail(id);

  return NextResponse.json({ success: true, data: detail });
}

// ── DELETE /api/admin/products/:id ─────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Produk tidak ditemukan." },
      { status: 404 },
    );
  }

  // Hard delete — hapus permanen dari DB (cascade ke variants & images)
  await db.delete(products).where(eq(products.id, id));

  return NextResponse.json({
    success: true,
    data: { message: "Produk berhasil dihapus." },
  });
}
