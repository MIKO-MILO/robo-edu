import { mysqlTable, varchar, text, datetime, index } from "drizzle-orm/mysql-core";
import { orderItems } from "./order-item";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const complaints = mysqlTable("complaints", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderItemId: varchar("order_item_id", { length: 36 }).notNull().references(() => orderItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("open"),
  resolution: text("resolution"),
  resolvedAt: datetime("resolved_at"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderItemIdx: index("complaints_order_item_id_idx").on(table.orderItemId),
  userIdx: index("complaints_user_id_idx").on(table.userId),
  statusIdx: index("complaints_status_idx").on(table.status),
}));
