import { mysqlTable, varchar, text, datetime, index } from "drizzle-orm/mysql-core";
import { shipments } from "./shipment";
import { sql } from "drizzle-orm";

export const shipmentTrackings = mysqlTable("shipment_trackings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  shipmentId: varchar("shipment_id", { length: 36 }).notNull().references(() => shipments.id, { onDelete: "cascade", onUpdate: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  occurredAt: datetime("occurred_at").notNull(),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  shipmentIdx: index("shipment_trackings_shipment_id_idx").on(table.shipmentId),
}));
