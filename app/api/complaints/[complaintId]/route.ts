import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import {
  auditLogs,
  complaintAttachments,
  complaints,
  orderItems,
  orders,
} from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/complaints/[complaintId]
 *
 * Returns the detail of a single complaint that belongs to the logged-in user.
 *
 * Response includes:
 *   - complaint fields (status, subject, description, resolution, timestamps)
 *   - attachments
 *   - product name, order number from the joined order_item + order
 *   - status history from audit_logs (targetType = "complaint", targetId = complaintId)
 *
 * Returns 401 if no valid session.
 * Returns 403 if the complaint exists but belongs to a different user.
 * Returns 404 if the complaint does not exist at all.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ complaintId: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { complaintId } = await params;

  // ── Fetch complaint (without ownership filter first to distinguish 403/404) ─
  const [row] = await db
    .select({
      id: complaints.id,
      userId: complaints.userId,
      orderItemId: complaints.orderItemId,
      subject: complaints.subject,
      description: complaints.description,
      status: complaints.status,
      resolution: complaints.resolution,
      resolvedAt: complaints.resolvedAt,
      createdAt: complaints.createdAt,
      updatedAt: complaints.updatedAt,
      // order_item snapshot
      productName: orderItems.productNameSnapshot,
      variantName: orderItems.variantNameSnapshot,
      skuSnapshot: orderItems.skuSnapshot,
      priceSnapshot: orderItems.priceSnapshot,
      quantity: orderItems.quantity,
      orderId: orderItems.orderId,
      // order
      orderNumber: orders.orderNumber,
      orderStatus: orders.status,
    })
    .from(complaints)
    .innerJoin(orderItems, eq(complaints.orderItemId, orderItems.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(complaints.id, complaintId))
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { success: false, message: "Pengaduan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Ownership check ───────────────────────────────────────────────────
  if (row.userId !== userId) {
    return NextResponse.json(
      { success: false, message: "Anda tidak memiliki akses ke pengaduan ini." },
      { status: 403 },
    );
  }

  // ── Attachments ───────────────────────────────────────────────────────
  const attachmentRows = await db
    .select({
      id: complaintAttachments.id,
      fileUrl: complaintAttachments.fileUrl,
      fileName: complaintAttachments.fileName,
      fileType: complaintAttachments.fileType,
      createdAt: complaintAttachments.createdAt,
    })
    .from(complaintAttachments)
    .where(eq(complaintAttachments.complaintId, complaintId));

  // ── Status history from audit_logs ────────────────────────────────────
  const historyRows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      description: auditLogs.description,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.targetType, "complaint"),
        eq(auditLogs.targetId, complaintId),
      ),
    )
    .orderBy(asc(auditLogs.createdAt));

  return NextResponse.json({
    success: true,
    data: {
      id: row.id,
      subject: row.subject,
      description: row.description,
      status: row.status,
      resolution: row.resolution ?? null,
      resolved_at: row.resolvedAt?.toISOString() ?? null,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      order_item: {
        id: row.orderItemId,
        product_name: row.productName,
        variant_name: row.variantName ?? null,
        sku_snapshot: row.skuSnapshot,
        price_snapshot: Number(row.priceSnapshot),
        quantity: row.quantity,
      },
      order: {
        id: row.orderId,
        order_number: row.orderNumber,
        status: row.orderStatus,
      },
      attachments: attachmentRows.map((a) => ({
        id: a.id,
        file_url: a.fileUrl,
        file_name: a.fileName,
        file_type: a.fileType ?? null,
        created_at: a.createdAt.toISOString(),
      })),
      status_history: historyRows.map((h) => ({
        id: h.id,
        action: h.action,
        description: h.description ?? null,
        metadata: h.metadata ?? null,
        created_at: h.createdAt.toISOString(),
      })),
    },
  });
}
