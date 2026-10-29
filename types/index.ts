/**
 * index.ts — pintu masuk tunggal untuk semua types RoboEdu.
 *
 * Contoh pakai di kode Next.js:
 *   import type { Product, Order, ApiResponse } from "@/types";
 *
 * Struktur file:
 *   enums.ts      -> semua status/enum (ProductStatus, OrderStatus, MembershipStatus, dst)
 *   common.ts     -> amplop response API (ApiResponse, ApiError, dst)
 *   user.ts       -> User, UserAddress, auth request/response
 *   membership.ts -> MembershipPurchase, MembershipStatusData (sistem membership baru)
 *   reseller.ts   -> LEGACY: types sistem reseller lama (masih dipakai User type)
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
export * from "./membership";
export * from "./reseller"; // LEGACY: sistem reseller lama; dipertahankan karena beberapa komponen frontend masih menggunakannya
export * from "./catalog";
export * from "./cart";
export * from "./wishlist";
export * from "./order";
export * from "./voucher";
export * from "./review";
export * from "./complaint";
export * from "./admin";
export * from "./contact";
export * from "./api-client";
export * from "./inventory";
