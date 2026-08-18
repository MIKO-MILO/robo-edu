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
