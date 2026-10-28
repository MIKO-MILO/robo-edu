import { relations } from "drizzle-orm";
import { users, userAddresses, carts, wishlists, orders, voucherUsages, reviews, complaints, emailLogs, auditLogs } from "../schema";

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(userAddresses),
  carts: many(carts),
  wishlists: many(wishlists),
  orders: many(orders),
  voucherUsages: many(voucherUsages),
  reviews: many(reviews),
  complaints: many(complaints),
  emailLogs: many(emailLogs),
  auditLogs: many(auditLogs),
}));

export const userAddressesRelations = relations(userAddresses, ({ one, many }) => ({
  user: one(users, { fields: [userAddresses.userId], references: [users.id] }),
  orders: many(orders),
}));
