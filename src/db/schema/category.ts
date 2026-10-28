import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, boolean, datetime, uniqueIndex } from "drizzle-orm/mysql-core";

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugUnique: uniqueIndex("categories_slug_unique").on(table.slug),
}));
