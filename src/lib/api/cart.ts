export interface CartItemDto {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  variantName: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string;
  subtotal: number;
}

export interface CartResponseData {
  cartId: string;
  items: CartItemDto[];
  totalItems: number;
  subtotal: number;
}

const EMPTY_CART: CartResponseData = { cartId: "", items: [], totalItems: 0, subtotal: 0 };

/**
 * Mengambil data keranjang user dari database.
 * Mengembalikan keranjang kosong jika user belum login (401).
 */
export async function getCart(): Promise<{
  success: boolean;
  data: CartResponseData;
}> {
  const response = await fetch("/api/cart", {
    method: "GET",
    cache: "no-store",
  });

  // Not authenticated — treat as empty cart, not an error
  if (response.status === 401) {
    return { success: true, data: EMPTY_CART };
  }

  if (!response.ok) {
    throw new Error("Gagal mengambil data keranjang");
  }

  return response.json();
}

/**
 * Menambahkan item ke keranjang user.
 */
export async function addToCart(payload: {
  productId: string;
  variantId?: string;
  quantity?: number;
}): Promise<{ success: boolean; message: string; data?: unknown }> {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      response.status === 401
        ? "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang."
        : (error.message || "Gagal menambahkan produk ke keranjang"),
    );
  }

  return response.json();
}

/**
 * Mengubah jumlah quantity item di keranjang.
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const response = await fetch(`/api/cart/${cartItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Gagal mengubah jumlah produk");
  }

  return response.json();
}

/**
 * Menghapus item dari keranjang belanja.
 */
export async function removeCartItem(
  cartItemId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/cart/${cartItemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Gagal menghapus item dari keranjang");
  }

  return response.json();
}
