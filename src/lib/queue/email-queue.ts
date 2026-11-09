/**
 * email-queue.ts
 * ──────────────────────────────────────────────────────────────────────────
 * BullMQ Queue for outbound transactional emails.
 *
 * Only the Queue (producer side) lives here. The Worker (consumer) lives in
 * src/workers/index.ts so it can run as a separate Node.js process.
 *
 * Job idempotency: callers MUST pass a stable `jobId` (e.g. the order ID or
 * membership-purchase ID). BullMQ deduplicates jobs with the same ID when
 * the queue is not yet processed, preventing duplicate emails from duplicate
 * Midtrans webhook notifications.
 *
 * NOTE: this module does NOT import "server-only" — it is safe to import
 * from both Next.js route handlers and the worker process.
 */

import { Queue } from "bullmq";
import IORedis from "ioredis";

// ── Redis connection ──────────────────────────────────────────────────────────

function getRedisUrl(): string {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not configured");
  return url;
}

/**
 * Lazily created Redis connection shared by the Queue instance.
 * `lazyConnect: true` + `maxRetriesPerRequest: null` are required by BullMQ.
 */
let _redis: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!_redis) {
    _redis = new IORedis(getRedisUrl(), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }
  return _redis;
}

// ── Queue name ────────────────────────────────────────────────────────────────

export const EMAIL_QUEUE_NAME = "email";

// ── Job data types ────────────────────────────────────────────────────────────

/** Payload for the `order-receipt` job — sent when an order payment settles. */
export interface OrderReceiptJobData {
  type: "order-receipt";
  orderId: string;
}

/** Payload for the `membership-receipt` job — sent when a membership purchase settles. */
export interface MembershipReceiptJobData {
  type: "membership-receipt";
  membershipPurchaseId: string;
  userId: string;
}

/** Payload for the H-7 membership expiry reminder. */
export interface MembershipReminderJobData {
  type: "membership-reminder-h7" | "membership-reminder-h3";
  membershipPurchaseId: string;
  userId: string;
}

export type EmailJobData =
  | OrderReceiptJobData
  | MembershipReceiptJobData
  | MembershipReminderJobData;

// ── Queue instance ────────────────────────────────────────────────────────────

let _queue: Queue<EmailJobData> | null = null;

/**
 * Returns the singleton BullMQ Queue for email jobs.
 *
 * The queue is lazily created so that Next.js build/lint/type-check steps
 * that never call this function don't require a live Redis connection.
 */
export function getEmailQueue(): Queue<EmailJobData> {
  if (!_queue) {
    _queue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        // Keep completed jobs for 24 h and failed for 7 days for debugging.
        removeOnComplete: { age: 24 * 60 * 60 },
        removeOnFail: { age: 7 * 24 * 60 * 60 },
        attempts: 5,
        backoff: { type: "exponential", delay: 5_000 },
      },
    });
  }
  return _queue;
}

/**
 * Enqueue an email job with an idempotency key.
 *
 * BullMQ will silently skip adding a new job when a job with the same
 * `jobId` is already waiting or active in the queue, preventing duplicate
 * emails from duplicate webhook notifications.
 *
 * @param data  Job payload (includes the `type` discriminator)
 * @param jobId Stable unique key — use orderId / purchaseId so retries
 *              from the same source event produce at most one job.
 */
export async function enqueueEmail(
  data: EmailJobData,
  jobId: string,
): Promise<void> {
  await getEmailQueue().add(data.type, data, { jobId });
}
