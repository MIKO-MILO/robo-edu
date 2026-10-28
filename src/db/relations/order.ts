import { relations } from "drizzle-orm";
import { orders, orderItems, users, userAddresses, vouchers, products, productVariants, shipments, payments, voucherUsages, emailLogs, reviews, complaints } from "../schema";

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(userAddresses, { fields: [orders.addressId], references: [userAddresses.id] }),
  voucher: one(vouchers, { fields: [orders.voucherId], references: [vouchers.id] }),
  items: many(orderItems),
  shipments: many(shipments),
  payments: many(payments),
  voucherUsages: many(voucherUsages),
  emailLogs: many(emailLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
  reviews: many(reviews),
  complaints: many(complaints),
}));
