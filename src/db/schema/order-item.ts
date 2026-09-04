import { mysqlTable, varchar, int, decimal, datetime, index } from "drizzle-orm/mysql-core";
import { orders } from "./order";
import { products } from "./product";
import { productVariants } from "./product-variant";
import { sql } from "drizzle-orm";

export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
  variantId: varchar("variant_id", { length: 36 }).notNull().references(() => productVariants.id, { onDelete: "restrict", onUpdate: "cascade" }),
  productNameSnapshot: varchar("product_name_snapshot", { length: 200 }).notNull(),
  variantNameSnapshot: varchar("variant_name_snapshot", { length: 150 }),
  skuSnapshot: varchar("sku_snapshot", { length: 100 }).notNull(),
  priceSnapshot: decimal("price_snapshot", { precision: 15, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderIdx: index("order_items_order_id_idx").on(table.orderId),
  productIdx: index("order_items_product_id_idx").on(table.productId),
  variantIdx: index("order_items_variant_id_idx").on(table.variantId),
}));
