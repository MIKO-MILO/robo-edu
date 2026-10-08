import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews } from "@/src/db/schema";
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { ReviewStatus } from "@/types/enums";

export const runtime = "nodejs";

function isAdminRole(role: string) {
  const r = role?.toLowerCase() ?? "";
  return ["admin", "superadmin", "admin_sales", "admin_laporan"].includes(r);
}

/**
 * PATCH /api/admin/reviews/[id]/status
 * Body: { status: "PUBLISHED" | "HIDDEN" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    const uid = await getSessionUserId();
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { status?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, message: "Body tidak valid." }, { status: 400 }); }

  const status = body.status;
  if (status !== "PUBLISHED" && status !== "HIDDEN") {
    return NextResponse.json(
      { success: false, message: "Status harus PUBLISHED atau HIDDEN." },
      { status: 422 },
    );
  }

  const [review] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, id)).limit(1);
  if (!review) {
    return NextResponse.json({ success: false, message: "Review tidak ditemukan." }, { status: 404 });
  }

  await db.update(reviews).set({ status: status as ReviewStatus }).where(eq(reviews.id, id));

  return NextResponse.json({
    success: true,
    message: `Review berhasil diubah ke ${status}.`,
    data: { id, status },
  });
}
