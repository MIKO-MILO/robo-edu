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
  data: T;
}

/** Sesuai rest-api-standards-v2.md §5 & api.md §1.3 — struktur collection + pagination. */
export interface ApiCollectionResponse<T> {
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
