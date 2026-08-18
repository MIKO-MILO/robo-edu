/**
 * index.ts — pintu masuk tunggal untuk semua types RoboEdu.
 *
 * Contoh pakai di kode Next.js:
 *   import type { Product, Order, ApiResponse } from "@/types";
 *
 * Struktur file:
 *   enums.ts      -> semua status/enum (ProductStatus, OrderStatus, dst)
 *   common.ts     -> amplop response API (ApiResponse, ApiError, dst)
 *   user.ts       -> User, UserAddress, auth request/response
 *   catalog.ts    -> Category, ProductType, Product, Variant, Image
 *   cart.ts       -> Cart, CartItem
 *   wishlist.ts   -> WishlistItem
 *   order.ts      -> Order, OrderItem, Payment, Shipment, checkout
 *   voucher.ts    -> Voucher, VoucherUsage
 *   review.ts     -> Review
 *   complaint.ts  -> Complaint, ComplaintAttachment
 *   admin.ts      -> AuditLog, EmailLog, dashboard/laporan
 */

export * from "./enums";
export * from "./common";
export * from "./user";
export * from "./catalog";
export * from "./cart";
export * from "./wishlist";
export * from "./order";
export * from "./voucher";
export * from "./review";
export * from "./complaint";
export * from "./admin";
