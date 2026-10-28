import { relations } from "drizzle-orm";
import { reviews, orderItems, users, products } from "../schema";

export const reviewsRelations = relations(reviews, ({ one }) => ({
  orderItem: one(orderItems, { fields: [reviews.orderItemId], references: [orderItems.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
}));
