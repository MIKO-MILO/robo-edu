import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/src/db";
import { products, productVideos } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { saveProductVideo } from "@/src/lib/storage/product-videos";

export const runtime = "nodejs";

// Video bisa besar — maksimalkan body size limit
export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/products/:id/videos
 * Ambil semua video milik produk.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: productId } = await params;

  const rows = await db
    .select()
    .from(productVideos)
    .where(eq(productVideos.productId, productId))
    .orderBy(productVideos.sortOrder);

  return NextResponse.json({
    success: true,
    data: rows.map((v) => ({
      id: v.id,
      product_id: v.productId,
      video_url: v.videoUrl,
      video_key: v.videoKey,
      title: v.title ?? null,
      sort_order: v.sortOrder,
      created_at: v.createdAt,
      updated_at: v.updatedAt,
    })),
  });
}

/**
 * POST /api/admin/products/:id/videos
 * multipart/form-data: field "file" (video), optional "title"
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

  // Parse multipart form
  let file: File | null = null;
  let title: string | null = null;
  try {
    const formData = await request.formData();
    const raw = formData.get("file");
    if (raw instanceof File) file = raw;
    const rawTitle = formData.get("title");
    if (typeof rawTitle === "string" && rawTitle.trim()) {
      title = rawTitle.trim();
    }
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

  // Validasi tipe file video
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  const allowedExts = [".mp4", ".webm", ".ogv", ".ogg", ".mov"];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedTypes.includes(file.type) ||
    allowedExts.some((ext) => fileName.endsWith(ext));

  if (!isValidType) {
    return NextResponse.json(
      {
        success: false,
        message: "Tipe file tidak didukung. Gunakan MP4, WebM, atau OGG.",
      },
      { status: 422 },
    );
  }

  // Maksimal 200 MB
  const MAX_SIZE = 200 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, message: "Ukuran file maksimal 200 MB." },
      { status: 422 },
    );
  }

  // Sort order berikutnya
  const [maxOrder] = await db
    .select({ maxOrder: sql<number>`COALESCE(MAX(${productVideos.sortOrder}), -1)` })
    .from(productVideos)
    .where(eq(productVideos.productId, productId));

  const nextSortOrder = Number(maxOrder?.maxOrder ?? -1) + 1;

  // Upload ke MinIO
  const { key, url } = await saveProductVideo(productId, file);

  // Simpan ke DB
  const videoId = randomUUID();
  await db.insert(productVideos).values({
    id: videoId,
    productId,
    videoKey: key,
    videoUrl: url,
    title: title ?? null,
    sortOrder: nextSortOrder,
  });

  const [created] = await db
    .select()
    .from(productVideos)
    .where(eq(productVideos.id, videoId));

  return NextResponse.json(
    {
      success: true,
      data: {
        id: created.id,
        product_id: created.productId,
        video_url: created.videoUrl,
        video_key: created.videoKey,
        title: created.title ?? null,
        sort_order: created.sortOrder,
        created_at: created.createdAt,
        updated_at: created.updatedAt,
      },
    },
    { status: 201 },
  );
}
