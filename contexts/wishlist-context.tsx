"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { WishlistItemDetail } from "@/types";
import type { UUID } from "@/types";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/src/lib/api/wishlist";

// ─────────────────────────────────────────────────────────────────────────────
// State & Action Types
// ─────────────────────────────────────────────────────────────────────────────

interface WishlistState {
  items: WishlistItemDetail[];
  isOpen: boolean;
  isLoading: boolean;
}

type WishlistAction =
  | { type: "SET_ITEMS"; payload: WishlistItemDetail[] }
  | { type: "ADD_ITEM"; payload: WishlistItemDetail }
  | { type: "REMOVE_ITEM"; payload: { wishlist_item_id: UUID } }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// Context Interface
//
// Dirancang backend-ready: saat fase pre-backend, mutasi bersifat synchronous
// (mock via localStorage). Saat backend siap, hanya bagian "Service Layer" di
// bawah yang perlu diubah — interface yang diekspos ke component tree tidak
// berubah sama sekali.
// ─────────────────────────────────────────────────────────────────────────────

/** Subset data produk yang dibutuhkan untuk membuat WishlistItemDetail baru. */
export type WishlistProductInput = Pick<
  WishlistItemDetail,
  | "product_id"
  | "product_name"
  | "product_slug"
  | "image_url"
  | "base_price"
  | "in_stock"
>;

interface WishlistContextValue {
  items: WishlistItemDetail[];
  isOpen: boolean;
  isLoading: boolean;
  /** Tambah produk ke wishlist. Idempotent: tidak akan duplikat berdasarkan product_id. */
  addItem: (product: WishlistProductInput) => void;
  /** Hapus satu item dari wishlist berdasarkan wishlist item id (bukan product_id). */
  removeItem: (wishlist_item_id: UUID) => void;
  /** Tambah jika belum ada, hapus jika sudah ada. Helper untuk toggle button. */
  toggleItem: (product: WishlistProductInput) => void;
  /** Cek apakah product_id sudah ada di wishlist. */
  isWishlisted: (product_id: UUID) => boolean;
  /** Ambil wishlist item id berdasarkan product_id, untuk keperluan removeItem. */
  getWishlistItemId: (product_id: UUID) => UUID | undefined;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

const initialState: WishlistState = {
  items: [],
  isOpen: false,
  isLoading: false,
};

function wishlistReducer(
  state: WishlistState,
  action: WishlistAction,
): WishlistState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };

    case "ADD_ITEM":
      // Guard idempotency: tidak boleh ada dua item dengan product_id yang sama
      if (state.items.some((i) => i.product_id === action.payload.product_id)) {
        return state;
      }
      return { ...state, items: [...state.items, action.payload] };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => i.id !== action.payload.wishlist_item_id,
        ),
      };

    case "SET_OPEN":
      return { ...state, isOpen: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Hydrate dari backend saat mount
  useEffect(() => {
    async function initWishlist() {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const res = await getWishlist();
        if (res.success) {
          dispatch({ type: "SET_ITEMS", payload: res.data });
        }
      } catch (error) {
        console.error("Gagal inisialisasi wishlist:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
    initWishlist();
  }, []);

  // ── Service Layer ──────────────────────────────────────────────────────────

  const addItem = useCallback(async (product: WishlistProductInput) => {
    try {
      const res = await addToWishlist({ product_id: product.product_id });
      if (res.success) {
        // Karena response POST /wishlist hanya mengembalikan {id, userId, productId},
        // kita perlu memetakan kembali ke WishlistItemDetail lengkap untuk UI.
        const newItem: WishlistItemDetail = {
          id: res.data.id,
          product_id: product.product_id,
          product_name: product.product_name,
          product_slug: product.product_slug,
          image_url: product.image_url,
          base_price: product.base_price,
          in_stock: product.in_stock,
          created_at: new Date().toISOString(),
        };
        dispatch({ type: "ADD_ITEM", payload: newItem });
      }
    } catch (error) {
      console.error("Gagal menambah wishlist:", error);
      alert("Gagal menambah produk ke wishlist");
    }
  }, []);

  const removeItem = useCallback(async (wishlist_item_id: UUID) => {
    try {
      const res = await removeFromWishlist(wishlist_item_id);
      if (res.success) {
        dispatch({ type: "REMOVE_ITEM", payload: { wishlist_item_id } });
      }
    } catch (error) {
      console.error("Gagal menghapus wishlist:", error);
      alert("Gagal menghapus produk dari wishlist");
    }
  }, []);

  const isWishlisted = useCallback(
    (product_id: UUID) => state.items.some((i) => i.product_id === product_id),
    [state.items],
  );

  const getWishlistItemId = useCallback(
    (product_id: UUID): UUID | undefined =>
      state.items.find((i) => i.product_id === product_id)?.id,
    [state.items],
  );

  const toggleItem = useCallback(
    (product: WishlistProductInput) => {
      const existing = state.items.find(
        (i) => i.product_id === product.product_id,
      );
      if (existing) {
        removeItem(existing.id);
      } else {
        addItem(product);
      }
    },
    [state.items, addItem, removeItem],
  );

  const openSidebar = useCallback(
    () => dispatch({ type: "SET_OPEN", payload: true }),
    [],
  );

  const closeSidebar = useCallback(
    () => dispatch({ type: "SET_OPEN", payload: false }),
    [],
  );

  const toggleSidebar = useCallback(
    () => dispatch({ type: "SET_OPEN", payload: !state.isOpen }),
    [state.isOpen],
  );

  const value: WishlistContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    isLoading: state.isLoading,
    addItem,
    removeItem,
    toggleItem,
    isWishlisted,
    getWishlistItemId,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/** Hook untuk mengakses wishlist context. Harus digunakan di dalam <WishlistProvider>. */
export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error(
      "useWishlist() harus digunakan di dalam <WishlistProvider>. " +
        "Pastikan komponen ini ada di dalam app/(user)/layout.tsx.",
    );
  }
  return ctx;
}
