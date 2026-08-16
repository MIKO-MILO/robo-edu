import { mysqlTable, varchar, int, datetime, index } from "drizzle-orm/mysql-core";
import { carts } from "./cart";
import { products } from "./product";
import { productVariants } from "./product-variant";
import { sql } from "drizzle-orm";

export const cartItems = mysqlTable("cart_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  cartId: varchar("cart_id", { length: 36 }).notNull().references(() => carts.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
  variantId: varchar("variant_id", { length: 36 }).notNull().references(() => productVariants.id, { onDelete: "restrict", onUpdate: "cascade" }),
  quantity: int("quantity").notNull().default(1),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  cartIdx: index("cart_items_cart_id_idx").on(table.cartId),
  productIdx: index("cart_items_product_id_idx").on(table.productId),
  variantIdx: index("cart_items_variant_id_idx").on(table.variantId),
}));
