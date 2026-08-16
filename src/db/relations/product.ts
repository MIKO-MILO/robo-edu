import { relations } from "drizzle-orm";
import { categories, productTypes, products, productVariants, productImages, cartItems, wishlists, orderItems, reviews } from "../schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productTypesRelations = relations(productTypes, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  productType: one(productTypes, { fields: [products.productTypeId], references: [productTypes.id] }),
  variants: many(productVariants),
  images: many(productImages),
  cartItems: many(cartItems),
  wishlists: many(wishlists),
  orderItems: many(orderItems),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  images: many(productImages),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [productImages.variantId], references: [productVariants.id] }),
}));
