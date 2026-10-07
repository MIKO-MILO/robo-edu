import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/src/db";
import { products, productVariants } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/products/:id/variants
 * Body: { variant_name, sku, price, reseller_price, stock, weight?, status? }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: productId } = await params;

  // Pastikan produk ada
  const [existing] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
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

  const { variant_name, sku, price, reseller_price, stock, weight, status } = body as {
    variant_name?: string;
    sku?: string;
    price?: number;
    reseller_price?: number;
    stock?: number;
    weight?: number;
    status?: string;
  };

  if (!variant_name || !sku || price === undefined) {
    return NextResponse.json(
      { success: false, message: "Field variant_name, sku, dan price wajib diisi." },
      { status: 422 },
    );
  }

  // Cek sku variant duplikat
  const [dupSku] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.sku, sku))
    .limit(1);

  if (dupSku) {
    return NextResponse.json(
      { success: false, message: "SKU varian sudah digunakan." },
      { status: 422 },
    );
  }

  const variantId = randomUUID();

  await db.insert(productVariants).values({
    id: variantId,
    productId,
    variantName: variant_name,
    sku,
    price: String(price),
    resellerPrice: String(reseller_price ?? price),
    stock: stock ?? 0,
    weight: weight ?? 0,
    status: (status ?? "active").toLowerCase(),
  });

  const [created] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId));

  return NextResponse.json(
    {
      success: true,
      data: {
        id: created.id,
        product_id: created.productId,
        variant_name: created.variantName,
        sku: created.sku,
        price: Number(created.price),
        reseller_price: Number(created.resellerPrice),
        stock: created.stock,
        weight: created.weight ?? null,
        status: created.status.toUpperCase(),
        created_at: created.createdAt,
        updated_at: created.updatedAt,
      },
    },
    { status: 201 },
  );
}
