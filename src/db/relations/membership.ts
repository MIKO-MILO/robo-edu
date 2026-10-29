import { relations } from "drizzle-orm";
import { membershipPurchases, users, payments } from "../schema";

export const membershipPurchasesRelations = relations(
  membershipPurchases,
  ({ one }) => ({
    user: one(users, {
      fields: [membershipPurchases.userId],
      references: [users.id],
    }),
    payment: one(payments, {
      fields: [membershipPurchases.paymentId],
      references: [payments.id],
    }),
  }),
);
