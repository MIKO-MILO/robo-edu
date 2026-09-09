import type { WishlistItemDetail, AddWishlistItemRequestBody } from "@/types/wishlist";
import type { UUID } from "@/types/common";

const EMPTY_WISHLIST = { success: true, data: [] as WishlistItemDetail[] };

/**
 * Mengambil daftar wishlist user dari backend.
 * Mengembalikan array kosong jika user belum login (401).
 */
export async function getWishlist(): Promise<{ success: boolean; data: WishlistItemDetail[] }> {
  const response = await fetch("/api/wishlist", {
    method: "GET",
    cache: "no-store",
  });

  // Not authenticated — treat as empty wishlist, not an error
  if (response.status === 401) {
    return EMPTY_WISHLIST;
  }

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
): Promise<{ success: boolean; data: unknown }> {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      response.status === 401
        ? "Silakan login terlebih dahulu untuk menambahkan produk ke wishlist."
        : ((error as { message?: string }).message || "Gagal menambah ke wishlist"),
    );
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
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message || "Gagal menghapus dari wishlist");
  }

  return response.json();
}
