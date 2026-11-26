"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WishlistFab() {
  const { items, toggleSidebar } = useWishlist();
  const count = items.length;
  const hasItems = count > 0;

  return (
    <div className="fixed bottom-6 right-6 z-40" aria-live="polite">
      <Button
        type="button"
        variant="accent-yellow"
        size="icon"
        neo={false}
        onClick={toggleSidebar}
        aria-label={
          hasItems
            ? `Buka wishlist — ${count} item tersimpan`
            : "Buka wishlist"
        }
        className={cn(
          "relative flex items-center justify-center w-14 h-14 rounded-full",
          "bg-accent-yellow text-foreground outline-yellow-dark shadow-none",
          "hover:opacity-90 transition-opacity",
          "active:scale-95 cursor-pointer"
        )}
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all duration-200",
            hasItems
              ? "fill-love-red text-love-red scale-110"
              : "fill-none text-love-red"
          )}
          aria-hidden="true"
        />

        {hasItems && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -top-3 -right-2.5",
              "min-w-8 h-8 px-1.5 rounded-full",
              "bg-badge-red text-white",
              "border border-white/80 shadow-none",
              "flex items-center justify-center",
              "font-body font-bold text-sm leading-none",
              "animate-badge-float"
            )}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
    </div>
  );
}