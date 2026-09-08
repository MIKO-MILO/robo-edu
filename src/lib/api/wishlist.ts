import type { WishlistItemDetail, AddWishlistItemRequestBody } from "@/types/wishlist";
import type { UUID } from "@/types/common";

/**
 * Mengambil daftar wishlist user dari backend.
 */
export async function getWishlist(): Promise<{ success: boolean; data: WishlistItemDetail[] }> {
  const response = await fetch("/api/wishlist", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil wishlist");
  }

  return response.json();
}

/**
 * Menambah produk ke wishlist di backend.
 */
export async function addToWishlist(
  body: AddWishlistItemRequestBody
): Promise<{ success: boolean; data: any }> {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Gagal menambah ke wishlist");
  }

  return response.json();
}

/**
 * Menghapus item wishlist di backend.
 */
export async function removeFromWishlist(
  wishlistItemId: UUID
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Gagal menghapus dari wishlist");
  }

  return response.json();
}
