/**
 * order-auto-confirm.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Daily cron job: auto-confirm all DELIVERED orders whose `delivered_at` is
 * more than 3 days ago by transitioning them to COMPLETED and setting
 * `completed_at`.
 *
 * This job is idempotent — re-running it on an already-COMPLETED order is a
 * no-op because the WHERE clause only matches DELIVERED orders.
 *
 * NOTE: No "server-only" guard — this file runs in the worker process.
 */

import { and, eq, lt, sql } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import type * as schema from "@/src/db/schema";
import { orders } from "@/src/db/schema";

type Db = MySql2Database<typeof schema>;

/**
 * Run the order-auto-confirm sweep.
 *
 * Finds all DELIVERED orders where `delivered_at < NOW() - INTERVAL 3 DAY`
 * and sets them to COMPLETED, filling `completed_at` with the current time.
 *
 * @param db  Drizzle instance injected from the worker process.
 */
export async function runOrderAutoConfirm(db: Db): Promise<void> {
  const now = new Date();

  // 3 days ago threshold
  const threshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // ── Find DELIVERED orders past the 3-day window ───────────────────────────
  const staleOrders = await db
    .select({ id: orders.id, orderNumber: orders.orderNumber })
    .from(orders)
    .where(
      and(
        eq(orders.status, "DELIVERED"),
        lt(orders.deliveredAt, threshold),
      ),
    );

  if (staleOrders.length === 0) {
    console.log("[cron:order-auto-confirm] No stale DELIVERED orders found.");
    return;
  }

  console.log(
    `[cron:order-auto-confirm] Found ${staleOrders.length} order(s) to auto-confirm.`,
  );

  // ── Batch update: DELIVERED → COMPLETED ───────────────────────────────────
  // Idempotent: WHERE clause already limits to DELIVERED, so re-runs are safe.
  await db
    .update(orders)
    .set({
      status: "COMPLETED",
      completedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(orders.status, "DELIVERED"),
        lt(orders.deliveredAt, threshold),
      ),
    );

  const orderNumbers = staleOrders.map((o) => o.orderNumber).join(", ");
  console.log(
    `[cron:order-auto-confirm] ✅ Auto-confirmed ${staleOrders.length} order(s): ${orderNumbers}`,
  );
}
