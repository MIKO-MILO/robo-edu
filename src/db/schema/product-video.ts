import { mysqlTable, varchar, int, datetime, index } from "drizzle-orm/mysql-core";
import { products } from "./product";
import { sql } from "drizzle-orm";

export const productVideos = mysqlTable("product_videos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
  /** Key objek di MinIO — dipakai untuk hapus via storage. */
  videoKey: varchar("video_key", { length: 500 }).notNull(),
  /** URL relatif /api/videos/... yang di-serve oleh proxy route. */
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }),
  /** Urutan tampil — 0-based, sama semantik dengan product_images.sort_order. */
  sortOrder: int("sort_order").notNull().default(0),
  createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  productIdx: index("product_videos_product_id_idx").on(table.productId),
}));
