import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { landingFeaturedReviews } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/landing-config/reviews/:id
// Hapus review dari featured (sama efeknya dengan toggle off).
// ─────────────────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [existing] = await db
    .select({ id: landingFeaturedReviews.id })
    .from(landingFeaturedReviews)
    .where(eq(landingFeaturedReviews.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Featured review tidak ditemukan." },
      { status: 404 },
    );
  }

  await db
    .delete(landingFeaturedReviews)
    .where(eq(landingFeaturedReviews.id, id));

  return NextResponse.json({ success: true });
}
