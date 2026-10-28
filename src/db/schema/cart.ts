import { mysqlTable, varchar, datetime, uniqueIndex } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const carts = mysqlTable("carts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userUnique: uniqueIndex("carts_user_id_unique").on(table.userId),
}));
