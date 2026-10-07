import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { productVariants } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/product-variants/:id
 * Body: { variant_name?, sku?, price?, reseller_price?, stock?, weight?, status? }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Varian tidak ditemukan." },
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

  // Cek sku duplikat (kecuali milik varian ini sendiri)
  if (sku) {
    const [dup] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.sku, sku))
      .limit(1);
    if (dup && dup.id !== id) {
      return NextResponse.json(
        { success: false, message: "SKU sudah digunakan varian lain." },
        { status: 422 },
      );
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (variant_name !== undefined) updateData.variantName = variant_name;
  if (sku !== undefined) updateData.sku = sku;
  if (price !== undefined) updateData.price = String(price);
  if (reseller_price !== undefined) updateData.resellerPrice = String(reseller_price);
  if (stock !== undefined) updateData.stock = stock;
  if (weight !== undefined) updateData.weight = weight;
  if (status !== undefined) updateData.status = status.toLowerCase();

  await db.update(productVariants).set(updateData).where(eq(productVariants.id, id));

  const [updated] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id));

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      product_id: updated.productId,
      variant_name: updated.variantName,
      sku: updated.sku,
      price: Number(updated.price),
      reseller_price: Number(updated.resellerPrice),
      stock: updated.stock,
      weight: updated.weight ?? null,
      status: updated.status.toUpperCase(),
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    },
  });
}

/**
 * DELETE /api/admin/product-variants/:id
 */
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
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Varian tidak ditemukan." },
      { status: 404 },
    );
  }

  await db.delete(productVariants).where(eq(productVariants.id, id));

  return NextResponse.json({
    success: true,
    data: { message: "Varian berhasil dihapus." },
  });
}
