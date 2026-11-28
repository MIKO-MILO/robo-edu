import { sql } from "drizzle-orm";
import { mysqlTable, varchar, int, datetime, index } from "drizzle-orm/mysql-core";
import { reviews } from "./review";

/**
 * Daftar review yang ditampilkan di landing page.
 * Toggle "tampilkan di landing" dari /admin/reviews insert/delete ke sini.
 * Landing page membaca daftar ini diurutkan by sort_order.
 */
export const landingFeaturedReviews = mysqlTable(
  "landing_featured_reviews",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    reviewId: varchar("review_id", { length: 36 })
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    reviewIdx: index("lfr_review_id_idx").on(table.reviewId),
    sortOrderIdx: index("lfr_sort_order_idx").on(table.sortOrder),
  }),
);
