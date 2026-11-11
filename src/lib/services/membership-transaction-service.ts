import "server-only";

import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments } from "@/src/db/schema";
import { getSnapClient } from "@/src/lib/payments/midtrans";
import { getSetting } from "@/src/lib/services/settings-service";

export type CreateMembershipTransactionInput = {
  /** Must come from the authenticated server session, never from a client request body. */
  userId: string;
  /** Plan identifier — only "PLUS" supported for now. */
  package: "PLUS";
};

export type CreateMembershipTransactionResult = {
  purchaseId: string;
  purchaseNumber: string;
  snapToken: string;
  redirectUrl: string;
  /** Price charged, in Rupiah (integer). */
  total: number;
};

/** Generate a unique membership purchase number: MBR-<timestamp>-<8 random hex chars>. */
function makePurchaseNumber(): string {
  return `MBR-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

/**
 * Create a Midtrans Snap transaction for a membership purchase.
 *
 * Price and duration are always read from the `settings` table at request time
 * so an admin price change takes effect immediately without a redeploy.
 *
 * Design mirrors `createPaymentTransaction` in transaction-service.ts:
 *   1. DB transaction: insert `membership_purchase` (PENDING) + `payments` row.
 *   2. Call Midtrans Snap outside the transaction.
 *   3. Store snap token in `payments.rawResponse`.
 *   4. On Snap failure: mark payment + purchase as FAILED.
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
  // ── Read settings (never hardcode price) ──────────────────────────────
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

  // ── Atomic DB inserts ─────────────────────────────────────────────────
  await db.transaction(async (tx) => {
    // Insert payment first so membership_purchase can reference it via paymentId FK.
    await tx.insert(payments).values({
      id: paymentId,
      orderId: null,
      membershipPurchaseId: null, // back-filled after membership_purchase is inserted
      midtransOrderId: purchaseNumber, // Midtrans order reference; Midtrans fills midtrans_transaction_id via webhook
      attemptNumber: 1,
      paymentType: "MIDTRANS_SNAP",
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

  // ── Call Midtrans Snap (outside DB transaction) ───────────────────────
  const snap = getSnapClient();
  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: purchaseNumber,
        gross_amount: price,
      },
      item_details: [
        {
          id: "MEMBERSHIP_PLUS",
          name: "RoboEdu Membership Plus",
          price,
          quantity: 1,
        },
      ],
    });

    // Store the snap token in rawResponse so the client can re-use it
    // without calling Midtrans again (token is valid for 24 hours).
    await db
      .update(payments)
      .set({
        rawResponse: {
          snap_token: transaction.token,
          redirect_url: transaction.redirect_url,
          created_at: new Date().toISOString(),
        },
      })
      .where(eq(payments.id, paymentId));

    return {
      purchaseId,
      purchaseNumber,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      total: price,
    };
  } catch (error) {
    // Snap call failed — mark both rows as FAILED so the user can retry cleanly.
    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: "FAILED",
          rawResponse: {
            snapError:
              error instanceof Error ? error.message : "Unknown Snap error",
          },
        })
        .where(eq(payments.id, paymentId));

      await tx
        .update(membershipPurchases)
        .set({ status: "FAILED" })
        .where(eq(membershipPurchases.id, purchaseId));
    });
    throw error;
  }
}
