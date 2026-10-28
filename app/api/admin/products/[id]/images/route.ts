import { NextRequest, NextResponse } from "next/server";
import { eq, max, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/src/db";
import { products, productImages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { saveProductImage } from "@/src/lib/storage/product-images";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/products/:id/images
 * multipart/form-data dengan field "file"
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

  // Parse multipart/form-data
  let file: File | null = null;
  try {
    const formData = await request.formData();
    const raw = formData.get("file");
    if (raw instanceof File) file = raw;
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal membaca file upload." },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json(
      { success: false, message: "Field 'file' wajib diisi." },
      { status: 422 },
    );
  }

  // Validasi tipe file
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { success: false, message: "Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." },
      { status: 422 },
    );
  }

  // Cek apakah ini gambar pertama (akan jadi primary otomatis)
  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  const existingCount = Number(countResult?.count ?? 0);
  const isPrimary = existingCount === 0;

  // Cari sort_order tertinggi
  const [maxOrder] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${productImages.sortOrder}), -1)` })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  const nextSortOrder = Number(maxOrder?.maxOrder ?? -1) + 1;

  // Upload ke MinIO
  const { url } = await saveProductImage(productId, file);

  // Simpan ke DB
  const imageId = randomUUID();
  await db.insert(productImages).values({
    id: imageId,
    productId,
    variantId: null,
    imageUrl: url,
    altText: null,
    sortOrder: nextSortOrder,
    isPrimary,
  });

  const [created] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));

  return NextResponse.json(
    {
      success: true,
      data: {
        id: created.id,
        product_id: created.productId,
        variant_id: created.variantId ?? null,
        image_url: created.imageUrl,
        alt_text: created.altText ?? null,
        sort_order: created.sortOrder,
        is_primary: created.isPrimary,
        created_at: created.createdAt,
        updated_at: created.updatedAt,
      },
    },
    { status: 201 },
  );
}
