import {
  mysqlTable,
  varchar,
  decimal,
  int,
  datetime,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./user";
import { payments } from "./payment";
import { sql } from "drizzle-orm";

export const membershipPurchases = mysqlTable(
  "membership_purchase",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    /** Format: MBR-<timestamp>-<random>. Used as Midtrans order reference. */
    purchaseNumber: varchar("purchase_number", { length: 100 }).notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
    paymentId: varchar("payment_id", { length: 36 }).references(
      () => payments.id,
      { onDelete: "set null", onUpdate: "cascade" },
    ),
    /** Snapshot of the plan price (in Rupiah) at time of purchase. */
    priceSnapshot: decimal("price_snapshot", { precision: 15, scale: 2 }).notNull(),
    /** Snapshot of plan duration in months at time of purchase. */
    durationMonthsSnapshot: int("duration_months_snapshot").notNull(),
    /** Snapshot of plan name at time of purchase (e.g. "Plus"). */
    planNameSnapshot: varchar("plan_name_snapshot", { length: 100 }).notNull(),
    startsAt: datetime("starts_at"),
    endsAt: datetime("ends_at"),
    paidAt: datetime("paid_at"),
    /** Timestamp when the H-7 expiry reminder was sent; null = not yet sent. */
    reminderH7SentAt: datetime("reminder_h7_sent_at"),
    /** Timestamp when the H-3 expiry reminder was sent; null = not yet sent. */
    reminderH3SentAt: datetime("reminder_h3_sent_at"),
    /** PENDING | PAID | FAILED | EXPIRED | REFUNDED */
    status: varchar("status", { length: 30 }).notNull().default("PENDING"),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    purchaseNumberUnique: uniqueIndex(
      "membership_purchase_purchase_number_unique",
    ).on(table.purchaseNumber),
    userIdx: index("membership_purchase_user_id_idx").on(table.userId),
    statusIdx: index("membership_purchase_status_idx").on(table.status),
  }),
);
