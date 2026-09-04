import { mysqlTable, varchar, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { orders } from "./order";
import { shippingProviders } from "./shipping-provider";
import { sql } from "drizzle-orm";

export const shipments = mysqlTable("shipments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade", onUpdate: "cascade" }),
  shippingProviderId: varchar("shipping_provider_id", { length: 36 }).notNull().references(() => shippingProviders.id, { onDelete: "restrict", onUpdate: "cascade" }),
  service: varchar("service", { length: 100 }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  shippedAt: datetime("shipped_at"),
  deliveredAt: datetime("delivered_at"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderUnique: uniqueIndex("shipments_order_id_unique").on(table.orderId),
  trackingUnique: uniqueIndex("shipments_tracking_number_unique").on(table.trackingNumber),
  providerIdx: index("shipments_shipping_provider_id_idx").on(table.shippingProviderId),
}));
