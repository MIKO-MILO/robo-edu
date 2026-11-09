import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/reviews/[id]
 * Hapus review secara permanen.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [review] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, id)).limit(1);
  if (!review) {
    return NextResponse.json({ success: false, message: "Review tidak ditemukan." }, { status: 404 });
  }

  await db.delete(reviews).where(eq(reviews.id, id));

  return NextResponse.json({ success: true, message: "Review berhasil dihapus." });
}
