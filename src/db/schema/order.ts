import { mysqlTable, varchar, text, decimal, datetime, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { users } from "./user";
import { userAddresses } from "./user-address";
import { vouchers } from "./voucher";
import { sql } from "drizzle-orm";

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  addressId: varchar("address_id", { length: 36 }).references(() => userAddresses.id, { onDelete: "set null", onUpdate: "cascade" }),
  voucherId: varchar("voucher_id", { length: 36 }).references(() => vouchers.id, { onDelete: "set null", onUpdate: "cascade" }),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  shippingCost: decimal("shipping_cost", { precision: 15, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  voucherCodeSnapshot: varchar("voucher_code_snapshot", { length: 100 }),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  recipientName: varchar("recipient_name", { length: 150 }).notNull(),
  recipientPhone: varchar("recipient_phone", { length: 30 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingProvince: varchar("shipping_province", { length: 100 }).notNull(),
  shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
  shippingDistrict: varchar("shipping_district", { length: 100 }).notNull(),
  shippingVillage: varchar("shipping_village", { length: 100 }).notNull(),
  shippingPostalCode: varchar("shipping_postal_code", { length: 10 }).notNull(),
  paidAt: datetime("paid_at"),
  shippedAt: datetime("shipped_at"),
  deliveredAt: datetime("delivered_at"),
  completedAt: datetime("completed_at"),
  cancelledAt: datetime("cancelled_at"),
  createdAt: datetime("created_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
  .notNull()
  .default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderNumberUnique: uniqueIndex("orders_order_number_unique").on(table.orderNumber),
  userIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
  voucherIdx: index("orders_voucher_id_idx").on(table.voucherId),
}));
