import { sql } from "drizzle-orm";
import { mysqlTable, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

export const shippingProviders = mysqlTable("shipping_providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
});
