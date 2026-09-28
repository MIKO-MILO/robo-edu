import { http } from "../base-client";
import type {
  ApiResponse,
  CartDetail,
  CartItemDetail,
  AddCartItemRequestBody,
} from "@/types";

export const cartService = {
  /** GET /cart - Ambil cart milik user beserta cart_items & subtotal */
  async getCart(): Promise<ApiResponse<CartDetail>> {
    return http.get<ApiResponse<CartDetail>>("/cart");
  },

  /** POST /cart/items - Tambah item ke cart */
  async addItem(body: AddCartItemRequestBody): Promise<ApiResponse<CartItemDetail>> {
    return http.post<ApiResponse<CartItemDetail>>("/cart/items", body);
  },

  /** PATCH /cart/items/{id} - Ubah quantity item di cart */
  async updateItemQuantity(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<CartItemDetail>> {
    return http.patch<ApiResponse<CartItemDetail>>(`/cart/items/${itemId}`, {
      quantity,
    });
  },

  /** DELETE /cart/items/{id} - Hapus item dari cart */
  async removeItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/cart/items/${itemId}`);
  },

  /** DELETE /cart - Kosongkan cart */
  async clearCart(): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>("/cart");
  },
};
