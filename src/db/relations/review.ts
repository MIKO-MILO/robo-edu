import { relations } from "drizzle-orm";
import { reviews, reviewImages, orderItems, users, products } from "../schema";

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  orderItem: one(orderItems, { fields: [reviews.orderItemId], references: [orderItems.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  images: many(reviewImages),
}));

export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, { fields: [reviewImages.reviewId], references: [reviews.id] }),
}));
