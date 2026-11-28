import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { landingFeaturedReviews, reviews, users } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/landing-config/reviews
// Daftar review yang di-featured, diurutkan by sort_order, include data review.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const rows = await db
    .select({
      id:        landingFeaturedReviews.id,
      reviewId:  landingFeaturedReviews.reviewId,
      sortOrder: landingFeaturedReviews.sortOrder,
      createdAt: landingFeaturedReviews.createdAt,
      rating:    reviews.rating,
      comment:   reviews.comment,
      status:    reviews.status,
      reviewCreatedAt: reviews.createdAt,
      userName:  users.name,
    })
    .from(landingFeaturedReviews)
    .innerJoin(reviews, eq(landingFeaturedReviews.reviewId, reviews.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(asc(landingFeaturedReviews.sortOrder));

  const data = rows.map((r) => ({
    id:         r.id,
    review_id:  r.reviewId,
    sort_order: r.sortOrder,
    created_at: r.createdAt.toISOString(),
    review: {
      id:         r.reviewId,
      user_name:  r.userName,
      rating:     r.rating,
      comment:    r.comment ?? null,
      status:     r.status,
      created_at: r.reviewCreatedAt.toISOString(),
    },
  }));

  return NextResponse.json({ success: true, data });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/landing-config/reviews
// Tambahkan review ke featured.
// Body: { review_id: string, sort_order?: number }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { review_id, sort_order } = (body ?? {}) as Record<string, unknown>;

  if (!review_id || typeof review_id !== "string") {
    return NextResponse.json(
      { success: false, message: "review_id wajib diisi." },
      { status: 422 },
    );
  }

  // Cek review ada
  const [review] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.id, review_id))
    .limit(1);

  if (!review) {
    return NextResponse.json(
      { success: false, message: "Review tidak ditemukan." },
      { status: 404 },
    );
  }

  // Cek duplikat
  const [dup] = await db
    .select({ id: landingFeaturedReviews.id })
    .from(landingFeaturedReviews)
    .where(eq(landingFeaturedReviews.reviewId, review_id))
    .limit(1);

  if (dup) {
    return NextResponse.json(
      { success: false, message: "Review ini sudah ada di featured landing." },
      { status: 409 },
    );
  }

  const { randomUUID } = await import("node:crypto");
  const newId = randomUUID();

  let resolvedSortOrder = typeof sort_order === "number" ? sort_order : 0;
  if (typeof sort_order !== "number") {
    const [{ maxOrder }] = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(sort_order), -1)` })
      .from(landingFeaturedReviews);
    resolvedSortOrder = Number(maxOrder) + 1;
  }

  await db.insert(landingFeaturedReviews).values({
    id:        newId,
    reviewId:  review_id,
    sortOrder: resolvedSortOrder,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true, data: { id: newId } }, { status: 201 });
}
