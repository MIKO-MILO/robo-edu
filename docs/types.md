import type { UUID, ISODateString, Money } from "./common";
import type { EmailLogStatus, EmailType } from "./enums";

/**
 * admin.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `audit_log`, `email_log`, ditambah beberapa DTO
 * untuk dashboard & laporan (api.md §16). `audit_log` sendiri TIDAK
 * ada di ERD PRD Bab 25 — ini diskrepansi #2 dari 3 yang tercatat di
 * memory & api.md §18 (bukan hal buruk, cuma perlu didokumentasikan
 * balik ke PRD kalau memang mau dipertahankan).
 * ------------------------------------------------------------------
 */

/** Catatan: tabel `audit_log` TIDAK punya kolom `updated_at` — log
 * memang tidak pernah diedit setelah dibuat, sengaja begitu. */
export interface AuditLog {
  id: UUID;
  actor_id: UUID;
  action: string; // mis. "APPROVE_RESELLER", "UPDATE_PRODUCT_PRICE"
  target_type: string; // mis. "product", "order", "user"
  target_id: UUID;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: ISODateString;
}

/** Catatan: `email_log` juga TIDAK punya kolom `updated_at`. */
export interface EmailLog {
  id: UUID;
  order_id: UUID | null;
  user_id: UUID | null;
  email: string;
  type: EmailType | (string & {});
  subject: string;
  status: EmailLogStatus;
  sent_at: ISODateString | null;
  created_at: ISODateString;
}

/** Response data — GET /admin/dashboard */
export interface AdminDashboardSummary {
  revenue_this_month: Money;
  total_orders: number;
  pending_orders: number;
  top_products: Array<{ product_id: UUID; name: string; total_sold: number }>;
  low_stock_products: Array<{ product_id: UUID; variant_id: UUID; name: string; stock: number }>;
}

/** Response item — GET /admin/inventory/low-stock */
export interface LowStockItem {
  product_id: UUID;
  product_name: string;
  variant_id: UUID;
  variant_name: string;
  stock: number;
  threshold: number;
}

/** Response item — GET /admin/reports/sales */
export interface SalesReportPoint {
  period: string; // mis. "2026-08-18" atau "2026-W33" tergantung group_by
  total_orders: number;
  total_revenue: Money;
}
import type { ApiErrorCode, ApiErrorDetail } from "./common";

/**
 * Options untuk API Client request.
 */
export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, any>;
  idempotencyKey?: string;
  traceId?: string;
  skipAuthRedirect?: boolean;
}

/**
 * Custom Base Error class untuk semua error HTTP/API.
 */
export class ApiErrorResponse extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode | string;
  public readonly traceId?: string;
  public readonly details?: ApiErrorDetail[];

  constructor(
    statusCode: number,
    code: ApiErrorCode | string,
    message: string,
    traceId?: string,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = "ApiErrorResponse";
    this.statusCode = statusCode;
    this.code = code;
    this.traceId = traceId;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error khusus 422 Validation Error dengan map fieldErrors: Record<fieldName, message>
 */
export class ApiValidationError extends ApiErrorResponse {
  public readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    details: ApiErrorDetail[] = [],
    traceId?: string
  ) {
    super(422, "VALIDATION_ERROR", message, traceId, details);
    this.name = "ApiValidationError";

    const fieldMap: Record<string, string> = {};
    for (const detail of details) {
      if (detail.field) {
        fieldMap[detail.field] = detail.message;
      }
    }
    this.fieldErrors = fieldMap;
  }
}

/**
 * Error khusus 403 Forbidden ("tidak punya akses")
 */
export class ApiForbiddenError extends ApiErrorResponse {
  constructor(
    message: string = "Anda tidak memiliki akses ke fitur atau halaman ini.",
    traceId?: string
  ) {
    super(403, "FORBIDDEN", message, traceId);
    this.name = "ApiForbiddenError";
  }
}

/**
 * Error khusus 429 Rate Limited ("terlalu banyak request")
 */
