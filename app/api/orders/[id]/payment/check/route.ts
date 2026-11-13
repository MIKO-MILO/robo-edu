import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import {
  getCoreApiStatus,
  resolvePaymentState,
  TERMINAL_PAYMENT_STATES,
  type PaymentState,
} from "@/src/lib/payments/midtrans";
import { enqueueEmail } from "@/src/lib/queue/email-queue";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/payment/check
 *
 * Manually check the payment status of the latest PENDING payment attempt by
 * querying Midtrans `GET /v2/{midtrans_order_id}/status`, syncing the result
 * to the database, and returning the updated status.
 *
 * Flow:
 *   1. Auth — must be the order owner.
 *   2. Load the latest payment attempt for this order.
 *   3. If no payment exists OR the payment is already in a terminal state
 *      (PAID / FAILED / EXPIRED / REFUNDED), return the current status without
 *      calling Midtrans.
 *   4. Call Midtrans Core API `transaction.status(midtrans_order_id)`.
 *   5. Map the Midtrans response using the same `resolvePaymentState` logic as
 *      the webhook handler.
 *   6. If the state changed, update `payments` and `orders` in a DB transaction
 *      (same advancement rules as the webhook).
 *   7. Return `{ status, payment_instruction, expiry_time }`.
 *
 * Authentication: must be the order owner (userId from session cookie).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ─────────────────────────────────────────────────────────────────
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
      paidAt: orders.paidAt,
      cancelledAt: orders.cancelledAt,
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
      midtransOrderId: payments.midtransOrderId,
      midtransTransactionId: payments.midtransTransactionId,
      paymentType: payments.paymentType,
      paymentChannel: payments.paymentChannel,
      paymentInstruction: payments.paymentInstruction,
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

  // ── No payment or already terminal → return current status ──────────────
  const currentStatus = (payment?.status ?? "PENDING") as PaymentState;

  if (!payment || TERMINAL_PAYMENT_STATES.has(currentStatus)) {
    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        payment_instruction: payment?.paymentInstruction ?? null,
        expiry_time: payment?.expiryTime?.toISOString() ?? null,
      },
    });
  }

  // ── Query Midtrans for the current transaction status ─────────────────────
  let midtransStatus: Record<string, unknown> | null;
  try {
    midtransStatus = await getCoreApiStatus(payment.midtransOrderId);
  } catch {
    // Midtrans API error — return current status without updating DB
    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        payment_instruction: payment.paymentInstruction ?? null,
        expiry_time: payment.expiryTime?.toISOString() ?? null,
      },
    });
  }

  // Transaction not found at Midtrans — return current status
  if (!midtransStatus) {
    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        payment_instruction: payment.paymentInstruction ?? null,
        expiry_time: payment.expiryTime?.toISOString() ?? null,
      },
    });
  }

  // ── Map Midtrans status to our internal payment state ─────────────────────
  const transactionStatus =
    typeof midtransStatus.transaction_status === "string"
      ? midtransStatus.transaction_status
      : "pending";
  const fraudStatus =
    typeof midtransStatus.fraud_status === "string"
      ? midtransStatus.fraud_status
      : undefined;

  const newState = resolvePaymentState(transactionStatus, fraudStatus);

  // If Midtrans says PENDING or chargeback (null), nothing to update
  if (newState === null || newState === "PENDING") {
    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        payment_instruction: payment.paymentInstruction ?? null,
        expiry_time: payment.expiryTime?.toISOString() ?? null,
      },
    });
  }

  // ── Idempotency: payment already terminal in DB ──────────────────────────
  if (TERMINAL_PAYMENT_STATES.has(currentStatus)) {
    return NextResponse.json({
      success: true,
      data: {
        status: currentStatus,
        payment_instruction: payment.paymentInstruction ?? null,
        expiry_time: payment.expiryTime?.toISOString() ?? null,
      },
    });
  }

  // ── Sync DB with the new state ───────────────────────────────────────────
  const timestamp = (() => {
    const tt = midtransStatus.transaction_time;
    if (typeof tt === "string" && tt) {
      const d = new Date(tt);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  })();

  const midtransTransactionId =
    typeof midtransStatus.transaction_id === "string"
      ? midtransStatus.transaction_id
      : payment.midtransTransactionId;

  const paymentTypeFromMidtrans =
    typeof midtransStatus.payment_type === "string"
      ? midtransStatus.payment_type
      : payment.paymentType;

  let justPaid = false;

  await db.transaction(async (tx) => {
    // ── Update payment ──────────────────────────────────────────────────────
    await tx
      .update(payments)
      .set({
        midtransTransactionId: midtransTransactionId,
        paymentType: paymentTypeFromMidtrans,
        paymentMethod: paymentTypeFromMidtrans,
        status: newState,
        transactionTime: timestamp,
        settlementTime: newState === "PAID" ? timestamp : null,
        fraudStatus: fraudStatus ?? null,
        rawResponse: midtransStatus,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // ── Update order (only if currently PENDING) ────────────────────────────
    // Same advancement rules as the webhook: never overwrite non-PENDING statuses.
    if (order.status === "PENDING") {
      const newOrderStatus =
        newState === "PAID"
          ? "PAID"
          : newState === "FAILED" || newState === "EXPIRED"
            ? "CANCELLED"
            : newState === "REFUNDED"
              ? "REFUNDED"
              : order.status;

      await tx
        .update(orders)
        .set({
          status: newOrderStatus,
          paidAt: newState === "PAID" ? timestamp : order.paidAt,
          cancelledAt:
            newOrderStatus === "CANCELLED" ? timestamp : order.cancelledAt,
        })
        .where(eq(orders.id, order.id));

      if (newState === "PAID") {
        justPaid = true;
      }
    }
  });

  // ── Enqueue order receipt email (outside DB tx, non-fatal) ────────────────
  // Same jobId pattern as the webhook for deduplication.
  if (justPaid) {
    try {
      await enqueueEmail(
        { type: "order-receipt", orderId: order.id },
        `order-receipt-${payment.id}`,
      );
    } catch (err) {
      console.error("[payment-check] Failed to enqueue order-receipt email:", err);
    }
  }

  // ── Resolve payment_instruction for the response ──────────────────────────
  // Dedicated column wins (not overwritten by rawResponse update).
  const paymentInstruction =
    payment.paymentInstruction != null
      ? payment.paymentInstruction
      : midtransStatus.payment_instruction != null
        ? (midtransStatus.payment_instruction as Record<string, unknown>)
        : null;

  return NextResponse.json({
    success: true,
    data: {
      status: newState,
      payment_instruction: paymentInstruction,
      expiry_time: payment.expiryTime?.toISOString() ?? null,
    },
  });
}
