import { mysqlTable, varchar, decimal, datetime, json, uniqueIndex, index } from "drizzle-orm/mysql-core";
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
  transactionId: varchar("transaction_id", { length: 150 }).notNull(),
  paymentType: varchar("payment_type", { length: 50 }).notNull(),
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
  transactionUnique: uniqueIndex("payments_transaction_id_unique").on(table.transactionId),
}));
