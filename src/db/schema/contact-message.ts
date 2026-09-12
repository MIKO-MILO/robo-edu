import { mysqlTable, varchar, text, datetime, index } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const contactMessages = mysqlTable("contact_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  /** FK ke users — null jika pengirim belum login */
  userId: varchar("user_id", { length: 36 }).references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  /** Status penanganan: UNREAD → READ → REPLIED */
  status: varchar("status", { length: 20 }).notNull().default("UNREAD"),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  emailIdx: index("contact_messages_email_idx").on(table.email),
  userIdx: index("contact_messages_user_id_idx").on(table.userId),
  statusIdx: index("contact_messages_status_idx").on(table.status),
}));
