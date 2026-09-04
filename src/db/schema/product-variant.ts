import { mysqlTable, varchar, int, decimal, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { products } from "./product";
import { sql } from "drizzle-orm";

export const productVariants = mysqlTable("product_variants", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
  variantName: varchar("variant_name", { length: 150 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  resellerPrice: decimal("reseller_price", { precision: 15, scale: 2 }).notNull(),
  stock: int("stock").notNull().default(0),
  weight: int("weight").notNull().default(0),
  status: varchar("status", { length: 30 }).notNull().default("active"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  skuUnique: uniqueIndex("product_variants_sku_unique").on(table.sku),
  productIdx: index("product_variants_product_id_idx").on(table.productId),
}));
