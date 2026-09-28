import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  WishlistItemDetail,
  AddWishlistItemRequestBody,
} from "@/types";

export const wishlistService = {
  /** GET /wishlist - List wishlist milik user */
  async getWishlist(): Promise<ApiCollectionResponse<WishlistItemDetail>> {
    return http.get<ApiCollectionResponse<WishlistItemDetail>>("/wishlist");
  },

  /** POST /wishlist - Tambah produk ke wishlist */
  async addItem(
    productId: string
  ): Promise<ApiResponse<WishlistItemDetail>> {
    const body: AddWishlistItemRequestBody = { product_id: productId };
    return http.post<ApiResponse<WishlistItemDetail>>("/wishlist", body);
  },

  /** DELETE /wishlist/{id} - Hapus item dari wishlist */
  async removeItem(wishlistId: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/wishlist/${wishlistId}`);
  },
};
