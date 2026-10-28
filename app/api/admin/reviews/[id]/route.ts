import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews } from "@/src/db/schema";
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

function isAdminRole(role: string) {
  const r = role?.toLowerCase() ?? "";
  return ["admin", "superadmin", "admin_sales", "admin_laporan"].includes(r);
}

/**
 * DELETE /api/admin/reviews/[id]
 * Hapus review secara permanen.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    const uid = await getSessionUserId();
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [review] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, id)).limit(1);
  if (!review) {
    return NextResponse.json({ success: false, message: "Review tidak ditemukan." }, { status: 404 });
  }

  await db.delete(reviews).where(eq(reviews.id, id));

  return NextResponse.json({ success: true, message: "Review berhasil dihapus." });
}
