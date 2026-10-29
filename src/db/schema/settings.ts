import { mysqlTable, varchar, text, datetime } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Key-value store for app-level settings managed by admins.
 * All values are stored as TEXT; the application layer is responsible
 * for parsing/validating them (e.g. parsing price as a number).
 */
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
