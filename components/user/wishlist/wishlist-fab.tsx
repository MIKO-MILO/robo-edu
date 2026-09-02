"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

/**
 * Atom — Floating Action Button wishlist.
 *
 * - Fixed di pojok kanan bawah layar (z-40, di bawah sidebar z-50)
 * - Menampilkan badge counter di atas tombol jika ada item
 * - Click → membuka/menutup WishlistSidebar via context
 * - Ikon jantung terisi (filled) saat wishlist tidak kosong
 */
export function WishlistFab() {
  const { items, toggleSidebar } = useWishlist();
  const count = items.length;
  const hasItems = count > 0;

  return (
    <div className="fixed bottom-6 right-6 z-40" aria-live="polite">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={
          hasItems
            ? `Buka wishlist — ${count} item tersimpan`
            : "Buka wishlist"
        }
        className={cn(
          // Shape & Size
          "relative flex items-center justify-center w-14 h-14 rounded-full",
          // Color — primary brand
          "bg-primary text-white",
          // Neo-brutalism border & shadow
          "border-2 border-foreground",
          "shadow-[4px_4px_0px_0px_#3D2900]",
          // Hover: geser 2px ke kanan-bawah, shadow mengecil
          "transition-all duration-150 ease-in-out",
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#3D2900]",
          // Active
          "active:scale-95 active:shadow-none",
          "cursor-pointer"
        )}
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all duration-200",
            hasItems
              ? "fill-white text-white scale-110"
              : "fill-none text-white"
          )}
          aria-hidden="true"
        />

        {/* Badge counter — muncul hanya jika ada item */}
        {hasItems && (
          <span
            aria-hidden="true"
            className={cn(
              // Positioning
              "absolute -top-2 -right-2",
              // Size & Shape
              "min-w-[1.5rem] h-6 px-1.5 rounded-full",
              // Color — accent yellow
              "bg-accent-yellow border-2 border-foreground",
              // Shadow
              "shadow-[2px_2px_0px_0px_#3D2900]",
              // Typography
              "flex items-center justify-center",
              "font-body font-bold text-xs text-foreground",
              // Entrance animation
              "animate-bounce"
            )}
            style={{ animationDuration: "0.6s", animationIterationCount: "1" }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
    </div>
  );
}
