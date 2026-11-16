/**
 * order-queue.ts
 * ──────────────────────────────────────────────────────────────────────────
 * BullMQ Queue for order-related background jobs:
 *
 *   - order-auto-cancel  : scheduled repeatable job (every 5 min) that sweeps
 *                          expired PENDING orders and cancels them.
 *   - payment-reconcile  : delayed job per payment, fired after expiry_time
 *                          (+70 s for OVO, +2 min for other methods), that
 *                          fetches the latest Midtrans status and syncs it.
 *
 * Only the Queue (producer side) lives here.
 * The Worker (consumer) lives in src/workers/index.ts.
 *
 * NOTE: Does NOT import "server-only" — safe to import from both Next.js
 * route handlers and the worker process.
 */

import { Queue } from "bullmq";
import { getRedisConnection } from "./email-queue";

// ── Queue name ────────────────────────────────────────────────────────────────

export const ORDER_QUEUE_NAME = "order";

// ── Job data types ────────────────────────────────────────────────────────────

/**
 * Repeatable sweep job — no additional payload needed.
 * BullMQ runs this on a fixed schedule via `repeat.every`.
 */
export interface OrderAutoCancelJobData {
  type: "order-auto-cancel";
}

/**
 * Per-payment delayed job — enqueued at checkout time with a delay so it
 * fires shortly after the payment's expiry_time.
 */
export interface PaymentReconcileJobData {
  type: "payment-reconcile";
  /** Internal payment row ID (payments.id). */
  paymentId: string;
  /** Midtrans order ID (payments.midtrans_order_id) used to query Midtrans. */
  midtransOrderId: string;
  /** Parent order ID (payments.order_id) used for status sync. */
  orderId: string;
}

export type OrderJobData = OrderAutoCancelJobData | PaymentReconcileJobData;

// ── Queue instance ────────────────────────────────────────────────────────────

let _queue: Queue<OrderJobData> | null = null;

/**
 * Returns the singleton BullMQ Queue for order jobs.
 * Lazily created so build/lint steps don't require a live Redis connection.
 */
export function getOrderQueue(): Queue<OrderJobData> {
  if (!_queue) {
    _queue = new Queue<OrderJobData>(ORDER_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { age: 24 * 60 * 60 },
        removeOnFail: { age: 7 * 24 * 60 * 60 },
        attempts: 3,
        backoff: { type: "exponential", delay: 10_000 },
      },
    });
  }
  return _queue;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Enqueue a payment-reconcile job with a delay calculated from expiry_time.
 *
 * Delay schedule:
 *   - OVO: expiryTime + 70 seconds  (OVO push notif can arrive a bit late)
 *   - All other methods: expiryTime + 2 minutes
 *
 * @param paymentId       payments.id
 * @param midtransOrderId payments.midtrans_order_id
 * @param orderId         payments.order_id
 * @param expiryTime      The payment's expiry_time (from Midtrans, clamped to order.expires_at)
 * @param paymentChannel  The payment channel (e.g. "ovo", "bca", "gopay")
 */
export async function enqueuePaymentReconcile(opts: {
  paymentId: string;
  midtransOrderId: string;
  orderId: string;
  expiryTime: Date;
  paymentChannel: string | null;
}): Promise<void> {
  const { paymentId, midtransOrderId, orderId, expiryTime, paymentChannel } =
    opts;

  const isOvo = (paymentChannel ?? "").toLowerCase() === "ovo";
  const bufferMs = isOvo ? 70_000 : 2 * 60_000;

  const fireAt = expiryTime.getTime() + bufferMs;
  const delayMs = Math.max(0, fireAt - Date.now());

  const data: PaymentReconcileJobData = {
    type: "payment-reconcile",
    paymentId,
    midtransOrderId,
    orderId,
  };

  // Job ID: stable per payment attempt — prevents duplicate jobs on
  // double-enqueue (e.g. checkout retry with same payment row).
  await getOrderQueue().add(data.type, data, {
    jobId: `payment-reconcile-${paymentId}`,
    delay: delayMs,
  });
}

/**
 * Register the repeatable order-auto-cancel sweep job.
 *
 * BullMQ v6+ uses `queue.upsertJobScheduler()` instead of the old
 * `queue.add(..., { repeat })` API. Calling this multiple times is safe —
 * upsert deduplicates by schedulerId.
 *
 * Call once at worker startup before the Worker starts consuming.
 */
export async function registerOrderAutoCancelJob(): Promise<void> {
  const data: OrderAutoCancelJobData = { type: "order-auto-cancel" };
  await getOrderQueue().upsertJobScheduler(
    "order-auto-cancel-every-5min", // stable scheduler ID
    { every: 5 * 60 * 1000 },        // 5 minutes in ms
    {
      name: data.type,
      data,
      opts: {
        removeOnComplete: { age: 24 * 60 * 60 },
        removeOnFail: { age: 7 * 24 * 60 * 60 },
      },
    },
  );
}
