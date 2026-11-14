/**
 * Behavior tests for ticket 18: membership expire + reminder crons.
 *
 * Both cron functions accept an injectable `db` and `now` parameter so
 * we can test them against the real test database without needing to mock
 * the system clock or wait for a scheduled time.
 *
 * The email queue (enqueueEmail) is mocked via vi.mock so tests never
 * require a live Redis connection.
 *
 * Covered criteria:
 *   1. Expire cron flips expired MEMBER → NOT_MEMBER (with past-expiry user).
 *   2. Expire cron does NOT touch users whose expiry is in the future.
 *   3. Expire cron does NOT touch users already NOT_MEMBER.
 *   4. Reminder cron enqueues h7 job for purchases ending in 7 days.
 *   5. Reminder cron enqueues h3 job for purchases ending in 3 days.
 *   6. Reminder cron stamps sent_at so a second run does NOT re-enqueue.
 *   7. Reminder cron ignores purchases outside the 7/3-day windows.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { runExpireMemberships, runReminderQueue } from "@/src/lib/cron/membership-cron";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── Mock email queue ─────────────────────────────────────────────────────────
// Tests must not require a live Redis connection.
// Use vi.hoisted so the mock fn is accessible in both the factory and tests.
const { mockEnqueueEmail } = vi.hoisted(() => ({
  mockEnqueueEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/src/lib/queue/email-queue", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/queue/email-queue")>();
  return { ...original, enqueueEmail: mockEnqueueEmail };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const MS = {
  day: 24 * 60 * 60 * 1000,
};

/** Insert a MEMBER user with a custom expiry. Returns the user id. */
async function seedMemberUser(opts: {
  id?: string;
  expiresAt: Date;
}): Promise<string> {
  const id = opts.id ?? crypto.randomUUID();
  await testDb().insert(schema.users).values({
    id,
    name: "Test Member",
    email: `member-${id}@test.com`,
    password: "hash",
    role: "CUSTOMER",
    membershipStatus: "MEMBER",
    membershipExpiresAt: opts.expiresAt,
    isActive: true,
  });
  return id;
}

/** Insert a PAID membership_purchase with endsAt. Returns the purchase id. */
async function seedPaidPurchase(opts: {
  userId: string;
  endsAt: Date;
  reminderH7SentAt?: Date | null;
  reminderH3SentAt?: Date | null;
}): Promise<string> {
  const id = crypto.randomUUID();
  await testDb().insert(schema.membershipPurchases).values({
    id,
    purchaseNumber: `MBR-TEST-${id.slice(0, 8)}`,
    userId: opts.userId,
    priceSnapshot: "150000",
    durationMonthsSnapshot: 1,
    planNameSnapshot: "Plus",
    status: "PAID",
    endsAt: opts.endsAt,
    paidAt: new Date(),
    startsAt: new Date(),
    reminderH7SentAt: opts.reminderH7SentAt ?? null,
    reminderH3SentAt: opts.reminderH3SentAt ?? null,
  });
  return id;
}

// ── Expire cron tests ─────────────────────────────────────────────────────────

describe("runExpireMemberships", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("flips an expired MEMBER to NOT_MEMBER", async () => {
    const expiredAt = new Date(Date.now() - MS.day); // yesterday
    const userId = await seedMemberUser({ expiresAt: expiredAt });

    const result = await runExpireMemberships(testDb());

    expect(result.expiredCount).toBeGreaterThanOrEqual(1);

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    expect(user!.membershipStatus).toBe("NOT_MEMBER");
  });

  it("does NOT flip a MEMBER whose expiry is in the future", async () => {
    const futureExpiry = new Date(Date.now() + 30 * MS.day); // 30 days from now
    const userId = await seedMemberUser({ expiresAt: futureExpiry });

    await runExpireMemberships(testDb());

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    // Must still be MEMBER
    expect(user!.membershipStatus).toBe("MEMBER");
  });

  it("does NOT touch a user who is already NOT_MEMBER", async () => {
    // The fixture's regularUser is NOT_MEMBER with no expiry
    const result = await runExpireMemberships(testDb());

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);

    expect(user!.membershipStatus).toBe("NOT_MEMBER");
    // expiredCount should not include non-members
    // (we can only assert regularUser wasn't affected; count may include others)
    expect(result.expiredCount).toBeGreaterThanOrEqual(0);
  });

  it("injectable `now` — treats a purchase as expired only when now > expiresAt", async () => {
    // expiresAt is 1 day in the future from real now
    const expiresAt = new Date(Date.now() + MS.day);
    const userId = await seedMemberUser({ expiresAt });

    // Run with `now` = 2 days in the future → should expire
    const futureNow = new Date(Date.now() + 2 * MS.day);
    await runExpireMemberships(testDb(), futureNow);

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    expect(user!.membershipStatus).toBe("NOT_MEMBER");
  });
});

