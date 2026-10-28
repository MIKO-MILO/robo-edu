import { mysqlTable, varchar, boolean, int, datetime, index } from "drizzle-orm/mysql-core";
import { products } from "./product";
import { productVariants } from "./product-variant";
import { sql } from "drizzle-orm";

export const productImages = mysqlTable("product_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
  variantId: varchar("variant_id", { length: 36 }).references(() => productVariants.id, { onDelete: "cascade", onUpdate: "cascade" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  sortOrder: int("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  productIdx: index("product_images_product_id_idx").on(table.productId),
  variantIdx: index("product_images_variant_id_idx").on(table.variantId),
}));
