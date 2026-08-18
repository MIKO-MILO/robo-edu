/**
 * enums.ts
 * ------------------------------------------------------------------
 * Semua status/enum dipetakan LANGSUNG dari kolom `enum(...)` di
 * 0000_roboedu_initial_schema.sql. Ini bukan status "cita-cita" dari
 * PRD Bab 5/9.2/11.2/13.2 — kalau PRD dan kodebase beda, kodebase yang
 * dipakai, dan perbedaannya ditulis sebagai komentar // TODO di bawah.
 *
 * Kalau nanti salah satu dari 3 diskrepansi di api.md §18 diputuskan
 * (shipment model, status complaint, role granular admin), enum yang
 * relevan di file ini WAJIB diupdate bareng schema.ts & migration baru.
 * ------------------------------------------------------------------
 */

/** Kolom `user.role`. PRD Bab 5 minta superadmin/admin_sales/admin_laporan,
 * tapi kodebase saat ini baru CUSTOMER & ADMIN. // TODO: role granular admin */
export type UserRole = "CUSTOMER" | "ADMIN";

/** Kolom `user.reseller_status`. Ini TERPISAH dari `role` — jangan digabung
 * jadi satu field di UI/middleware (lihat PRD Bab 5–6). */
export type ResellerStatus = "NOT_RESELLER" | "PENDING" | "APPROVED" | "REJECTED";

/** Dipakai di kolom `product.status` DAN `product_variant.status`.
 * Sesuai PRD 9.2. */
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

/** Kolom `order.status`. Sesuai PRD 13.2 & siklus di PRD Bab 13.1. */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

/** Kolom `payment.status`. Sesuai PRD 11.2. */
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

/** Kolom `voucher.discount_type`. */
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

/**
 * Kolom `review.status` di DB bertipe VARCHAR (default 'PUBLISHED'),
 * BUKAN enum MySQL asli — artinya tidak divalidasi di level database.
 * Nilai berikut adalah kontrak yang dipakai backend (lihat api.md §13:
 * "Moderasi (PUBLISHED/hidden)"). Validasi HARUS dilakukan di aplikasi.
 */
export type ReviewStatus = "PUBLISHED" | "HIDDEN";

/**
 * Kolom `complaints.status` juga VARCHAR, default 'OPEN' di kodebase.
 * PRD Bab 17 minta SUBMITTED/IN_REVIEW/RESOLVED/REJECTED.
 * api.md §18 poin 2 menandai ini sebagai hal yang BELUM diputuskan.
 * // TODO: ganti union ini begitu Goldii & tim memutuskan satu standar.
 */
export type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

/** Kolom `email_log.status`, VARCHAR default 'PENDING'. */
export type EmailLogStatus = "PENDING" | "SENT" | "FAILED";

/** Kolom `email_log.type`, VARCHAR bebas. PRD Bab 25.8 baru menyebut
 * RECEIPT & OTHER sebagai contoh nilai, belum tentu final/lengkap. */
export type EmailType = "RECEIPT" | "OTHER";

/**
 * Kolom `shipment.status` & `shipment_tracking.status` VARCHAR bebas
 * (tidak ada enum resmi di migration). Union ini adalah SARAN nilai
 * yang konsisten dipakai FE/BE, bukan constraint dari database.
 */
export type ShipmentStatus =
  | "PENDING"
  | "PACKED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "FAILED";
