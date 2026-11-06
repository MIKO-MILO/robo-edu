import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { writeAuditLog } from "@/src/lib/audit/write-audit-log";
import type { ReviewStatus } from "@/types/enums";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/reviews/[id]/status
 * Body: { status: "PUBLISHED" | "HIDDEN" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body tidak valid." },
      { status: 400 },
    );
  }

  const status = body.status;
  if (status !== "PUBLISHED" && status !== "HIDDEN") {
    return NextResponse.json(
      { success: false, message: "Status harus PUBLISHED atau HIDDEN." },
      { status: 422 },
    );
  }

  const [review] = await db
    .select({ id: reviews.id, status: reviews.status })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) {
    return NextResponse.json(
      { success: false, message: "Review tidak ditemukan." },
      { status: 404 },
    );
  }

  const prevStatus = review.status;
  await db.update(reviews).set({ status: status as ReviewStatus }).where(eq(reviews.id, id));

  // ── Audit log ──────────────────────────────────────────────────────────
  await writeAuditLog({
    actorId:    auth.userId,
    action:     "review.status_updated",
    targetType: "review",
    targetId:   id,
    description: `Status review diubah dari ${prevStatus} ke ${status}.`,
    metadata:   { review_id: id, from_status: prevStatus, to_status: status },
  });

  return NextResponse.json({
    success: true,
    message: `Review berhasil diubah ke ${status}.`,
    data: { id, status },
  });
}
