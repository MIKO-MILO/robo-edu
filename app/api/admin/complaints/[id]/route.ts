import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/src/db";
import {
  auditLogs,
  complaints,
  complaintAttachments,
  orderItems,
  orders,
  users,
} from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import crypto from "node:crypto";

export const runtime = "nodejs";

// ── Status machine ────────────────────────────────────────────────────────────

/** All valid complaint status values. */
const VALID_STATUSES = new Set(["open", "in_review", "resolved", "closed"]);

/**
 * Allowed forward transitions.
 * `closed` is reachable from any non-terminal state (admin always wins).
 * Once `resolved` or `closed`, no further transitions are permitted.
 */
const ALLOWED_TRANSITIONS: Record<string, Set<string>> = {
  open:      new Set(["in_review", "closed"]),
  in_review: new Set(["resolved", "closed"]),
  // Terminal states: no transitions allowed
  resolved:  new Set(),
  closed:    new Set(),
};

// ── GET /api/admin/complaints/[id] ────────────────────────────────────────────

/**
 * Full detail for a single complaint: profile of the customer, the order item
 * being complained about, the complaint text, and all attachments.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // ── Fetch complaint + customer + order_item + order ───────────────────
  const [row] = await db
    .select({
      id:            complaints.id,
      orderItemId:   complaints.orderItemId,
      subject:       complaints.subject,
      description:   complaints.description,
      status:        complaints.status,
      resolution:    complaints.resolution,
      resolvedAt:    complaints.resolvedAt,
      createdAt:     complaints.createdAt,
      updatedAt:     complaints.updatedAt,
      // customer
      customerId:    users.id,
      customerName:  users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
      // order item
      productName:   orderItems.productNameSnapshot,
      variantName:   orderItems.variantNameSnapshot,
      skuSnapshot:   orderItems.skuSnapshot,
      priceSnapshot: orderItems.priceSnapshot,
      quantity:      orderItems.quantity,
      orderId:       orderItems.orderId,
      // order
      orderNumber:   orders.orderNumber,
      orderStatus:   orders.status,
    })
    .from(complaints)
    .innerJoin(users,      eq(complaints.userId,      users.id))
    .innerJoin(orderItems, eq(complaints.orderItemId, orderItems.id))
    .innerJoin(orders,     eq(orderItems.orderId,     orders.id))
    .where(eq(complaints.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { success: false, message: "Pengaduan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Attachments ───────────────────────────────────────────────────────
  const attachmentRows = await db
    .select({
      id:        complaintAttachments.id,
      fileUrl:   complaintAttachments.fileUrl,
      fileName:  complaintAttachments.fileName,
      fileType:  complaintAttachments.fileType,
      createdAt: complaintAttachments.createdAt,
    })
    .from(complaintAttachments)
    .where(eq(complaintAttachments.complaintId, id));

  return NextResponse.json({
    success: true,
    data: {
      id:           row.id,
      subject:      row.subject,
      description:  row.description,
      status:       row.status,
      resolution:   row.resolution ?? null,
      resolved_at:  row.resolvedAt?.toISOString() ?? null,
      created_at:   row.createdAt.toISOString(),
      updated_at:   row.updatedAt.toISOString(),
      customer: {
        id:    row.customerId,
        name:  row.customerName,
        email: row.customerEmail,
        phone: row.customerPhone ?? null,
      },
      order_item: {
        id:            row.orderItemId,
        product_name:  row.productName,
        variant_name:  row.variantName ?? null,
        sku_snapshot:  row.skuSnapshot,
        price_snapshot: Number(row.priceSnapshot),
        quantity:      row.quantity,
      },
      order: {
        id:           row.orderId,
        order_number: row.orderNumber,
        status:       row.orderStatus,
      },
      attachments: attachmentRows.map((a) => ({
        id:         a.id,
        file_url:   a.fileUrl,
        file_name:  a.fileName,
        file_type:  a.fileType ?? null,
        created_at: a.createdAt.toISOString(),
      })),
    },
  });
}

// ── PATCH /api/admin/complaints/[id] ─────────────────────────────────────────

/**
 * Update the status and/or resolution note of a complaint.
 *
 * Body (JSON):
 *   status           — required; new status (open | in_review | resolved | closed)
 *   resolution_note? — stored in `resolution`; required when status = "resolved"
 *
 * Status transitions follow a forward-only machine:
 *   open → in_review → resolved
 *              ↓           ↓
 *            closed      closed   (admin can always close)
 *
 * A `resolved_at` timestamp is set automatically when status = "resolved".
 * All status changes are appended to the audit_log.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // ── Parse body ────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { status: newStatus, resolution_note } = body as {
    status?: unknown;
    resolution_note?: unknown;
  };

  // ── Validate status value ─────────────────────────────────────────────
  if (!newStatus || typeof newStatus !== "string") {
    return NextResponse.json(
      { success: false, message: "Field 'status' diperlukan." },
      { status: 422 },
    );
  }
  if (!VALID_STATUSES.has(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Status '${newStatus}' tidak valid. Nilai yang diizinkan: ${[...VALID_STATUSES].join(", ")}.`,
      },
      { status: 422 },
    );
  }

  const resolutionNote =
    typeof resolution_note === "string" ? resolution_note.trim() : null;

  // ── Load current complaint ────────────────────────────────────────────
  const [current] = await db
    .select({
      status:      complaints.status,
      subject:     complaints.subject,
      resolution:  complaints.resolution,
      resolvedAt:  complaints.resolvedAt,
      orderItemId: complaints.orderItemId,
      userId:      complaints.userId,
    })
    .from(complaints)
    .where(eq(complaints.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json(
      { success: false, message: "Pengaduan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Validate transition ───────────────────────────────────────────────
  if (current.status === newStatus) {
    // idempotent: no-op, return current state
    return NextResponse.json({
      success: true,
      message: "Status tidak berubah.",
      data: { id, status: current.status, resolution: current.resolution ?? null, resolved_at: current.resolvedAt?.toISOString() ?? null },
    });
  }

  const allowed = ALLOWED_TRANSITIONS[current.status] ?? new Set();
  if (!allowed.has(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Transisi status dari '${current.status}' ke '${newStatus}' tidak diizinkan.`,
      },
      { status: 409 },
    );
  }

  // ── Build update payload ──────────────────────────────────────────────
  const isResolving = newStatus === "resolved";
  const now = new Date();

  const updatePayload: Record<string, unknown> = {
    status:    newStatus,
    updatedAt: now,
    ...(resolutionNote !== null ? { resolution: resolutionNote } : {}),
    ...(isResolving ? { resolvedAt: now } : {}),
  };

  await db.update(complaints).set(updatePayload).where(eq(complaints.id, id));

  // ── Audit log ─────────────────────────────────────────────────────────
  await db.insert(auditLogs).values({
    id:         crypto.randomUUID(),
    actorId:    auth.userId,
    action:     "complaint.status_updated",
    targetType: "complaint",
    targetId:   id,
    description: `Status pengaduan diubah dari '${current.status}' menjadi '${newStatus}'.`,
    metadata:   {
      complaint_id: id,
      from_status:  current.status,
      to_status:    newStatus,
      ...(resolutionNote ? { resolution_note: resolutionNote } : {}),
    },
  });

  // ── Return updated state ──────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    message: "Status pengaduan berhasil diperbarui.",
    data: {
      id,
      status:      newStatus,
      resolution:  resolutionNote ?? current.resolution ?? null,
      resolved_at: isResolving ? now.toISOString() : (current.resolvedAt?.toISOString() ?? null),
    },
  });
}
