import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { landingFeaturedReviews } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/landing-config/reviews/reorder
// Body: [{ id: string, sort_order: number }, ...]
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
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

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "Body harus berupa array [{ id, sort_order }]." },
      { status: 422 },
    );
  }

  const items = body as Array<Record<string, unknown>>;

  for (const item of items) {
    if (typeof item.id !== "string" || typeof item.sort_order !== "number") {
      return NextResponse.json(
        { success: false, message: "Setiap item harus memiliki id (string) dan sort_order (number)." },
        { status: 422 },
      );
    }
  }

  await Promise.all(
    items.map((item) =>
      db
        .update(landingFeaturedReviews)
        .set({ sortOrder: item.sort_order as number })
        .where(eq(landingFeaturedReviews.id, item.id as string)),
    ),
  );

  return NextResponse.json({ success: true });
}