export class ApiRateLimitError extends ApiErrorResponse {
  public readonly retryAfterSeconds: number;

  constructor(
    message: string = "Terlalu banyak request, silakan coba beberapa saat lagi.",
    retryAfterSeconds: number = 60,
    traceId?: string
  ) {
    super(429, "RATE_LIMITED", message, traceId);
    this.name = "ApiRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
import type { UUID, ISODateString, Money } from "./common";

/**
 * cart.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `cart` (satu per user, `user_id` UNIQUE) &
 * `cart_item`. Lihat api.md §7.
 * ------------------------------------------------------------------
 */

export interface Cart {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CartItem {
  id: UUID;
  cart_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  quantity: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Response data — GET /cart. Berisi cart + item yang sudah diperkaya
 * info produk (nama, gambar, harga saat ini) supaya FE tidak perlu
 * fetch produk satu-satu, plus subtotal yang sudah dihitung backend. */
export interface CartDetail {
  id: UUID;
  items: CartItemDetail[];
  subtotal: Money;
  updated_at: ISODateString;
}

export interface CartItemDetail {
  id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  /** Harga per-unit SAAT INI (bukan snapshot — snapshot baru dibuat
   * saat order dibuat, lihat OrderItem di order.ts). */
  unit_price: Money;
  quantity: number;
  /** Stok tersedia saat ini, dipakai FE untuk validasi sebelum submit
   * checkout (lihat STOCK_INSUFFICIENT di common.ts ApiErrorCode). */
  available_stock: number;
  line_total: Money;
}

/** Body — POST /cart/items */
export interface AddCartItemRequestBody {
  product_id: UUID;
  variant_id?: UUID;
  quantity: number;
}

/** Body — PATCH /cart/items/{id} */
export interface UpdateCartItemRequestBody {
  quantity: number;
}
import type { UUID, ISODateString, Money } from "./common";
import type { ProductStatus } from "./enums";

/**
 * catalog.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `category`, `product_type`, `product`,
 * `product_variant`, `product_image`.
 *
 * CATATAN PENTING (baca ini sebelum bikin halaman produk):
 * Tabel `product` di kodebase TIDAK punya kolom harga (base_price /
 * base_reseller_price seperti disebut PRD Bab 9.1/25.2). Harga & stok
 * HANYA ada di `product_variant`. Artinya setiap produk yang bisa
 * dibeli wajib punya minimal satu baris di product_variant — kalau
 * tidak, produk itu tidak punya harga sama sekali secara teknis.
 * Ini belum tertulis eksplisit sebagai keputusan di api.md §18, jadi
 * sebaiknya didiskusikan dengan tim sebelum halaman detail produk
 * mengasumsikan selalu ada `variants[0]` sebagai harga default.
 * ------------------------------------------------------------------
 */

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductType {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Baris mentah tabel `product` — TANPA relasi/harga. Untuk tampilan
 * yang butuh harga/variant/gambar, pakai `ProductDetail` di bawah. */
export interface Product {
  id: UUID;
  category_id: UUID;
  product_type_id: UUID | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  status: ProductStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductVariant {
  id: UUID;
  product_id: UUID;
  variant_name: string; // mis. "Merah", "Biru", "Basic"
  sku: string;
  price: Money;
  reseller_price: Money | null;
  stock: number; // kuota/kapasitas produksi, bukan stok gudang tradisional (PRD Bab 14)
  weight: number | null; // kg, nullable
  status: ProductStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ProductImage {
  id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  image_url: string; // URL MinIO
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/* ------------------------------------------------------------------
 * DTO gabungan — bentuk response ASLI yang dikirim endpoint, bukan
 * satu-ke-satu dengan tabel DB (ada nested object & field turunan).
 * Cocokkan ke contoh JSON di api.md §6.
 * ------------------------------------------------------------------ */

/** Response data — GET /products/{slug} (api.md §6) */
export interface ProductDetail {
  id: UUID;
  name: string;
  slug: string;
  sku: string;
  category: Pick<Category, "id" | "name" | "slug">;
  product_type: Pick<ProductType, "id" | "name" | "slug"> | null;
  description: string | null;
  status: ProductStatus;
  /** `reseller_price` hanya terisi kalau token pemanggil reseller APPROVED,
   * selain itu backend mengirim `null`/menghilangkan field ini (api.md §6 catatan). */
  price: {
    base_price: Money;
    reseller_price: Money | null;
    currency: "IDR";
  };
  variants: Array<
    Pick<ProductVariant, "id" | "variant_name" | "sku" | "price" | "reseller_price" | "stock" | "status">
  >;
  images: Array<Pick<ProductImage, "id" | "image_url" | "is_primary" | "sort_order">>;
  rating: {
    average: number;
    count: number;
  };
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Item ringkas — dipakai di GET /products (list/katalog). Lebih ringan
 * dari ProductDetail karena tidak selalu butuh semua variant/gambar. */
export interface ProductListItem {
  id: UUID;
  name: string;
  slug: string;
  sku: string;
  status: ProductStatus;
  category: Pick<Category, "id" | "name" | "slug">;
  primary_image_url: string | null;
  price: {
    base_price: Money;
    reseller_price: Money | null;
  };
  rating_average: number | null;
}

/* ---------------------- Request bodies (admin) ---------------------- */

export type CreateProductRequestBody = Pick<
  Product,
  "category_id" | "product_type_id" | "name" | "slug" | "sku" | "description"
>;

export type UpdateProductRequestBody = Partial<CreateProductRequestBody>;

export type CreateVariantRequestBody = Omit<
  ProductVariant,
  "id" | "product_id" | "created_at" | "updated_at"
>;

export type UpdateVariantRequestBody = Partial<CreateVariantRequestBody>;
/**
 * common.ts
 * ------------------------------------------------------------------
 * "Cetakan kue" untuk amplop (envelope) response API — bentuk luar
 * dari SEMUA response, apapun isinya. Dipakai untuk membungkus tipe
 * entity/DTO lain, misalnya:
 *
 *   type ProductDetailApiResponse = ApiResponse<ProductDetailDto>;
 *   type ProductListApiResponse = ApiCollectionResponse<Product>;
 *
 * Kalau backend lupa taruh field di dalam "data", atau lupa "meta"
 * pada collection, TypeScript langsung protes saat build — bukan pas
 * production.
 * ------------------------------------------------------------------
 */

/** Semua kolom UUID (varchar(36)) di DB direpresentasikan sebagai string di TS. */
export type UUID = string;

/** Semua kolom `timestamp` di DB direpresentasikan sebagai string ISO 8601 UTC
 * ("2026-08-18T10:30:00Z") setelah lewat JSON — BUKAN objek Date bawaan JS. */
export type ISODateString = string;

/** Kolom `decimal(...)` di MySQL biasanya dikirim sebagai string oleh driver
 * DB / Drizzle, atau di-cast jadi number di layer API. Pakai `Money` supaya
 * tim sepakat satu representasi (di sini: number, satuan Rupiah, tanpa desimal
 * pecahan karena IDR tidak punya sen). Kalau backend ternyata mengirim string,
 * ganti alias ini SEKALI di sini, tidak perlu ubah satu-satu di semua file. */
export type Money = number;

/** Sesuai rest-api-standards-v2.md §5 — struktur single resource. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Sesuai rest-api-standards-v2.md §5 & api.md §1.3 — struktur collection + pagination. */
export interface ApiCollectionResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

/** Sesuai rest-api-standards-v2.md §5 & api.md §1.4 — struktur error.
 * `trace_id` WAJIB ada di setiap error (diambil dari header X-Request-ID). */
export interface ApiError {
  success: false;
  error: {
    code: ApiErrorCode | (string & {});
    message: string;
    trace_id: string;
    details?: ApiErrorDetail[];
  };
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

/** Daftar kode error yang sudah didokumentasikan di api.md §17.
 * `(string & {})` di ApiErrorCode memberi autocomplete tanpa melarang
 * kode baru yang belum sempat ditambahkan ke union ini. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STOCK_INSUFFICIENT"
  | "VOUCHER_INVALID"
  | "REVIEW_NOT_ELIGIBLE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

/** Query parameter umum untuk endpoint list, sesuai api.md §1.5. */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string; // contoh: "-created_at"
  search?: string;
  fields?: string; // contoh: "id,name,base_price"
}
import type { UUID, ISODateString } from "./common";
import type { ComplaintStatus } from "./enums";

/**
 * complaint.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `complaints` & `complaint_attachments`.
 *
 * CATATAN: field kodebase (`subject`, `resolution`, `resolved_at`)
 * BEDA dari PRD Bab 25.7 (`contact_method_used`, `admin_notes`).
 * Tipe di bawah mengikuti kodebase — ini diskrepansi #2 di api.md §18
 * yang masih perlu diputuskan sebelum FE final dibangun.
 * ------------------------------------------------------------------
 */

export interface Complaint {
  id: UUID;
  order_item_id: UUID;
  user_id: UUID;
  subject: string;
  description: string; // kronologi kejadian dari customer
  status: ComplaintStatus;
  resolution: string | null; // catatan tindak lanjut admin
  resolved_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ComplaintAttachment {
  id: UUID;
  complaint_id: UUID;
  file_url: string; // URL MinIO
  file_name: string;
  file_type: string | null; // mis. "image/jpeg", "video/mp4"
  created_at: ISODateString;
}

/** Response data — GET /complaints/{id} */
export interface ComplaintDetail extends Complaint {
  attachments: ComplaintAttachment[];
}

/** Body — POST /complaints (api.md §14) */
export interface CreateComplaintRequestBody {
  order_item_id: UUID;
  subject: string;
  description: string;
}

/** Body — PATCH /admin/complaints/{id} */
export interface UpdateComplaintRequestBody {
  status: ComplaintStatus;
  resolution?: string;
}
/**
 * contact.ts
 * ------------------------------------------------------------------
 * Tipe data untuk fitur kontak, pesan masukan, dan media sosial.
 * ------------------------------------------------------------------
 */

export interface ContactMessageRequestBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SocialMediaContact {
  id: string;
  platform: string;
  handle: string;
  description: string;
  actionText: string;
  href: string;
  bgColorClass: string;
  iconName: "message-circle" | "mail" | "instagram" | "youtube";
}
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

/** Kolom `user.role`. Granular role di DB: superadmin, admin_sales, admin_laporan, customer. */
export type UserRole = "superadmin" | "admin_sales" | "admin_laporan" | "customer";

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
export * from "./contact";
export * from "./api-client";
import type { UUID, ISODateString, Money } from "./common";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "./enums";

/**
 * order.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `order`, `order_item`, `payment`, `shipment`,
 * `shipment_tracking`, `shipping_provider`.
 *
 * CATATAN PENTING soal shipment (lihat api.md §18 poin 1 — INI SALAH
 * SATU DARI 3 DISKREPANSI YANG BELUM DIPUTUSKAN):
 * Tipe di bawah mengikuti KODEBASE, yaitu shipment sebagai tabel
 * terpisah (`Shipment` + `ShipmentTracking`), BUKAN kolom langsung di
 * `order` seperti di PRD Bab 25.4. Kalau keputusan akhir berubah ikut
 * PRD, interface `Shipment`, `ShipmentTracking`, dan bagian shipment
 * di `OrderDetail` di file ini WAJIB direvisi bareng schema.ts.
 *
 * Juga perhatikan: tabel `order` di kodebase menyimpan snapshot alamat
 * pengiriman LANGSUNG di kolom order (recipient_name, shipping_address,
 * dst) SEKALIGUS referensi `address_id` ke user_address — supaya kalau
 * user_address diedit/dihapus, histori order tidak ikut berubah.
 * ------------------------------------------------------------------
 */

export interface Order {
  id: UUID;
  order_number: string;
  user_id: UUID;
  address_id: UUID;
  voucher_id: UUID | null;
  subtotal: Money;
  discount_amount: Money;
  shipping_cost: Money;
  total: Money;
  voucher_code_snapshot: string | null;
  status: OrderStatus;
  // Snapshot alamat pengiriman pada saat order dibuat:
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_village: string | null;
  shipping_postal_code: string | null;
  paid_at: ISODateString | null;
  shipped_at: ISODateString | null;
  delivered_at: ISODateString | null;
  completed_at: ISODateString | null;
  cancelled_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  product_id: UUID;
  variant_id: UUID | null;
  /** Snapshot — tidak berubah walau produk/variant aslinya diubah/dihapus
   * setelahnya (PRD Bab 13.3). Ini yang dipakai untuk validasi review & klaim. */
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  sku_snapshot: string;
  price_snapshot: Money;
  quantity: number;
  subtotal: Money;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Payment {
  id: UUID;
  order_id: UUID;
  transaction_id: string; // ID transaksi Midtrans
  payment_type: string; // mis. "gopay", "bank_transfer"
  status: PaymentStatus;
  amount: Money;
  transaction_time: ISODateString | null;
  settlement_time: ISODateString | null;
  expiry_time: ISODateString | null;
  fraud_status: string | null;
  /** Payload mentah webhook Midtrans. Isinya bebas (JSON), jangan
   * ditampilkan langsung ke customer — hanya untuk admin/debug. */
  raw_response: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ShippingProvider {
  id: UUID;
  name: string; // mis. "J&T"
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Shipment {
  id: UUID;
  order_id: UUID;
  shipping_provider_id: UUID;
  service: string | null; // mis. "REG", "YES"
  tracking_number: string | null; // nomor resi
  status: ShipmentStatus;
  shipped_at: ISODateString | null;
  delivered_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ShipmentTracking {
  id: UUID;
  shipment_id: UUID;
  status: ShipmentStatus;
  description: string | null;
  location: string | null;
  occurred_at: ISODateString;
  created_at: ISODateString;
}

/* ------------------------------------------------------------------
 * DTO gabungan sesuai contoh response di api.md §10-12.
 * ------------------------------------------------------------------ */

/** Response data — GET /orders/{id} (order_items + payment + shipment sekaligus) */
export interface OrderDetail extends Order {
  order_items: OrderItem[];
  payment: Pick<Payment, "status" | "payment_type" | "amount" | "transaction_time"> | null;
  shipment: (Pick<Shipment, "tracking_number" | "status" | "shipped_at" | "delivered_at"> & {
    provider_name: string;
    trackings: ShipmentTracking[];
  }) | null;
}

/**
 * DTO ringan untuk endpoint list order — GET /orders?page=...
 * Hanya field yang dibutuhkan halaman history order (ringkasan),
 * bukan `OrderDetail` yang load payment + shipment + semua items.
 * Kalau backend menambah/mengubah field preview, cukup ubah di sini.
 */
export interface OrderListItem
  extends Pick<Order, "id" | "order_number" | "status" | "total" | "created_at"> {
  /** Preview produk pertama — untuk thumbnail & nama di kartu order */
  first_item: {
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    /** URL gambar produk; null jika belum ada gambar */
    image_url: string | null;
  };
  /** Total jumlah item dalam order (untuk label "+N produk lainnya") */
  item_count: number;
}

/** Body — POST /checkout/summary DAN POST /orders (api.md §10) */
export interface CreateOrderRequestBody {
  address_id: UUID;
  shipping_provider_id: UUID;
  shipping_service: string;
  voucher_code?: string;
}

/** Response data — POST /checkout/summary (preview, TANPA membuat order) */
export interface CheckoutSummary {
  subtotal: Money;
  shipping_cost: Money;
  discount_amount: Money;
  total: Money;
  items: Array<{
    product_id: UUID;
    variant_id: UUID | null;
    quantity: number;
    unit_price: Money;
    line_total: Money;
  }>;
}

/** Response data — POST /orders (api.md §10, "201") */
export interface CreateOrderResponseData {
  id: UUID;
  order_number: string;
  status: OrderStatus;
  subtotal: Money;
  discount_amount: Money;
  shipping_cost: Money;
  total: Money;
  order_items: Array<
    Pick<
      OrderItem,
      | "id"
      | "product_id"
      | "variant_id"
      | "product_name_snapshot"
      | "variant_name_snapshot"
      | "price_snapshot"
      | "quantity"
      | "subtotal"
    >
  >;
  payment: {
    midtrans_redirect_url: string;
    status: PaymentStatus;
  };
  created_at: ISODateString;
}

/** Body webhook dari Midtrans — POST /payments/midtrans/webhook (api.md §11).
 * Field ini datang dari Midtrans, BUKAN dari FE kita, jadi snake_case-nya
 * mengikuti dokumentasi Midtrans, bukan konvensi internal RoboEdu. */
export interface MidtransWebhookBody {
  order_id: string; // ini order_number, bukan UUID `order.id`
  transaction_id: string;
  transaction_status: string; // mis. "settlement", "pending", "expire"
  fraud_status: string;
  payment_type: string;
  gross_amount: string; // Midtrans kirim sebagai string, bukan number
}

/** Body — POST /admin/orders/{id}/shipment (admin input data pengiriman) */
export interface CreateShipmentRequestBody {
  shipping_provider_id: UUID;
  service?: string;
  tracking_number?: string;
}

/** Body — POST /admin/shipments/{id}/trackings */
export type AddShipmentTrackingRequestBody = Pick<
  ShipmentTracking,
  "status" | "description" | "location" | "occurred_at"
>;

/** Body — PATCH /admin/orders/{id}/status */
export interface UpdateOrderStatusRequestBody {
  status: Extract<
    OrderStatus,
    "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "REFUNDED"
  >;
}
import type { UUID, ISODateString } from "./common";
import type { ReviewStatus } from "./enums";

/**
 * review.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `review`. `order_item_id` bersifat UNIQUE di DB
 * — artinya satu order_item hanya boleh direview sekali (lihat error
 * CONFLICT di api.md §13).
 * ------------------------------------------------------------------
 */

export interface Review {
  id: UUID;
  order_item_id: UUID;
  user_id: UUID;
  product_id: UUID;
  rating: number; // idealnya divalidasi 1-5 di layer aplikasi, DB tidak membatasi
  comment: string | null;
  status: ReviewStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Response data — GET /products/{id}/reviews (diperkaya nama user singkat) */
export interface ReviewWithAuthor extends Review {
  author_name: string;
}

/** Body — POST /reviews (api.md §13) */
export interface CreateReviewRequestBody {
  order_item_id: UUID;
  rating: number;
  comment?: string;
}

/** Body — PATCH /reviews/{id} */
export type UpdateReviewRequestBody = Partial<Pick<CreateReviewRequestBody, "rating" | "comment">>;

/** Body — PATCH /admin/reviews/{id}/status */
export interface UpdateReviewStatusRequestBody {
  status: ReviewStatus;
}
import type { UUID, ISODateString } from "./common";
import type { UserRole, ResellerStatus } from "./enums";

/**
 * user.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `user` & `user_address`.
 *
 * PENTING soal keamanan: kolom `password` (hash) di tabel `user`
 * TIDAK BOLEH pernah muncul di response API atau di tipe ini. Kalau
 * suatu saat kamu lihat field seperti `password` atau `password_hash`
 * masuk ke response backend, itu bug — lihat rest-api-standards-v2.md
 * §9 poin 9: "Jangan expose sensitive data di response".
 * ------------------------------------------------------------------
 */

export interface User {
  id: UUID;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  reseller_approved_at: ISODateString | null;
  is_active: boolean;
  last_login_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Alamat milik user. `label` bebas isi (mis. "Rumah", "Kantor/Sekolah").
 * Juga dipakai untuk customer institusi (PRD Bab 4). */
export interface UserAddress {
  id: UUID;
  user_id: UUID;
  label: string | null;
  recipient_name: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string | null;
  postal_code: string | null;
  is_primary: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/* ------------------------------------------------------------------
 * DTO khusus untuk request body, dipisah dari entity di atas karena
 * body request TIDAK mengirim field seperti id/created_at/updated_at.
 * ------------------------------------------------------------------ */

/** Body — POST /auth/register (api.md §2) */
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Body — POST /auth/login (api.md §2) */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/** Response data — POST /auth/login (api.md §2, "200") */
export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in: number; // detik
  user: Pick<User, "id" | "name" | "role" | "reseller_status">;
}

/** Body — POST /users/me/addresses & PATCH /users/me/addresses/{id} */
export type UpsertAddressRequestBody = Omit<
  UserAddress,
  "id" | "user_id" | "created_at" | "updated_at"
>;

/** Body — PATCH /users/me (hanya nama & telepon, bukan email/password) */
export type UpdateProfileRequestBody = Partial<Pick<User, "name" | "phone">>;

/** Body — PATCH /users/me/password */
export interface UpdatePasswordRequestBody {
  current_password: string;
  new_password: string;
}
import type { UUID, ISODateString, Money } from "./common";
import type { DiscountType } from "./enums";

/**
 * voucher.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `voucher` & `voucher_usage`.
 * ------------------------------------------------------------------
 */

export interface Voucher {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number; // persen (kalau PERCENTAGE) atau nominal (kalau FIXED_AMOUNT)
  minimum_purchase: Money | null;
  maximum_discount: Money | null; // relevan kalau discount_type = PERCENTAGE
  usage_limit: number | null;
  used_count: number;
  start_at: ISODateString | null;
  end_at: ISODateString | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Catatan: tabel `voucher_usage` TIDAK punya kolom `updated_at`
 * (beda dari kebanyakan tabel lain) — histori pemakaian memang tidak
 * pernah diedit, jadi ini bukan bug/typo di schema, melainkan disengaja. */
export interface VoucherUsage {
  id: UUID;
  voucher_id: UUID;
  user_id: UUID;
  order_id: UUID;
  discount_amount: Money;
  created_at: ISODateString;
}

/** Body — POST /vouchers/validate (api.md §9) */
export interface ValidateVoucherRequestBody {
  code: string;
}

/** Response data — POST /vouchers/validate ("200") */
export interface ValidateVoucherResponseData {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  estimated_discount: Money;
  is_valid: boolean;
}

/** Body — POST /admin/vouchers */
export type CreateVoucherRequestBody = Omit<
  Voucher,
  "id" | "used_count" | "created_at" | "updated_at"
>;

export type UpdateVoucherRequestBody = Partial<CreateVoucherRequestBody>;
import type { UUID, ISODateString } from "./common";

/**
 * wishlist.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `wishlist`.
 *
 * CATATAN: PRD Bab 25.3 mencantumkan kolom `variant_id` (nullable) di
 * ERD wishlist, tapi tabel `wishlist` di kodebase TIDAK punya kolom
 * itu — hanya `product_id`. Tipe di bawah mengikuti kodebase. Kalau
 * tim memutuskan wishlist perlu granularity per-variant, ini salah
 * satu migration tambahan yang perlu dibuat duluan.
 * ------------------------------------------------------------------
 */

export interface WishlistItem {
  id: UUID;
  user_id: UUID;
  product_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Response data — GET /wishlist (diperkaya info produk, mirip CartItemDetail) */
export interface WishlistItemDetail {
  id: UUID;
  product_id: UUID;
  product_name: string;
  product_slug: string;
  image_url: string | null;
  base_price: number;
  in_stock: boolean;
  created_at: ISODateString;
}

/** Body — POST /wishlist */
export interface AddWishlistItemRequestBody {
  product_id: UUID;
}
