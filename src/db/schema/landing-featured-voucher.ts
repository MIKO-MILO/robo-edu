import { sql } from "drizzle-orm";
import { mysqlTable, varchar, int, datetime, index } from "drizzle-orm/mysql-core";
import { vouchers } from "./voucher";

/**
 * Daftar voucher yang ditampilkan di landing page.
 * Maksimum 6 baris aktif (enforced di API layer).
 * Toggle "tampilkan di landing" dari /admin/vouchers insert/delete ke sini.
 * Landing page membaca daftar ini diurutkan by sort_order.
 */
export const landingFeaturedVouchers = mysqlTable(
  "landing_featured_vouchers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    voucherId: varchar("voucher_id", { length: 36 })
      .notNull()
      .references(() => vouchers.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sortOrder: int("sort_order").notNull().default(0),
    createdAt: datetime("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    voucherIdx: index("lfv_voucher_id_idx").on(table.voucherId),
    sortOrderIdx: index("lfv_sort_order_idx").on(table.sortOrder),
  }),
);
