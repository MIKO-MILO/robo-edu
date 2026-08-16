import { sql } from "drizzle-orm";
import { mysqlTable, varchar, boolean, datetime, uniqueIndex } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: varchar("role", { length: 30 }).notNull().default("customer"),
  resellerStatus: varchar("reseller_status", { length: 30 }).notNull().default("none"),
  resellerApprovedAt: datetime("reseller_approved_at"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: datetime("last_login_at"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));
