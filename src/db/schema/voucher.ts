import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, boolean, int, decimal, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";

export const vouchers = mysqlTable("vouchers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 100 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 30 }).notNull(),
  discountValue: decimal("discount_value", { precision: 15, scale: 2 }).notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 15, scale: 2 }).notNull().default("0"),
  maximumDiscount: decimal("maximum_discount", { precision: 15, scale: 2 }),
  usageLimit: int("usage_limit"),
  usedCount: int("used_count").notNull().default(0),
  startAt: datetime("start_at").notNull(),
  endAt: datetime("end_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  codeUnique: uniqueIndex("vouchers_code_unique").on(table.code),
  activeDateIdx: index("vouchers_active_date_idx").on(table.isActive, table.startAt, table.endAt),
}));
