import { mysqlTable, varchar, datetime, index } from "drizzle-orm/mysql-core";
import { orders } from "./order";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const emailLogs = mysqlTable("email_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id, { onDelete: "set null", onUpdate: "cascade" }),
  userId: varchar("user_id", { length: 36 }).references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  sentAt: datetime("sent_at"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderIdx: index("email_logs_order_id_idx").on(table.orderId),
  userIdx: index("email_logs_user_id_idx").on(table.userId),
}));
