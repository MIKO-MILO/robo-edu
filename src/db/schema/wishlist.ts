import { mysqlTable, varchar, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { products } from "./product";
import { sql } from "drizzle-orm";

export const wishlists = mysqlTable("wishlists", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userProductUnique: uniqueIndex("wishlists_user_product_unique").on(table.userId, table.productId),
  userIdx: index("wishlists_user_id_idx").on(table.userId),
  productIdx: index("wishlists_product_id_idx").on(table.productId),
}));
