import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { productVideos } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { removeProductVideo } from "@/src/lib/storage/product-videos";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/product-videos/:id
 * Body: { title?: string; sort_order?: number }
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
    .from(productVideos)
    .where(eq(productVideos.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Video tidak ditemukan." },
      { status: 404 },
    );
  }

  let body: { title?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body tidak valid." },
      { status: 400 },
    );
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updateData.title = body.title || null;
  if (body.sort_order !== undefined) updateData.sortOrder = body.sort_order;

  await db.update(productVideos).set(updateData).where(eq(productVideos.id, id));

  const [updated] = await db
    .select()
    .from(productVideos)
    .where(eq(productVideos.id, id));

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id,
      product_id: updated.productId,
      video_url: updated.videoUrl,
      video_key: updated.videoKey,
      title: updated.title ?? null,
      sort_order: updated.sortOrder,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    },
  });
}

/**
 * DELETE /api/admin/product-videos/:id
 * Hapus video dari MinIO dan database.
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
    .from(productVideos)
    .where(eq(productVideos.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Video tidak ditemukan." },
      { status: 404 },
    );
  }

  // Hapus dari MinIO
  await removeProductVideo(existing.videoKey);

  // Hapus dari DB
  await db.delete(productVideos).where(eq(productVideos.id, id));

  return NextResponse.json({
    success: true,
    data: { message: "Video berhasil dihapus." },
  });
}
