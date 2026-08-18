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
