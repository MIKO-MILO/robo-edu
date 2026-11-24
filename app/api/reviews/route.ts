import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews, reviewImages, orderItems, orders } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/reviews
 *
 * Submit ulasan dari user yang sudah login.
 * Body JSON: { order_item_id, rating, comment?, image_urls? }
 *
 * Validasi:
 * - order_item harus milik order milik user ini
 * - order harus berstatus COMPLETED (user harus konfirmasi penerimaan dulu)
 * - rating harus 1–5
 * - satu order_item hanya boleh direview sekali (UNIQUE di DB)
 * - review berstatus PUBLISHED langsung (moderasi bisa dilakukan admin)
 * - image_urls (opsional): array URL string, maks 5 item
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { order_item_id, rating, comment, image_urls } = body as {
    order_item_id?: unknown;
    rating?: unknown;
    comment?: unknown;
    image_urls?: unknown;
  };

  // ── Validasi input ────────────────────────────────────────────────────
  if (!order_item_id || typeof order_item_id !== "string") {
    return NextResponse.json(
      { success: false, message: "order_item_id diperlukan." },
      { status: 422 },
    );
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json(
      { success: false, message: "Rating harus berupa bilangan bulat antara 1 dan 5." },
      { status: 422 },
    );
  }

  const commentStr = typeof comment === "string" ? comment.trim() : null;

  // Validasi image_urls
  const imageUrlsArray: string[] = [];
  if (image_urls !== undefined && image_urls !== null) {
    if (!Array.isArray(image_urls)) {
      return NextResponse.json(
        { success: false, message: "image_urls harus berupa array." },
        { status: 422 },
      );
    }
    if (image_urls.length > 5) {
      return NextResponse.json(
        { success: false, message: "Maksimal 5 foto per ulasan." },
        { status: 422 },
      );
    }
    for (const url of image_urls) {
      if (typeof url !== "string" || !url.trim()) {
        return NextResponse.json(
          { success: false, message: "Setiap item dalam image_urls harus berupa string URL yang valid." },
          { status: 422 },
        );
      }
      imageUrlsArray.push(url.trim());
    }
  }

  // ── Verifikasi order_item milik user & status order ───────────────────
  const [item] = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      orderId: orderItems.orderId,
      productNameSnapshot: orderItems.productNameSnapshot,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.id, order_item_id),
        eq(orders.userId, userId),
      ),
    )
    .limit(1);

  if (!item) {
    return NextResponse.json(
      { success: false, message: "Item pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // Ambil status order untuk validasi
  const [order] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, item.orderId))
    .limit(1);

  if (!order || order.status !== "COMPLETED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Ulasan hanya bisa diberikan setelah pesanan selesai. Konfirmasi penerimaan paket terlebih dahulu.",
      },
      { status: 409 },
    );
  }

  // ── Cek apakah sudah ada review untuk item ini ───────────────────────
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.orderItemId, order_item_id))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { success: false, message: "Kamu sudah memberikan ulasan untuk produk ini." },
      { status: 409 },
    );
  }

  // ── Insert review ─────────────────────────────────────────────────────
  const reviewId = crypto.randomUUID();
  await db.insert(reviews).values({
    id: reviewId,
    orderItemId: order_item_id,
    userId,
    productId: item.productId,
    rating: ratingNum,
    comment: commentStr || null,
    status: "PUBLISHED", // langsung publish, admin bisa hide jika perlu
  });

  // ── Insert review images (kalau ada) ─────────────────────────────────
  if (imageUrlsArray.length > 0) {
    await db.insert(reviewImages).values(
      imageUrlsArray.map((url) => ({
        id: crypto.randomUUID(),
        reviewId,
        url,
      })),
    );
  }

  const [created] = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  return NextResponse.json(
    {
      success: true,
      message: "Ulasan berhasil dikirim.",
      data: {
        id: created!.id,
        order_item_id,
        product_id: item.productId,
        rating: created!.rating,
        comment: created!.comment ?? null,
        status: created!.status,
        image_urls: imageUrlsArray,
        created_at: created!.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
