import { relations } from "drizzle-orm";
import { refunds, payments, orders, users } from "../schema";

export const refundsRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.paymentId],
    references: [payments.id],
  }),
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  processedBy: one(users, {
    fields: [refunds.processedBy],
    references: [users.id],
  }),
}));
