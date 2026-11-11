import { mysqlTable, varchar, decimal, text, boolean, datetime, index } from "drizzle-orm/mysql-core";
import { payments } from "./payment";
import { orders } from "./order";
import { users } from "./user";
import { sql } from "drizzle-orm";

/**
 * Refund record — one per refund action on a payment.
 *
 * A refund is always linked to a `payment` (the payment being refunded).
 * Optionally also linked to `orders` or `membership_purchase` for convenience
 * (both nullable since a payment may belong to either, not both).
 *
 * `method`:
 *   "MIDTRANS_API" — processed automatically via the Midtrans Refund API
 *   "MANUAL"        — admin transferred manually and uploaded proof_url
 */
export const refunds = mysqlTable("refunds", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /** Payment being refunded. Required — every refund belongs to a payment. */
  paymentId: varchar("payment_id", { length: 36 })
    .notNull()
    .references(() => payments.id, { onDelete: "cascade", onUpdate: "cascade" }),
  /** Order this refund relates to (nullable — set if the payment was for an order). */
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  /**
   * Membership purchase this refund relates to.
   * Declared as plain varchar to avoid circular import; FK is in migration SQL.
   */
  membershipPurchaseId: varchar("membership_purchase_id", { length: 36 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  /** "MIDTRANS_API" or "MANUAL" */
  method: varchar("method", { length: 20 }).notNull(),
  /** URL to proof of manual transfer — only for method=MANUAL. */
  proofUrl: varchar("proof_url", { length: 500 }),
  /** Whether production quota should be restored for the refunded items. */
  restoreQuota: boolean("restore_quota").notNull().default(false),
  /** Admin user who processed this refund. */
  processedBy: varchar("processed_by", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  /** PENDING | SUCCESS | FAILED */
  status: varchar("status", { length: 30 }).notNull().default("PENDING"),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  paymentIdx: index("refunds_payment_id_idx").on(table.paymentId),
  orderIdx: index("refunds_order_id_idx").on(table.orderId),
  membershipPurchaseIdx: index("refunds_membership_purchase_id_idx").on(table.membershipPurchaseId),
  processedByIdx: index("refunds_processed_by_idx").on(table.processedBy),
}));
