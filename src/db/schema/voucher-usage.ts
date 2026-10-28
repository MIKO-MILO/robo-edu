import { mysqlTable, varchar, decimal, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { vouchers } from "./voucher";
import { users } from "./user";
import { orders } from "./order";
import { sql } from "drizzle-orm";

export const voucherUsages = mysqlTable("voucher_usages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  voucherId: varchar("voucher_id", { length: 36 }).notNull().references(() => vouchers.id, { onDelete: "restrict", onUpdate: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  voucherIdx: index("voucher_usages_voucher_id_idx").on(table.voucherId),
  userIdx: index("voucher_usages_user_id_idx").on(table.userId),
  orderUnique: uniqueIndex("voucher_usages_order_id_unique").on(table.orderId),
}));
