"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Heart, ShoppingBag, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistItemCard } from "./wishlist-item-card";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-5 text-center px-6">
      {/* Icon container */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-accent-pink border-2 border-foreground neo-shadow flex items-center justify-center">
          <Heart
            className="w-9 h-9 text-heart fill-heart"
            aria-hidden="true"
          />
        </div>
        {/* Decorative dot */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-yellow border-2 border-foreground" />
      </div>

      <div className="space-y-2">
        <h3 className="font-heading font-bold text-base text-foreground">
          Wishlist Kosong
        </h3>
        <p className="font-body text-sm text-muted-foreground max-w-[210px] leading-relaxed">
          Tekan ikon ❤️ di kartu produk untuk menambahkan ke sini.
        </p>
      </div>

      <Link href="/products">
        <Button variant="primary" size="sm" neo className="gap-2 rounded-full">
          <PackageSearch className="w-4 h-4" aria-hidden="true" />
          Jelajahi Produk
        </Button>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Molecule — panel sidebar wishlist yang muncul dari sisi kanan layar.
 * - Backdrop semi-transparan dengan blur saat terbuka
 * - Slide-in animation dari kanan
 * - Accessible: fokus trap via Escape key, aria-modal, aria-label
 * - Scroll-lock pada body saat sidebar terbuka
 */
export function WishlistSidebar() {
  const { items, isOpen, closeSidebar, removeItem } = useWishlist();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevIsOpen = useRef(false);

  // Fokuskan tombol close saat sidebar baru dibuka
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // Delay kecil untuk menunggu animasi mount
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeSidebar]);

  // Scroll-lock pada body saat sidebar terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={closeSidebar}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* ── Panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className={cn(
          // Positioning
          "fixed top-0 right-0 z-50 h-full w-full max-w-[360px]",
          // Appearance — Neo-brutalism style
          "bg-background border-l-2 border-foreground",
          // Hard shadow ke kiri (kebalikan neo-shadow yang biasanya ke kanan-bawah)
          "shadow-[-6px_0px_0px_0px_#3D2900]",
          // Layout
          "flex flex-col",
          // Slide animation
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-5 py-4 border-b-2 border-foreground shrink-0 bg-background">
          <div className="flex items-center gap-2.5">
            <Heart
              className="w-5 h-5 text-heart fill-heart"
              aria-hidden="true"
            />
            <h2 className="font-heading font-bold text-lg text-foreground">
              Wishlist
            </h2>

            {/* Badge jumlah item */}
            {items.length > 0 && (
              <span
                aria-label={`${items.length} item di wishlist`}
                className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-accent-yellow border-2 border-foreground neo-shadow-icon font-body font-bold text-xs text-foreground"
              >
                {items.length > 99 ? "99+" : items.length}
              </span>
            )}
          </div>

          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon-sm"
            neo={false}
            onClick={closeSidebar}
            aria-label="Tutup wishlist"
            className="hover:bg-muted rounded-full"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <>
              {items.map((item) => (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                />
              ))}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <footer className="shrink-0 px-4 py-4 border-t-2 border-foreground bg-background">
            <Link href="/products" onClick={closeSidebar} className="block">
              <Button
                variant="primary"
                size="lg"
                neo
                className="w-full rounded-full font-body font-bold gap-2"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Jelajahi Lebih Banyak
              </Button>
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
