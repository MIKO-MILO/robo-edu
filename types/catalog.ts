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
