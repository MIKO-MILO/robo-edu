import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { productImages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/product-images/:id/reorder
 * Body: { sort_order?: number; is_primary?: boolean }
 *
 * Jika is_primary = true, semua gambar lain milik produk yang sama
 * di-set is_primary = false terlebih dahulu.
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
    .from(productImages)
    .where(eq(productImages.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Gambar tidak ditemukan." },
      { status: 404 },
    );
  }

  let body: { sort_order?: number; is_primary?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body tidak valid." },
      { status: 400 },
    );
  }

  const { sort_order, is_primary } = body;

  // Jika set sebagai primary, clear primary pada gambar lain dulu
  if (is_primary === true) {
    await db
      .update(productImages)
      .set({ isPrimary: false, updatedAt: new Date() })
      .where(eq(productImages.productId, existing.productId));
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (sort_order !== undefined) updateData.sortOrder = sort_order;
  if (is_primary !== undefined) updateData.isPrimary = is_primary;

  await db
    .update(productImages)
    .set(updateData)
    .where(eq(productImages.id, id));

  const [updated] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, id));

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      product_id: updated.productId,
      variant_id: updated.variantId ?? null,
      image_url: updated.imageUrl,
      alt_text: updated.altText ?? null,
      sort_order: updated.sortOrder,
      is_primary: updated.isPrimary,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    },
  });
}
