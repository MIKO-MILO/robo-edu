import { NextResponse } from "next/server";
import { desc, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews, users } from "@/src/db/schema";

export const runtime = "nodejs";

/**
 * GET /api/reviews/featured
 *
 * Ambil review PUBLISHED dengan rating ≥ 4 dan ada komentar,
 * untuk ditampilkan sebagai testimoni publik di homepage.
 *
 * Query params:
 *   - limit (default 8)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "8", 10), 20);

  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(
      eq(reviews.status, "PUBLISHED"),
    )
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit);

  // Filter di sisi aplikasi: hanya yang punya komentar & rating >= 4
  const filtered = rows.filter(
    (r) => r.comment && r.comment.trim().length > 0 && r.rating >= 4,
  );

  const data = filtered.map((r) => ({
    id: r.id,
    userName: r.userName,
    rating: r.rating,
    comment: r.comment!,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data });
}
