import { mysqlTable, varchar, text, datetime, index } from "drizzle-orm/mysql-core";
import { reviews } from "./review";
import { sql } from "drizzle-orm";

export const reviewImages = mysqlTable("review_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  reviewId: varchar("review_id", { length: 36 })
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade", onUpdate: "cascade" }),
  url: text("url").notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  reviewIdx: index("review_images_review_id_idx").on(table.reviewId),
}));
