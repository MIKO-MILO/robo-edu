"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateQty,
  removeCartItem as apiRemoveItem,
  type CartItemDto,
} from "@/src/lib/api/cart";

interface CartContextValue {
  items: CartItemDto[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (payload: {
    productId: string;
    variantId?: string;
    quantity?: number;
  }) => Promise<boolean>;
  updateQuantity: (cartItemId: string, newQty: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getCart();
      if (res.success) {
        setItems(res.data.items);
        setTotalItems(res.data.totalItems);
        setSubtotal(res.data.subtotal);
      }
    } catch (error) {
      console.error("Gagal mengambil keranjang:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshCart();
    })();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (payload: {
      productId: string;
      variantId?: string;
      quantity?: number;
    }) => {
      try {
        const res = await apiAddToCart(payload);
        if (res.success) {
          await refreshCart();
          return true;
        }
        return false;
      } catch (error: unknown) {
        console.error("Gagal menambah ke keranjang:", error);
        alert(error instanceof Error ? error.message : "Gagal menambah produk ke keranjang");
        return false;
      }
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, newQty: number) => {
      if (newQty < 1) return false;

      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: newQty, subtotal: item.price * newQty }
            : item
        )
      );

      try {
        const res = await apiUpdateQty(cartItemId, newQty);
        if (res.success) {
          await refreshCart();
          return true;
        }
        return false;
      } catch (error: unknown) {
        console.error("Gagal mengubah quantity:", error);
        await refreshCart(); // revert
        return false;
      }
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));

      try {
        const res = await apiRemoveItem(cartItemId);
        if (res.success) {
          await refreshCart();
          return true;
        }
        return false;
      } catch (error: unknown) {
        console.error("Gagal menghapus item:", error);
        await refreshCart(); // revert
        return false;
      }
    },
    [refreshCart]
  );

  const value: CartContextValue = {
    items,
    totalItems,
    subtotal,
    isLoading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
