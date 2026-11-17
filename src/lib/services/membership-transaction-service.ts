import "server-only";

import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments, users } from "@/src/db/schema";
import { chargeCoreApi } from "@/src/lib/payments/midtrans";
import { getSetting } from "@/src/lib/services/settings-service";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Membership purchase expires in 24 hours by default. */
const MEMBERSHIP_EXPIRY_HOURS = 24;

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateMembershipTransactionInput = {
  /** Must come from the authenticated server session, never from a client request body. */
  userId: string;
  /** Plan identifier — only "PLUS" supported for now. */
  package: "PLUS";
  /** Payment method (e.g. "bank_transfer", "gopay"). */
  paymentMethod: string;
  /** Specific payment channel (e.g. "bca_va", "gopay"). */
  paymentChannel: string;
  /** Required for OVO payments. */
  payerPhoneNumber?: string;
};

export type CreateMembershipTransactionResult = {
  purchaseId: string;
  purchaseNumber: string;
  paymentInstruction: unknown;
  expiryTime: string | null;
  status: string;
  total: number;
};

export type PendingPurchaseExistsError = {
  code: "PENDING_PURCHASE_EXISTS";
  purchaseId: string;
  purchaseNumber: string;
};

/** Generate a unique membership purchase number: MBR-<timestamp>-<8 random hex chars>. */
function makePurchaseNumber(): string {
  return `MBR-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

// ── Main service ──────────────────────────────────────────────────────────────

/**
 * Create a Midtrans Core API transaction for a membership purchase.
 *
 * Price and duration are always read from the `settings` table at request time
 * so an admin price change takes effect immediately without a redeploy.
 *
 * Design mirrors `createPaymentTransaction` in transaction-service.ts:
 *   1. Guard: reject if user has an existing PENDING membership_purchase.
 *   2. Guard: reject if voucher field sent (not supported).
 *   3. DB transaction: insert `membership_purchase` (PENDING) + `payments` row.
 *   4. Call Midtrans Core API outside the transaction.
 *   5. Store payment_instruction in `payments.paymentInstruction`.
 *   6. On Core API failure: mark payment + purchase as FAILED.
 *
 * The circular FK (membership_purchase.payment_id → payments.id and
 * payments.membership_purchase_id → membership_purchase.id) is resolved by:
 *   a. Inserting payment with `membershipPurchaseId: null` first.
 *   b. Inserting membership_purchase with `paymentId` set.
 *   c. Back-updating `payments.membershipPurchaseId`.
 * All three writes are inside the same DB transaction so they commit atomically.
 */
export async function createMembershipTransaction(
  input: CreateMembershipTransactionInput,
): Promise<CreateMembershipTransactionResult> {
  // ── Guard: check for existing PENDING purchase ────────────────────────────
  // First, expire any PENDING purchases that have no active (PENDING) payment attempt.
  // This allows users to start fresh when all prior attempts have failed.
  const stalePendingPurchases = await db
    .select({
      id: membershipPurchases.id,
    })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.userId, input.userId),
        eq(membershipPurchases.status, "PENDING"),
      ),
    );

  for (const stale of stalePendingPurchases) {
    // Check if any payment attempt for this purchase is still PENDING
    const [activePendingAttempt] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(
        and(
          eq(payments.membershipPurchaseId, stale.id),
          eq(payments.status, "PENDING"),
        ),
      )
      .limit(1);

    if (!activePendingAttempt) {
      // No active PENDING attempt — mark the purchase EXPIRED so user can retry
      await db
        .update(membershipPurchases)
        .set({ status: "EXPIRED" })
        .where(eq(membershipPurchases.id, stale.id));
    }
  }

  // Now re-check for a genuinely active PENDING purchase
  const [existingPending] = await db
    .select({
      id: membershipPurchases.id,
      purchaseNumber: membershipPurchases.purchaseNumber,
    })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.userId, input.userId),
        eq(membershipPurchases.status, "PENDING"),
      ),
    )
    .limit(1);

  if (existingPending) {
    const err: PendingPurchaseExistsError = {
      code: "PENDING_PURCHASE_EXISTS",
      purchaseId: existingPending.id,
      purchaseNumber: existingPending.purchaseNumber,
    };
    throw Object.assign(new Error("PENDING_PURCHASE_EXISTS"), err);
  }

  // ── Read settings (never hardcode price) ──────────────────────────────────
  const [rawPrice, rawDuration] = await Promise.all([
    getSetting("membership_plus_price"),
    getSetting("membership_plus_duration_months"),
  ]);

  if (!rawPrice || !rawDuration) {
    throw new Error(
      "Membership price or duration is not configured. Please contact the administrator.",
    );
  }

  const price = Number(rawPrice);
  const durationMonths = Number(rawDuration);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Membership price setting is invalid.");
  }
  if (!Number.isInteger(durationMonths) || durationMonths <= 0) {
    throw new Error("Membership duration setting is invalid.");
  }

  const purchaseNumber = makePurchaseNumber();
  const purchaseId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  const midtransOrderId = `${purchaseNumber}-1`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MEMBERSHIP_EXPIRY_HOURS * 60 * 60 * 1000);

  // ── Atomic DB inserts ─────────────────────────────────────────────────────
  await db.transaction(async (tx) => {
    // Insert payment first so membership_purchase can reference it via paymentId FK.
    await tx.insert(payments).values({
      id: paymentId,
      orderId: null,
      membershipPurchaseId: null, // back-filled after membership_purchase is inserted
      midtransOrderId,
      attemptNumber: 1,
      paymentType: input.paymentMethod,
      paymentChannel: input.paymentChannel,
      payerPhoneNumber: input.payerPhoneNumber ?? null,
      status: "PENDING",
      amount: String(price),
    });

    await tx.insert(membershipPurchases).values({
      id: purchaseId,
      purchaseNumber,
      userId: input.userId,
      paymentId,
      priceSnapshot: String(price),
      durationMonthsSnapshot: durationMonths,
      planNameSnapshot: "Plus",
      status: "PENDING",
    });

    // Back-fill the membership_purchase_id on the payment row to satisfy
    // the "exactly one of order_id / membership_purchase_id" invariant.
    await tx
      .update(payments)
      .set({ membershipPurchaseId: purchaseId })
      .where(eq(payments.id, paymentId));
  });

  // ── Fetch user details for Midtrans customer_details ─────────────────────
  const [user] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found.");
  }

  const nameParts = user.name.split(" ");
  const customerDetails = {
    first_name: nameParts[0] ?? user.name,
    last_name: nameParts.slice(1).join(" ") || undefined,
    email: user.email,
    phone: user.phone ?? undefined,
  };

  const itemDetails = [
    {
      id: "MEMBERSHIP_PLUS",
      name: "RoboEdu Membership Plus",
      price,
      quantity: 1,
    },
  ];

  // ── Call Midtrans Core API (outside DB transaction) ───────────────────────
  try {
    const charge = await chargeCoreApi({
      paymentType: input.paymentMethod,
      channel: input.paymentChannel,
      midtransOrderId,
      grossAmount: price,
      customerDetails,
      itemDetails,
      payerPhoneNumber: input.payerPhoneNumber,
      expiry: { duration: MEMBERSHIP_EXPIRY_HOURS, unit: "hour" },
    });

    // Store payment_instruction in the dedicated column (survives webhook rawResponse overwrite)
    await db
      .update(payments)
      .set({
        paymentInstruction: charge.instruction,
        expiryTime: charge.expiryTime ?? expiresAt,
        transactionTime: now,
        rawResponse: charge.raw,
      })
      .where(eq(payments.id, paymentId));

    return {
      purchaseId,
      purchaseNumber,
      paymentInstruction: charge.instruction,
      expiryTime: (charge.expiryTime ?? expiresAt).toISOString(),
      status: "PENDING",
      total: price,
    };
  } catch (error) {
    // Core API call failed — mark both rows as FAILED so the user can retry cleanly.
    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: "FAILED",
          rawResponse: {
            chargeError:
              error instanceof Error ? error.message : "Unknown Core API error",
          },
        })
        .where(eq(payments.id, paymentId));

      await tx
        .update(membershipPurchases)
        .set({ status: "FAILED" })
        .where(eq(membershipPurchases.id, purchaseId));
    });
    // Always surface as PAYMENT_CHARGE_FAILED so the route handler can return 422.
    const chargeErr = new Error("PAYMENT_CHARGE_FAILED");
    (chargeErr as NodeJS.ErrnoException).code = "PAYMENT_CHARGE_FAILED";
    throw chargeErr;
  }
}

// ── Retry service ─────────────────────────────────────────────────────────────

export type RetryMembershipPaymentInput = {
  userId: string;
  purchaseId: string;
  paymentMethod: string;
  paymentChannel: string;
  payerPhoneNumber?: string;
  idempotencyKey?: string;
};

export type RetryMembershipPaymentResult = {
  purchaseId: string;
  purchaseNumber: string;
  paymentInstruction: unknown;
  expiryTime: string | null;
  status: string;
  amount: number;
  attemptNumber: number;
};

/**
 * Retry / change payment method for a PENDING membership purchase.
 * Cancels the old PENDING attempt via Midtrans Cancel API, then charges
 * a new Core API attempt with midtransOrderId = {purchaseNumber}-{N+1}.
 * Idempotent via Idempotency-Key.
 */
export async function retryMembershipPayment(
  input: RetryMembershipPaymentInput,
): Promise<RetryMembershipPaymentResult> {
  const now = new Date();

  // ── Fetch purchase (must belong to this user) ─────────────────────────────
  const [purchase] = await db
    .select({
      id: membershipPurchases.id,
      purchaseNumber: membershipPurchases.purchaseNumber,
      userId: membershipPurchases.userId,
      status: membershipPurchases.status,
      priceSnapshot: membershipPurchases.priceSnapshot,
      planNameSnapshot: membershipPurchases.planNameSnapshot,
    })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.id, input.purchaseId),
        eq(membershipPurchases.userId, input.userId),
      ),
    )
    .limit(1);

  if (!purchase) {
    const err = new Error("PURCHASE_NOT_FOUND");
    (err as NodeJS.ErrnoException).code = "PURCHASE_NOT_FOUND";
    throw err;
  }

  if (purchase.status !== "PENDING") {
    const err = new Error(`PURCHASE_NOT_PENDING:${purchase.status}`);
    (err as NodeJS.ErrnoException).code = "PURCHASE_NOT_PENDING";
    throw err;
  }

  const price = Number(purchase.priceSnapshot);

  // ── Load all existing attempts ────────────────────────────────────────────
  const existingAttempts = await db
    .select({
      id: payments.id,
      status: payments.status,
      attemptNumber: payments.attemptNumber,
      midtransOrderId: payments.midtransOrderId,
      paymentInstruction: payments.paymentInstruction,
      paymentChannel: payments.paymentChannel,
      payerPhoneNumber: payments.payerPhoneNumber,
      expiryTime: payments.expiryTime,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.membershipPurchaseId, input.purchaseId))
    .orderBy(desc(payments.attemptNumber));

  const MAX_ATTEMPTS = 5;

  // ── Idempotency check ─────────────────────────────────────────────────────
  if (input.idempotencyKey) {
    const idempotent = existingAttempts.find(
      (p) =>
        (p.rawResponse as Record<string, unknown> | null)?.idempotency_key ===
        input.idempotencyKey,
    );
    if (idempotent?.paymentInstruction) {
      return {
        purchaseId: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        paymentInstruction: idempotent.paymentInstruction,
        expiryTime: idempotent.expiryTime?.toISOString() ?? null,
        status: "PENDING",
        amount: price,
        attemptNumber: idempotent.attemptNumber,
      };
    }
  }

  if (existingAttempts.length >= MAX_ATTEMPTS) {
    const err = new Error("MAX_ATTEMPTS_REACHED");
    (err as NodeJS.ErrnoException).code = "MAX_ATTEMPTS_REACHED";
    throw err;
  }

  const latestAttempt = existingAttempts[0] ?? null;
  const newAttemptNumber = (latestAttempt?.attemptNumber ?? 0) + 1;
  const newMidtransOrderId = `${purchase.purchaseNumber}-${newAttemptNumber}`;

  // ── Cancel existing PENDING attempt at Midtrans ───────────────────────────
  if (latestAttempt?.status === "PENDING") {
    try {
      const { cancelCoreApi } = await import("@/src/lib/payments/midtrans");
      await cancelCoreApi(latestAttempt.midtransOrderId);
    } catch {
      // Non-fatal: if cancel fails we still proceed — Midtrans will expire the old attempt.
    }

    await db
      .update(payments)
      .set({ status: "FAILED", updatedAt: now })
      .where(eq(payments.id, latestAttempt.id));
  }

  // ── Fetch user details ────────────────────────────────────────────────────
  const [user] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found.");
  }

  const nameParts = user.name.split(" ");
  const customerDetails = {
    first_name: nameParts[0] ?? user.name,
    last_name: nameParts.slice(1).join(" ") || undefined,
    email: user.email,
    phone: user.phone ?? undefined,
  };

  const itemDetails = [
    {
      id: "MEMBERSHIP_PLUS",
      name: `RoboEdu Membership Plus`,
      price,
      quantity: 1,
    },
  ];

  // ── Insert new PENDING payment row ────────────────────────────────────────
  const newPaymentId = crypto.randomUUID();
  await db.insert(payments).values({
    id: newPaymentId,
    orderId: null,
    membershipPurchaseId: input.purchaseId,
    midtransOrderId: newMidtransOrderId,
    attemptNumber: newAttemptNumber,
    paymentType: input.paymentMethod,
    paymentChannel: input.paymentChannel,
    payerPhoneNumber: input.payerPhoneNumber ?? null,
    status: "PENDING",
    amount: String(price),
    rawResponse: input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : null,
  });

  // ── Charge Midtrans Core API ──────────────────────────────────────────────
  try {
    const charge = await chargeCoreApi({
      paymentType: input.paymentMethod,
      channel: input.paymentChannel,
      midtransOrderId: newMidtransOrderId,
      grossAmount: price,
      customerDetails,
      itemDetails,
      payerPhoneNumber: input.payerPhoneNumber,
      expiry: { duration: MEMBERSHIP_EXPIRY_HOURS, unit: "hour" },
    });

    const expiresAt = new Date(now.getTime() + MEMBERSHIP_EXPIRY_HOURS * 60 * 60 * 1000);
    const resolvedExpiry = charge.expiryTime ?? expiresAt;

    await db
      .update(payments)
      .set({
        paymentInstruction: charge.instruction,
        expiryTime: resolvedExpiry,
        transactionTime: now,
        rawResponse: {
          ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
          ...((charge.raw as object) ?? {}),
        },
        updatedAt: now,
      })
      .where(eq(payments.id, newPaymentId));

    // Update the purchase's linked payment to the latest attempt
    await db
      .update(membershipPurchases)
      .set({ paymentId: newPaymentId })
      .where(eq(membershipPurchases.id, input.purchaseId));

    return {
      purchaseId: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      paymentInstruction: charge.instruction,
      expiryTime: resolvedExpiry.toISOString(),
      status: "PENDING",
      amount: price,
      attemptNumber: newAttemptNumber,
    };
  } catch (error) {
    // Mark new attempt FAILED
    await db
      .update(payments)
      .set({
        status: "FAILED",
        rawResponse: {
          ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
          chargeError:
            error instanceof Error ? error.message : "Unknown Core API error",
        },
        updatedAt: now,
      })
      .where(eq(payments.id, newPaymentId));

    const err = new Error("PAYMENT_CHARGE_FAILED");
    (err as NodeJS.ErrnoException).code = "PAYMENT_CHARGE_FAILED";
    throw err;
  }
}
