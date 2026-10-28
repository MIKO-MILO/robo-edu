import { mysqlTable, varchar, datetime } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Tabel internal untuk mencatat seeder yang sudah pernah dijalankan.
 * Berfungsi seperti migration table — kalau entry sudah ada, skip.
 */
export const seedLogs = mysqlTable("seed_logs", {
  id: varchar("id", { length: 100 }).primaryKey(),  // nama seeder, e.g. "products_v1"
  runAt: datetime("run_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
