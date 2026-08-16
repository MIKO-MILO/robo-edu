import { mysqlTable, varchar, int, text, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { orderItems } from "./order-item";
import { users } from "./user";
import { products } from "./product";
import { sql } from "drizzle-orm";

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderItemId: varchar("order_item_id", { length: 36 }).notNull().references(() => orderItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "restrict", onUpdate: "cascade" }),
  rating: int("rating").notNull(),
  comment: text("comment"),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderItemUnique: uniqueIndex("reviews_order_item_id_unique").on(table.orderItemId),
  productIdx: index("reviews_product_id_idx").on(table.productId),
  userIdx: index("reviews_user_id_idx").on(table.userId),
}));
