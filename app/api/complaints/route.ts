import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/src/db";
import {
  complaints,
  complaintAttachments,
  orderItems,
  orders,
} from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import crypto from "node:crypto";

export const runtime = "nodejs";

// ── Types ────────────────────────────────────────────────────────────────────

interface AttachmentInput {
  file_url: string;
  file_name: string;
  file_type?: string;
}

// ── POST /api/complaints ─────────────────────────────────────────────────────

/**
 * Submit a warranty complaint for a delivered order item.
 *
 * Body (JSON):
 *   order_item_id  — the order item being complained about
 *   reason         — short summary (mapped to `subject` in the DB)
 *   description    — full description of the issue
 *   attachments?   — array of { file_url, file_name, file_type? }
 *
 * Rules:
 *   - The order item must belong to the logged-in user.
 *   - The parent order must have status "DELIVERED".
 *   - Only one complaint per order item is allowed.
 */
export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

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

  const {
    order_item_id,
    reason,
    description,
    attachments,
  } = body as {
    order_item_id?: unknown;
    reason?: unknown;
    description?: unknown;
    attachments?: unknown;
  };

  // ── Validate required fields ──────────────────────────────────────────
  if (!order_item_id || typeof order_item_id !== "string") {
    return NextResponse.json(
      { success: false, message: "order_item_id diperlukan." },
      { status: 422 },
    );
  }
  if (!reason || typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json(
      { success: false, message: "reason diperlukan." },
      { status: 422 },
    );
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return NextResponse.json(
      { success: false, message: "description diperlukan." },
      { status: 422 },
    );
  }

  // Validate attachments array shape if provided
  const attachmentList: AttachmentInput[] = [];
  if (attachments !== undefined && attachments !== null) {
    if (!Array.isArray(attachments)) {
      return NextResponse.json(
        { success: false, message: "attachments harus berupa array." },
        { status: 422 },
      );
    }
    for (const a of attachments as unknown[]) {
      if (
        typeof a !== "object" ||
        a === null ||
        typeof (a as AttachmentInput).file_url !== "string" ||
        typeof (a as AttachmentInput).file_name !== "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Setiap attachment harus memiliki file_url dan file_name.",
          },
          { status: 422 },
        );
      }
      attachmentList.push(a as AttachmentInput);
    }
  }

  // ── Verify order_item ownership + parent order status in one query ────
  const [item] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      orderStatus: orders.status,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.id, order_item_id),
        eq(orders.userId, userId),
      ),
    )
    .limit(1);

  if (!item) {
    return NextResponse.json(
      { success: false, message: "Item pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  if (item.orderStatus !== "DELIVERED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Pengaduan hanya dapat diajukan untuk pesanan yang sudah diterima (DELIVERED).",
      },
      { status: 409 },
    );
  }

  // ── Prevent duplicate complaint on the same item ──────────────────────
  const [existing] = await db
    .select({ id: complaints.id })
    .from(complaints)
    .where(eq(complaints.orderItemId, order_item_id))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      {
        success: false,
        message: "Pengaduan untuk item ini sudah pernah diajukan.",
      },
      { status: 409 },
    );
  }

  // ── Insert complaint ──────────────────────────────────────────────────
  const complaintId = crypto.randomUUID();
  await db.insert(complaints).values({
    id: complaintId,
    orderItemId: order_item_id,
    userId,
    // The API accepts `reason` and maps it to the DB `subject` column.
    subject: reason.trim(),
    description: description.trim(),
    status: "open",
  });

  // ── Insert attachments ────────────────────────────────────────────────
  const insertedAttachments: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string | null;
  }> = [];

  if (attachmentList.length > 0) {
    const attachmentValues = attachmentList.map((a) => ({
      id: crypto.randomUUID(),
      complaintId,
      fileUrl: a.file_url,
      fileName: a.file_name,
      fileType: a.file_type ?? null,
    }));
    await db.insert(complaintAttachments).values(attachmentValues);
    for (const v of attachmentValues) {
      insertedAttachments.push({
        id: v.id,
        file_url: v.fileUrl,
        file_name: v.fileName,
        file_type: v.fileType,
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: "Pengaduan berhasil diajukan.",
      data: {
        id: complaintId,
        order_item_id,
        subject: reason.trim(),
        description: description.trim(),
        status: "open",
        attachments: insertedAttachments,
        created_at: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}

// ── GET /api/complaints ──────────────────────────────────────────────────────

/**
 * List the logged-in user's own complaints, newest first.
 *
 * Each complaint includes its attachments and the current status so customers
 * can track progress.
 */
export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ── Fetch complaints ──────────────────────────────────────────────────
  const complaintRows = await db
    .select({
      id: complaints.id,
      orderItemId: complaints.orderItemId,
      subject: complaints.subject,
      description: complaints.description,
      status: complaints.status,
      resolution: complaints.resolution,
      resolvedAt: complaints.resolvedAt,
      createdAt: complaints.createdAt,
      updatedAt: complaints.updatedAt,
    })
    .from(complaints)
    .where(eq(complaints.userId, userId))
    .orderBy(desc(complaints.createdAt));

  if (complaintRows.length === 0) {
    return NextResponse.json({ success: true, data: [] });
  }

  // ── Fetch attachments for all returned complaints in one query ────────
  const complaintIds = complaintRows.map((c) => c.id);
  const attachmentRows = await db
    .select({
      id: complaintAttachments.id,
      complaintId: complaintAttachments.complaintId,
      fileUrl: complaintAttachments.fileUrl,
      fileName: complaintAttachments.fileName,
      fileType: complaintAttachments.fileType,
      createdAt: complaintAttachments.createdAt,
    })
    .from(complaintAttachments)
    .where(inArray(complaintAttachments.complaintId, complaintIds));

  // Build a map complaintId → attachments[]
  const attachmentMap: Record<
    string,
    Array<{ id: string; file_url: string; file_name: string; file_type: string | null }>
  > = {};
  for (const row of attachmentRows) {
    if (!attachmentMap[row.complaintId]) attachmentMap[row.complaintId] = [];
    attachmentMap[row.complaintId].push({
      id: row.id,
      file_url: row.fileUrl,
      file_name: row.fileName,
      file_type: row.fileType ?? null,
    });
  }

  const data = complaintRows.map((c) => ({
    id: c.id,
    order_item_id: c.orderItemId,
    subject: c.subject,
    description: c.description,
    status: c.status,
    resolution: c.resolution ?? null,
    resolved_at: c.resolvedAt?.toISOString() ?? null,
    attachments: attachmentMap[c.id] ?? [],
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
  }));

  return NextResponse.json({ success: true, data });
}
