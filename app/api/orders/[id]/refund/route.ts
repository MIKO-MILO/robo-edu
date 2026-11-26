import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments, refunds, refundAttachments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import crypto from "node:crypto";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/refund
 *
 * User-facing endpoint: submit a return/refund request for a delivered or
 * completed order. This creates a refund row with status PENDING so admin
 * can review and process it.
 *
 * Body JSON:
 *   reason           — required, short description of return reason
 *   description      — required, full detail of the return request
 *   attachment_urls? — optional array of pre-uploaded MinIO URL strings
 *
 * Rules:
 * - User must be logged in.
 * - The order must belong to the logged-in user.
 * - Order must be DELIVERED or COMPLETED.
 * - A PENDING refund request must not already exist for this order.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: orderId } = await params;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { reason, description, attachment_urls } = body as {
    reason?: unknown;
    description?: unknown;
    /** Optional array of pre-uploaded MinIO URL strings. */
    attachment_urls?: unknown;
  };

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

  // Validate attachment_urls if provided
  const attachmentUrls: string[] = [];
  if (attachment_urls !== undefined && attachment_urls !== null) {
    if (!Array.isArray(attachment_urls)) {
      return NextResponse.json(
        { success: false, message: "attachment_urls harus berupa array." },
        { status: 422 },
      );
    }
    for (const u of attachment_urls as unknown[]) {
      if (typeof u !== "string" || !u.trim()) {
        return NextResponse.json(
          { success: false, message: "Setiap item di attachment_urls harus berupa string URL." },
          { status: 422 },
        );
      }
      attachmentUrls.push(u.trim());
    }
  }

  const reasonStr = reason.trim();
  const descriptionStr = description.trim();

  // ── Fetch order (ownership check) ─────────────────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  const status = order.status.toUpperCase();

  // ── Validate order status ─────────────────────────────────────────────────
  if (status !== "DELIVERED" && status !== "COMPLETED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Pengajuan pengembalian hanya dapat dilakukan untuk pesanan yang sudah diterima (DELIVERED atau COMPLETED).",
      },
      { status: 409 },
    );
  }

  // ── Fetch the latest PAID payment for this order ──────────────────────────
  const [payment] = await db
    .select({ id: payments.id, amount: payments.amount })
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  if (!payment) {
    return NextResponse.json(
      { success: false, message: "Data pembayaran tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Check for existing pending refund request ─────────────────────────────
  const [existingRefund] = await db
    .select({ id: refunds.id, status: refunds.status })
    .from(refunds)
    .where(and(eq(refunds.orderId, orderId), eq(refunds.status, "PENDING")))
    .limit(1);

  if (existingRefund) {
    return NextResponse.json(
      {
        success: false,
        message: "Pengajuan pengembalian untuk pesanan ini sudah ada dan sedang diproses.",
      },
      { status: 409 },
    );
  }

  // ── Create refund request (PENDING — admin will review and process it) ────
  const refundId = crypto.randomUUID();
  const now = new Date();

  await db.insert(refunds).values({
    id: refundId,
    paymentId: payment.id,
    orderId,
    // Full order amount — admin may decide to do partial refund when processing.
    amount: payment.amount,
    reason: `${reasonStr}\n\n${descriptionStr}`,
    // User-initiated requests are always MANUAL (no Midtrans API called yet).
    method: "MANUAL",
    proofUrl: null,
    restoreQuota: false,
    // processedBy references the user who submitted the request.
    processedBy: userId,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  });

  // ── Insert attachments ────────────────────────────────────────────────────
  if (attachmentUrls.length > 0) {
    const attachmentValues = attachmentUrls.map((url) => {
      let fileName: string;
      try {
        const pathname = new URL(url).pathname;
        fileName = pathname.split("/").filter(Boolean).pop() ?? url;
      } catch {
        fileName = url;
      }
      return {
        id: crypto.randomUUID(),
        refundId,
        fileUrl: url,
        fileName,
        createdAt: now,
      };
    });
    await db.insert(refundAttachments).values(attachmentValues);
  }

  return NextResponse.json(
    {
      success: true,
      message: "Pengajuan pengembalian berhasil dikirim. Tim kami akan meninjau permintaan Anda.",
      data: {
        id: refundId,
        order_id: orderId,
        order_number: order.orderNumber,
        amount: payment.amount,
        reason: reasonStr,
        description: descriptionStr,
        status: "PENDING",
        attachment_urls: attachmentUrls,
        created_at: now.toISOString(),
      },
    },
    { status: 201 },
  );
}
