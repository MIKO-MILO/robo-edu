import { mysqlTable, varchar, datetime, index } from "drizzle-orm/mysql-core";
import { refunds } from "./refund";
import { sql } from "drizzle-orm";

export const refundAttachments = mysqlTable("refund_attachments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  refundId: varchar("refund_id", { length: 36 })
    .notNull()
    .references(() => refunds.id, { onDelete: "cascade", onUpdate: "cascade" }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  refundIdx: index("refund_attachments_refund_id_idx").on(table.refundId),
}));
