import { mysqlTable, varchar, decimal, datetime, json, int, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { orders } from "./order";
import { sql } from "drizzle-orm";

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /**
   * FK to orders. Nullable — exactly one of order_id / membership_purchase_id
   * must be set. The "exactly-one" invariant is enforced at every insert site
   * in application code (MySQL CHECK constraints are loosely enforced).
   */
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
  /**
   * FK to membership_purchase. Nullable — set when this payment is for a
   * membership purchase rather than a product order.
   * Declared as varchar here to avoid a circular import with membership-purchase.ts
   * (which itself FKs back to payments). The FK constraint is in the migration SQL.
   */
  membershipPurchaseId: varchar("membership_purchase_id", { length: 36 }),
  /**
   * Midtrans order reference (e.g. order number "ORD-…" or purchase number "MBR-…").
   * UNIQUE per attempt — one Midtrans order ID maps to exactly one payment attempt.
   */
  midtransOrderId: varchar("midtrans_order_id", { length: 150 }).notNull(),
  /**
   * Midtrans transaction ID — received from the Midtrans webhook. Nullable
   * because it's unknown at insert time (the webhook fills it later).
   */
  midtransTransactionId: varchar("midtrans_transaction_id", { length: 150 }),
  /**
   * Attempt number for multi-attempt payments. Defaults to 1.
   * A new payment attempt (retry) increments this; combined with order_id or
   * membership_purchase_id it uniquely identifies each attempt.
   */
  attemptNumber: int("attempt_number").notNull().default(1),
  paymentType: varchar("payment_type", { length: 50 }).notNull(),
  /** Actual payment method chosen by user (e.g. "bank_transfer", "gopay"). From Midtrans response. */
  paymentMethod: varchar("payment_method", { length: 50 }),
  /** Specific payment channel (e.g. "bca", "bni"). From Midtrans response. */
  paymentChannel: varchar("payment_channel", { length: 50 }),
  /** Payment instructions (VA number, biller code, etc.) from Midtrans Core API. */
  paymentInstruction: json("payment_instruction"),
  /** Payer phone number captured by Midtrans. */
  payerPhoneNumber: varchar("payer_phone_number", { length: 30 }),
  status: varchar("status", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  transactionTime: datetime("transaction_time"),
  settlementTime: datetime("settlement_time"),
  expiryTime: datetime("expiry_time"),
  fraudStatus: varchar("fraud_status", { length: 50 }),
  rawResponse: json("raw_response"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderIdx: index("payments_order_id_idx").on(table.orderId),
  membershipPurchaseIdx: index("payments_membership_purchase_id_idx").on(table.membershipPurchaseId),
  midtransOrderIdUnique: uniqueIndex("payments_midtrans_order_id_unique").on(table.midtransOrderId),
  // Composite indexes for multi-attempt lookup by order or membership purchase
  orderAttemptIdx: index("payments_order_attempt_idx").on(table.orderId, table.attemptNumber),
  membershipAttemptIdx: index("payments_membership_attempt_idx").on(table.membershipPurchaseId, table.attemptNumber),
}));
