import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { refunds } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { writeAuditLog } from "@/src/lib/audit/write-audit-log";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/orders/:id/refunds/:refundId/proof
 *
 * Upload the proof-of-transfer URL for a MANUAL refund that lacks one.
 * The frontend first uploads the file to /api/upload/minio (or directly
 * to MinIO), then calls this endpoint with the resulting URL.
 *
 * Rules:
 *   - Admin-only.
 *   - The refund must exist, belong to the given order, and have method=MANUAL.
 *   - Only updates proof_url (not status — admin confirms via manual review).
 *
 * Request body: { proof_url: string }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; refundId: string }> },
) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) return auth.response;

  const { id: orderId, refundId } = await params;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { proof_url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const proofUrl =
    typeof body.proof_url === "string" && body.proof_url.trim()
      ? body.proof_url.trim()
      : null;

  if (!proofUrl) {
    return NextResponse.json(
      { success: false, message: "proof_url wajib diisi." },
      { status: 400 },
    );
  }

  // ── Fetch refund — must belong to this order ──────────────────────────────
  const [refund] = await db
    .select({
      id: refunds.id,
      orderId: refunds.orderId,
      method: refunds.method,
      proofUrl: refunds.proofUrl,
      status: refunds.status,
    })
    .from(refunds)
    .where(
      and(eq(refunds.id, refundId), eq(refunds.orderId, orderId)),
    )
    .limit(1);

  if (!refund) {
    return NextResponse.json(
      { success: false, message: "Refund tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Guard: only MANUAL refunds have proof uploads ─────────────────────────
  if (refund.method !== "MANUAL") {
    return NextResponse.json(
      {
        success: false,
        message: "Bukti transfer hanya berlaku untuk refund metode MANUAL.",
      },
      { status: 422 },
    );
  }

  // ── Update proof_url ──────────────────────────────────────────────────────
  const now = new Date();
  await db
    .update(refunds)
    .set({ proofUrl, updatedAt: now })
    .where(eq(refunds.id, refundId));

  // ── Audit log ─────────────────────────────────────────────────────────────
  await writeAuditLog({
    actorId: auth.userId,
    action: "refund.proof_uploaded",
    targetType: "refund",
    targetId: refundId,
    description: `Bukti transfer diunggah untuk refund ${refundId} pada pesanan ${orderId}.`,
    metadata: {
      refund_id: refundId,
      order_id: orderId,
      proof_url: proofUrl,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Bukti transfer berhasil disimpan.",
    data: {
      id: refundId,
      order_id: orderId,
      proof_url: proofUrl,
      updated_at: now.toISOString(),
    },
  });
}
