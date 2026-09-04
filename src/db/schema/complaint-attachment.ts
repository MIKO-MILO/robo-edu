import { mysqlTable, varchar, datetime, index } from "drizzle-orm/mysql-core";
import { complaints } from "./complaint";
import { sql } from "drizzle-orm";

export const complaintAttachments = mysqlTable("complaint_attachments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  complaintId: varchar("complaint_id", { length: 36 }).notNull().references(() => complaints.id, { onDelete: "cascade", onUpdate: "cascade" }),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  complaintIdx: index("complaint_attachments_complaint_id_idx").on(table.complaintId),
}));
