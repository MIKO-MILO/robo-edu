import { relations } from "drizzle-orm";
import { vouchers, voucherUsages, orders, users } from "../schema";

export const vouchersRelations = relations(vouchers, ({ many }) => ({
  orders: many(orders),
  usages: many(voucherUsages),
}));

export const voucherUsagesRelations = relations(voucherUsages, ({ one }) => ({
  voucher: one(vouchers, { fields: [voucherUsages.voucherId], references: [vouchers.id] }),
  user: one(users, { fields: [voucherUsages.userId], references: [users.id] }),
  order: one(orders, { fields: [voucherUsages.orderId], references: [orders.id] }),
}));
