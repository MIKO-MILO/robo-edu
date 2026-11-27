import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, refundAttachments, refunds } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/refund/[refundId]
 *
 * Returns the detail of a single refund request belonging to the logged-in
 * user. The order must belong to the user, and the refund must belong to that
 * order.
 *
 * Response includes:
 *   - status, amount, method, proof_url (if manual transfer proof was uploaded)
 *   - reason, restore_quota
 *   - attachments (files submitted with the refund request)
 *   - timestamps
 *
 * Returns 401 if no valid session.
 * Returns 403 if the order does not belong to the user.
 * Returns 404 if the order or refund does not exist.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; refundId: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: orderId, refundId } = await params;

  // ── Verify order ownership ────────────────────────────────────────────
  const [order] = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber, userId: orders.userId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  if (order.userId !== userId) {
    return NextResponse.json(
      { success: false, message: "Anda tidak memiliki akses ke pesanan ini." },
      { status: 403 },
    );
  }

  // ── Fetch refund (must belong to this order) ──────────────────────────
  const [refund] = await db
    .select({
      id: refunds.id,
      orderId: refunds.orderId,
      amount: refunds.amount,
      reason: refunds.reason,
      method: refunds.method,
      proofUrl: refunds.proofUrl,
      restoreQuota: refunds.restoreQuota,
      status: refunds.status,
      createdAt: refunds.createdAt,
      updatedAt: refunds.updatedAt,
    })
    .from(refunds)
    .where(and(eq(refunds.id, refundId), eq(refunds.orderId, orderId)))
    .limit(1);

  if (!refund) {
    return NextResponse.json(
      { success: false, message: "Pengajuan refund tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Attachments ───────────────────────────────────────────────────────
  const attachmentRows = await db
    .select({
      id: refundAttachments.id,
      fileUrl: refundAttachments.fileUrl,
      fileName: refundAttachments.fileName,
      fileType: refundAttachments.fileType,
      createdAt: refundAttachments.createdAt,
    })
    .from(refundAttachments)
    .where(eq(refundAttachments.refundId, refundId));

  return NextResponse.json({
    success: true,
    data: {
      id: refund.id,
      order_id: refund.orderId,
      order_number: order.orderNumber,
      amount: Number(refund.amount),
      reason: refund.reason,
      method: refund.method,
      proof_url: refund.proofUrl ?? null,
      restore_quota: refund.restoreQuota,
      status: refund.status,
      created_at: refund.createdAt.toISOString(),
      updated_at: refund.updatedAt.toISOString(),
      attachments: attachmentRows.map((a) => ({
        id: a.id,
        file_url: a.fileUrl,
        file_name: a.fileName,
        file_type: a.fileType ?? null,
        created_at: a.createdAt.toISOString(),
      })),
    },
  });
}
