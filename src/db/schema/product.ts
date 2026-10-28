import { mysqlTable, varchar, text, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { categories } from "./category";
import { productTypes } from "./product-type";
import { sql } from "drizzle-orm";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: varchar("category_id", { length: 36 }).notNull().references(() => categories.id, { onDelete: "restrict", onUpdate: "cascade" }),
  productTypeId: varchar("product_type_id", { length: 36 }).notNull().references(() => productTypes.id, { onDelete: "restrict", onUpdate: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 30 }).notNull().default("active"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  slugUnique: uniqueIndex("products_slug_unique").on(table.slug),
  skuUnique: uniqueIndex("products_sku_unique").on(table.sku),
  categoryIdx: index("products_category_id_idx").on(table.categoryId),
  productTypeIdx: index("products_product_type_id_idx").on(table.productTypeId),
}));
