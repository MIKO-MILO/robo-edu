/**
 * membership-cron.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Pure cron job functions for membership lifecycle management.
 *
 * Both functions are intentionally free of side-effects beyond the DB so
 * they are easy to unit-test (just pass a testDb instance).
 *
 * Scheduled from src/workers/index.ts at:
 *   - expire cron:   daily at 01:00 WIB (UTC+7 = 18:00 UTC)
 *   - reminder cron: daily at 08:00 WIB (UTC+7 = 01:00 UTC)
 *
 * No "server-only" import — this file runs in the Node.js worker process.
 */

import { and, eq, isNull, lt, lte, gte, isNotNull } from "drizzle-orm";
import { membershipPurchases, users } from "@/src/db/schema";
import { enqueueEmail } from "@/src/lib/queue/email-queue";

// Accept any drizzle db instance so tests can inject testDb()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = any;

// ── Expire cron ───────────────────────────────────────────────────────────────

export interface ExpireResult {
  expiredCount: number;
}

/**
 * Flip every MEMBER whose `membership_expires_at` is in the past to NOT_MEMBER.
 *
 * Run daily at 01:00 WIB. The batch update is intentionally not wrapped in a
 * single transaction — partial success is acceptable (the cron retries the
 * next day for any that were missed).
 *
 * @param db   Drizzle instance (app db or test db)
 * @param now  Current time — injectable for testing (default: `new Date()`)
 */
export async function runExpireMemberships(
  db: AnyDb,
  now: Date = new Date(),
): Promise<ExpireResult> {
  // Find all MEMBER users whose expiry timestamp is strictly in the past.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const expired: Array<{ id: string }> = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.membershipStatus, "MEMBER"),
        isNotNull(users.membershipExpiresAt),
        lt(users.membershipExpiresAt, now),
      ),
    );

  if (expired.length === 0) {
    console.log("[cron:expire] No expired memberships found.");
    return { expiredCount: 0 };
  }

  // Batch-update all expired users.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await db
    .update(users)
    .set({ membershipStatus: "NOT_MEMBER" })
    .where(
      and(
        eq(users.membershipStatus, "MEMBER"),
        isNotNull(users.membershipExpiresAt),
        lt(users.membershipExpiresAt, now),
      ),
    );

  console.log(`[cron:expire] Flipped ${expired.length} expired MEMBER(s) to NOT_MEMBER.`);
  return { expiredCount: expired.length };
}

// ── Reminder cron ─────────────────────────────────────────────────────────────

export interface ReminderResult {
  h7Enqueued: number;
  h3Enqueued: number;
}

/**
 * Find PAID membership_purchase rows expiring in exactly 7 or 3 days and
 * enqueue a reminder email job for each one that hasn't been reminded yet.
 *
 * "Exactly N days" is implemented as a 24-hour window centred at N days:
 *   ends_at ∈ [now + N*24h, now + (N+1)*24h)
 *
 * The `reminder_h7_sent_at` / `reminder_h3_sent_at` stamps act as
 * idempotency guards — a purchase that already has the stamp is skipped,
 * so the cron is safe to re-run if it crashes mid-batch.
 *
 * @param db   Drizzle instance (app db or test db)
 * @param now  Current time — injectable for testing (default: `new Date()`)
 */
export async function runReminderQueue(
  db: AnyDb,
  now: Date = new Date(),
): Promise<ReminderResult> {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const stamp = new Date();

  /**
   * Returns [windowStart, windowEnd) for N days from now.
   * Both bounds are Date objects so Drizzle writes them correctly.
   */
  function window(days: number): [Date, Date] {
    return [
      new Date(now.getTime() + days * MS_PER_DAY),
      new Date(now.getTime() + (days + 1) * MS_PER_DAY),
    ];
  }

  // ── H-7 ────────────────────────────────────────────────────────────────────
  const [h7Start, h7End] = window(7);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const h7Rows: Array<{ id: string; userId: string }> = await db
    .select({ id: membershipPurchases.id, userId: membershipPurchases.userId })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.status, "PAID"),
        isNotNull(membershipPurchases.endsAt),
        gte(membershipPurchases.endsAt, h7Start),
        lt(membershipPurchases.endsAt, h7End),
        isNull(membershipPurchases.reminderH7SentAt),
      ),
    );

  let h7Enqueued = 0;
  for (const row of h7Rows) {
    try {
      await enqueueEmail(
        {
          type: "membership-reminder-h7",
          membershipPurchaseId: row.id,
          userId: row.userId,
        },
        `reminder-h7:${row.id}`,
      );

      // Stamp immediately so a crash-and-retry doesn't double-enqueue.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await db
        .update(membershipPurchases)
        .set({ reminderH7SentAt: stamp })
        .where(eq(membershipPurchases.id, row.id));

      h7Enqueued++;
    } catch (err) {
      console.error(`[cron:reminder] Failed to enqueue h7 for purchase ${row.id}:`, err);
      // Don't stamp — will retry next run.
    }
  }

  // ── H-3 ────────────────────────────────────────────────────────────────────
  const [h3Start, h3End] = window(3);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const h3Rows: Array<{ id: string; userId: string }> = await db
    .select({ id: membershipPurchases.id, userId: membershipPurchases.userId })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.status, "PAID"),
        isNotNull(membershipPurchases.endsAt),
        gte(membershipPurchases.endsAt, h3Start),
        lt(membershipPurchases.endsAt, h3End),
        isNull(membershipPurchases.reminderH3SentAt),
      ),
    );

  let h3Enqueued = 0;
  for (const row of h3Rows) {
    try {
      await enqueueEmail(
        {
          type: "membership-reminder-h3",
          membershipPurchaseId: row.id,
          userId: row.userId,
        },
        `reminder-h3:${row.id}`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await db
        .update(membershipPurchases)
        .set({ reminderH3SentAt: stamp })
        .where(eq(membershipPurchases.id, row.id));

      h3Enqueued++;
    } catch (err) {
      console.error(`[cron:reminder] Failed to enqueue h3 for purchase ${row.id}:`, err);
    }
  }

  console.log(`[cron:reminder] H-7: ${h7Enqueued} enqueued, H-3: ${h3Enqueued} enqueued.`);
  return { h7Enqueued, h3Enqueued };
}
