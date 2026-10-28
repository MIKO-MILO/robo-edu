import { mysqlTable, varchar, text, json, datetime, index } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { sql } from "drizzle-orm";

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  actorId: varchar("actor_id", { length: 36 }).references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }),
  targetId: varchar("target_id", { length: 36 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  actorIdx: index("audit_logs_actor_id_idx").on(table.actorId),
  targetIdx: index("audit_logs_target_type_target_id_idx").on(table.targetType, table.targetId),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}));
