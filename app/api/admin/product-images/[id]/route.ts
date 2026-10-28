import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { productImages } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { removeProductImage } from "@/src/lib/storage/product-images";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * DELETE /api/admin/product-images/:id
 * Hapus gambar dari DB dan MinIO.
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

  // Hapus dari MinIO (abaikan error jika object sudah tidak ada)
  await removeProductImage(existing.imageUrl);

  // Hapus dari DB
  await db.delete(productImages).where(eq(productImages.id, id));

  // Jika gambar yang dihapus adalah primary, promosikan gambar berikutnya
  if (existing.isPrimary) {
    const [next] = await db
      .select({ id: productImages.id })
      .from(productImages)
      .where(eq(productImages.productId, existing.productId))
      .orderBy(productImages.sortOrder)
      .limit(1);

    if (next) {
      await db
        .update(productImages)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(eq(productImages.id, next.id));
    }
  }

  return NextResponse.json({
    success: true,
    data: { message: "Gambar berhasil dihapus." },
  });
}
