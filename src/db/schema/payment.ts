import { mysqlTable, varchar, decimal, datetime, json, uniqueIndex } from "drizzle-orm/mysql-core";
import { orders } from "./order";
import { sql } from "drizzle-orm";

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
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
  orderUnique: uniqueIndex("payments_order_id_unique").on(table.orderId),
  transactionUnique: uniqueIndex("payments_transaction_id_unique").on(table.transactionId),
}));
