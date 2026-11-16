/**
 * order-auto-cancel.ts
 * ──────────────────────────────────────────────────────────────────────────
 * BullMQ job handler: sweep PENDING orders whose expires_at < NOW() and
 * cancel them atomically.
 *
 * Steps per expired order:
 *   1. Guard: skip if order is already CANCELLED (idempotency).
 *   2. For each PENDING payment linked to the order:
 *        - Call Midtrans Cancel API (swallows 412 / already-terminal errors).
 *        - Mark payment EXPIRED in DB.
 *   3. In a single DB transaction:
 *        - Return stock for every order_item (atomic SQL increment).
 *        - Set order.status = CANCELLED, order.cancelled_at = NOW().
 *
 * This job is idempotent: re-running it on an already-CANCELLED order is a
 * no-op at step 1.
 *
 * NOTE: No "server-only" guard — this file runs in the worker process.
 */

import { and, eq, lt, sql } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "@/src/db/schema";
import {
  orderItems,
  orders,
  payments,
  productVariants,
} from "@/src/db/schema";
import { cancelCoreApi } from "@/src/lib/payments/midtrans-worker";

type Db = MySql2Database<typeof schema>;

/**
 * Run the order-auto-cancel sweep.
 *
 * @param db  Drizzle instance from the worker (already has the full schema).
 */
export async function runOrderAutoCancel(db: Db): Promise<void> {
  const now = new Date();

  // ── 1. Find all PENDING orders past their expiry ──────────────────────────
  const expiredOrders = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber })
    .from(orders)
    .where(
      and(
        eq(orders.status, "PENDING"),
        lt(orders.expiresAt, now),
      ),
    );

  if (expiredOrders.length === 0) {
    console.log("[job:order-auto-cancel] No expired PENDING orders found.");
    return;
  }

  console.log(
    `[job:order-auto-cancel] Found ${expiredOrders.length} expired order(s) to cancel.`,
  );

  for (const order of expiredOrders) {
    await cancelSingleOrder(db, order.id, order.orderNumber);
  }
}

// ── Per-order cancel logic ────────────────────────────────────────────────────

async function cancelSingleOrder(
  db: Db,
  orderId: string,
  orderNumber: string,
): Promise<void> {
  try {
    // ── Guard: re-fetch status inside the loop to prevent race conditions ──
    const [current] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!current || current.status !== "PENDING") {
      console.log(
        `[job:order-auto-cancel] Order ${orderNumber} is already ${current?.status ?? "gone"} — skipping.`,
      );
      return;
    }

    // ── Step 2: Cancel PENDING payments at Midtrans + mark EXPIRED in DB ──
    const pendingPayments = await db
      .select({
        id: payments.id,
        midtransOrderId: payments.midtransOrderId,
      })
      .from(payments)
      .where(
        and(
          eq(payments.orderId, orderId),
          eq(payments.status, "PENDING"),
        ),
      );

    for (const payment of pendingPayments) {
      try {
        await cancelCoreApi(payment.midtransOrderId);
      } catch (err) {
        // Log but do not abort — we still need to cancel the order in DB.
        console.error(
          `[job:order-auto-cancel] Midtrans cancel failed for ${payment.midtransOrderId}:`,
          err,
        );
      }

      await db
        .update(payments)
        .set({ status: "EXPIRED" })
        .where(
          and(
            eq(payments.id, payment.id),
            eq(payments.status, "PENDING"), // guard against concurrent webhook
          ),
        );
    }

    // ── Step 3: Atomically restore stock + cancel order ───────────────────
    const items = await db
      .select({
        variantId: orderItems.variantId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    await db.transaction(async (tx) => {
      // Double-check inside the transaction (optimistic concurrency guard).
      const [locked] = await tx
        .select({ status: orders.status })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!locked || locked.status !== "PENDING") {
        // Another process (e.g. webhook) already changed the status — bail.
        return;
      }

      // Restore stock for each item.
      for (const item of items) {
        await tx
          .update(productVariants)
          .set({
            stock: sql`${productVariants.stock} + ${item.quantity}`,
          })
          .where(eq(productVariants.id, item.variantId));
      }

      // Cancel the order.
      await tx
        .update(orders)
        .set({
          status: "CANCELLED",
          cancelledAt: new Date(),
        })
        .where(eq(orders.id, orderId));
    });

    console.log(
      `[job:order-auto-cancel] ✅ Order ${orderNumber} cancelled; ` +
        `${items.length} item(s) stock restored, ` +
        `${pendingPayments.length} payment(s) expired.`,
    );
  } catch (err) {
    // Log and continue to the next order rather than aborting the whole sweep.
    console.error(
      `[job:order-auto-cancel] ❌ Failed to cancel order ${orderNumber}:`,
      err,
    );
  }
}
