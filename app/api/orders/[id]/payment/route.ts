import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/payment
 *
 * Returns the order state plus the latest payment attempt for the payment
 * polling page. The frontend polls this endpoint every 3–5 s to detect PAID,
 * FAILED, or EXPIRED transitions.
 *
 * Response includes:
 *   - order.expires_at — used to show the order-level countdown
 *   - payment.payment_instruction — VA number, QR, etc.
 *   - payment.payment_channel — derived from dedicated column then rawResponse
 *   - payment.expiry_time — per-attempt expiry (clamped to order.expires_at at checkout)
 *   - payment.status — PENDING | PAID | FAILED | EXPIRED | REFUNDED
 *   - payment.attempt_number
 *
 * Returns the LATEST attempt ordered by attempt_number DESC, so after a
 * successful retry the new PENDING attempt is surfaced immediately.
 *
 * Authentication: must be the order owner (userId from session cookie).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // ── Fetch order — must belong to this user ───────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      expiresAt: orders.expiresAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Fetch latest payment attempt ─────────────────────────────────────────
  const [payment] = await db
    .select({
      id: payments.id,
      status: payments.status,
      paymentType: payments.paymentType,
      paymentChannel: payments.paymentChannel,
      paymentInstruction: payments.paymentInstruction,
      payerPhoneNumber: payments.payerPhoneNumber,
      amount: payments.amount,
      expiryTime: payments.expiryTime,
      transactionTime: payments.transactionTime,
      attemptNumber: payments.attemptNumber,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  const orderPayload = {
    id: order.id,
    order_number: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    expires_at: order.expiresAt?.toISOString() ?? null,
    created_at: order.createdAt.toISOString(),
  };

  if (!payment) {
    return NextResponse.json({ success: true, data: { order: orderPayload, payment: null } });
  }

  // ── Resolve payment_channel ──────────────────────────────────────────────
  // 1. Dedicated column (set at checkout / retry)
  // 2. rawResponse.payment_channel (Core API webhook)
  // 3. rawResponse.payment_type
  // 4. paymentType column
  // 5. fallback
  const raw = (payment.rawResponse ?? {}) as Record<string, unknown>;
  const paymentChannel =
    typeof payment.paymentChannel === "string" && payment.paymentChannel
      ? payment.paymentChannel
      : typeof raw.payment_channel === "string"
        ? raw.payment_channel
        : typeof raw.payment_type === "string"
          ? raw.payment_type
          : payment.paymentType ?? "bank_transfer";

  // ── Resolve payment_instruction ──────────────────────────────────────────
  // Dedicated column wins — webhook only writes rawResponse, not paymentInstruction.
  const paymentInstruction =
    payment.paymentInstruction != null
      ? payment.paymentInstruction
      : raw.payment_instruction != null
        ? (raw.payment_instruction as Record<string, unknown>)
        : null;

  return NextResponse.json({
    success: true,
    data: {
      order: orderPayload,
      payment: {
        id: payment.id,
        status: payment.status,
        payment_type: payment.paymentType,
        payment_channel: paymentChannel,
        payment_instruction: paymentInstruction,
        payer_phone_number: payment.payerPhoneNumber ?? null,
        amount: Number(payment.amount),
        expiry_time: payment.expiryTime?.toISOString() ?? null,
        transaction_time: payment.transactionTime?.toISOString() ?? null,
        attempt_number: payment.attemptNumber,
      },
    },
  });
}
