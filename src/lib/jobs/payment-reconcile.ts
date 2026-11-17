/**
 * payment-reconcile.ts
 * ──────────────────────────────────────────────────────────────────────────
 * BullMQ job handler: fired per payment shortly after expiry_time.
 *
 * Steps:
 *   1. Load the payment row. If not found or already in a terminal state
 *      (PAID / FAILED / EXPIRED / REFUNDED) → skip (idempotent).
 *   2. Call Midtrans Get Transaction Status API.
 *   3. Resolve the new PaymentState from the Midtrans response.
 *   4. Update payment row; if order is still PENDING, advance order status
 *      (mirrors the payment/05 webhook handler pattern exactly).
 *
 * NOTE: No "server-only" guard — this file runs in the worker process.
 */

import { and, eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "@/src/db/schema";
import { orders, payments } from "@/src/db/schema";
import {
  TERMINAL_PAYMENT_STATES,
  getTransactionStatusCoreApi,
  resolvePaymentState,
} from "@/src/lib/payments/midtrans-worker";

type Db = MySql2Database<typeof schema>;

export interface PaymentReconcileInput {
  paymentId: string;
  midtransOrderId: string;
  orderId: string;
}

/**
 * Run a single payment-reconcile job.
 *
 * @param db    Drizzle instance from the worker.
 * @param input Job payload from the BullMQ queue.
 */
export async function runPaymentReconcile(
  db: Db,
  input: PaymentReconcileInput,
): Promise<void> {
  const { paymentId, midtransOrderId, orderId } = input;

  // ── 1. Load payment ───────────────────────────────────────────────────────
  const [payment] = await db
    .select({
      id: payments.id,
      status: payments.status,
      orderId: payments.orderId,
    })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment) {
    console.warn(
      `[job:payment-reconcile] Payment ${paymentId} not found — skipping.`,
    );
    return;
  }

  // ── 2. Idempotency: skip if already at a terminal state ───────────────────
  if (TERMINAL_PAYMENT_STATES.has(payment.status as "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED")) {
    console.log(
      `[job:payment-reconcile] Payment ${paymentId} is already ${payment.status} — skipping.`,
    );
    return;
  }

  // ── 3. Query Midtrans ─────────────────────────────────────────────────────
  let notification;
  try {
    notification = await getTransactionStatusCoreApi(midtransOrderId);
  } catch (err) {
    console.error(
      `[job:payment-reconcile] Midtrans status query failed for ${midtransOrderId}:`,
      err,
    );
    throw err; // Let BullMQ retry via backoff policy.
  }

  const newState = resolvePaymentState(notification);

  // null = chargeback — no payment status change needed.
  if (newState === null) {
    console.log(
      `[job:payment-reconcile] Chargeback notification for ${midtransOrderId} — no status change.`,
    );
    return;
  }

  // Don't downgrade PENDING → PENDING — wait for a real state change.
  if (newState === "PENDING") {
    console.log(
      `[job:payment-reconcile] Payment ${paymentId} still PENDING at Midtrans — no update.`,
    );
    return;
  }

  const timestamp = notification.transaction_time
    ? new Date(notification.transaction_time)
    : new Date();

  // ── 4. Load the linked order ──────────────────────────────────────────────
  const [order] = await db
    .select({ id: orders.id, status: orders.status, paidAt: orders.paidAt })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    console.warn(
      `[job:payment-reconcile] Order ${orderId} not found — updating payment only.`,
    );
  }

  // ── 5. Apply update in a transaction ─────────────────────────────────────
  await db.transaction(async (tx) => {
    // Re-read inside tx for optimistic concurrency (mirrors webhook handler).
    const [lockedPayment] = await tx
      .select({ status: payments.status })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    // Guard: another process (webhook) may have already updated the payment.
    if (
      lockedPayment &&
      TERMINAL_PAYMENT_STATES.has(lockedPayment.status as "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED")
    ) {
      console.log(
        `[job:payment-reconcile] Payment ${paymentId} reached ${lockedPayment.status} concurrently — skipping update.`,
      );
      return;
    }

    await tx
      .update(payments)
      .set({
        midtransTransactionId: notification.transaction_id ?? null,
        paymentType: notification.payment_type,
        paymentMethod: notification.payment_type,
        status: newState,
        transactionTime: timestamp,
        settlementTime: newState === "PAID" ? timestamp : null,
        fraudStatus: notification.fraud_status ?? null,
        rawResponse: notification,
      })
      .where(
        and(
          eq(payments.id, paymentId),
          // Extra guard: only update if still PENDING.
          eq(payments.status, "PENDING"),
        ),
      );

    // Advance order status only when the order is still PENDING.
    if (order && order.status === "PENDING") {
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
            newOrderStatus === "CANCELLED" ? new Date() : undefined,
        })
        .where(eq(orders.id, orderId));
    }
  });

  console.log(
    `[job:payment-reconcile] ✅ Payment ${paymentId} (${midtransOrderId}) synced: PENDING → ${newState}.`,
  );
}
