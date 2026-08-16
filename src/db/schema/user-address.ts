import { mysqlTable, varchar, text, boolean, datetime, index } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const userAddresses = mysqlTable("user_addresses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  label: varchar("label", { length: 50 }).notNull(),
  recipientName: varchar("recipient_name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  address: text("address").notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }).notNull(),
  village: varchar("village", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  userIdIdx: index("user_addresses_user_id_idx").on(table.userId),
}));
