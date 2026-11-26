"use client";

import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import type { WishlistItemDetail } from "@/types";
import type { UUID } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  if (price === 0) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WishlistItemCardProps {
  item: WishlistItemDetail;
  onRemove: (wishlist_item_id: UUID) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Atom — kartu satu item wishlist di dalam sidebar.
 * Menampilkan gambar, nama produk, harga, badge stok,
 * tombol link ke detail, dan tombol hapus.
 *
 * Gaya: outline tipis (1px), tanpa shadow tebal.
 */
export function WishlistItemCard({
  item,
  onRemove,
  className,
}: WishlistItemCardProps) {
  return (
    <article
      className={cn(
        "group flex items-start gap-3",
        // Outline tipis tanpa shadow
        "bg-card border border-foreground/15 rounded-2xl p-3 shadow-none",
        "transition-colors hover:bg-card/90",
        className
      )}
    >
      {/* ── Gambar Produk ── */}
      <div className="shrink-0">
        <ProductImage
          src={item.image_url}
          alt={item.product_name}
          size="sm"
          aspectRatio="square"
          className="w-16 h-16 rounded-xl border border-foreground/15"
          sizes="64px"
        />
      </div>

     {/* ── Info Produk ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
        <h3 className="font-heading font-bold text-sm text-foreground leading-tight line-clamp-2">
          {item.product_name}
        </h3>

        {/* Harga lebih pudar lagi (text-foreground/60), angka tetap terbaca jelas */}
        <span className="font-body font-bold text-sm text-foreground/60 leading-none">
          {formatPrice(item.base_price)}
        </span>

        {/* Badge stok */}
        <span
          className={cn(
            "self-start font-body text-[10px] font-semibold",
            "mt-2 px-2 py-0.5 rounded-full border",
            item.in_stock
              ? "bg-success-bg text-success border-success/30"
              : "bg-danger-bg text-danger border-danger/30"
          )}
        >
          {item.in_stock ? "Tersedia" : "Stok Habis"}
        </span>
      </div>

      {/* ── Action Icons (tanpa lingkaran) ── */}
      <div className="flex flex-col items-center gap-2.5 shrink-0 pt-1">
        <Link
          href={`/products/${item.product_slug}`}
          aria-label={`Lihat detail ${item.product_name}`}
          className="text-foreground hover:opacity-75 transition-opacity cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Hapus ${item.product_name} dari wishlist`}
          className="text-love-red hover:opacity-75 transition-opacity cursor-pointer"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}