// ── Reminder cron tests ───────────────────────────────────────────────────────

describe("runReminderQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enqueues h7 reminder for a purchase ending in exactly 7 days", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * MS.day + 60_000); // 7 days + 1 min
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });
    await seedPaidPurchase({ userId, endsAt });

    const result = await runReminderQueue(testDb(), now);

    expect(result.h7Enqueued).toBeGreaterThanOrEqual(1);
    expect(mockEnqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type: "membership-reminder-h7" }),
      expect.stringMatching(/^reminder-h7:/),
    );
  });

  it("enqueues h3 reminder for a purchase ending in exactly 3 days", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 3 * MS.day + 60_000); // 3 days + 1 min
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });
    await seedPaidPurchase({ userId, endsAt });

    const result = await runReminderQueue(testDb(), now);

    expect(result.h3Enqueued).toBeGreaterThanOrEqual(1);
    expect(mockEnqueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ type: "membership-reminder-h3" }),
      expect.stringMatching(/^reminder-h3:/),
    );
  });

  it("stamps reminder_h7_sent_at after enqueuing (idempotency guard)", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * MS.day + 60_000);
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });
    const purchaseId = await seedPaidPurchase({ userId, endsAt });

    await runReminderQueue(testDb(), now);

    const [purchase] = await testDb()
      .select({ reminderH7SentAt: schema.membershipPurchases.reminderH7SentAt })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, purchaseId))
      .limit(1);

    // Stamp must be set
    expect(purchase!.reminderH7SentAt).not.toBeNull();
  });

  it("does NOT re-enqueue h7 on a second run (sent_at already stamped)", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * MS.day + 60_000);
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });
    // Pre-stamp the h7 sent_at as if reminder was already sent
    await seedPaidPurchase({ userId, endsAt, reminderH7SentAt: new Date() });

    const result = await runReminderQueue(testDb(), now);

    // This purchase should be skipped because reminderH7SentAt is set
    expect(mockEnqueueEmail).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "membership-reminder-h7" }),
      expect.anything(),
    );
    // h7Enqueued count for this test should be 0 (only this purchase in window)
    expect(result.h7Enqueued).toBe(0);
  });

  it("does NOT enqueue for a purchase outside the 7-day window (e.g. 10 days away)", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 10 * MS.day); // 10 days → outside both windows
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });
    await seedPaidPurchase({ userId, endsAt });

    await runReminderQueue(testDb(), now);

    expect(mockEnqueueEmail).not.toHaveBeenCalled();
  });

  it("does NOT enqueue for a PENDING (not PAID) purchase", async () => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * MS.day + 60_000);
    const userId = await seedMemberUser({ expiresAt: new Date(endsAt.getTime() + MS.day) });

    // Insert a PENDING purchase (not PAID)
    await testDb().insert(schema.membershipPurchases).values({
      id: crypto.randomUUID(),
      purchaseNumber: `MBR-PENDING-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      priceSnapshot: "150000",
      durationMonthsSnapshot: 1,
      planNameSnapshot: "Plus",
      status: "PENDING",   // ← not PAID
      endsAt,
      paidAt: null,
      startsAt: null,
    });

    await runReminderQueue(testDb(), now);

    expect(mockEnqueueEmail).not.toHaveBeenCalled();
  });
});
