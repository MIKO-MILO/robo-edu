"use client";

import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
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
        "bg-card border-2 border-foreground rounded-2xl p-3",
        "neo-shadow",
        "transition-transform duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#3D2900]",
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
          className="w-16 h-16 rounded-xl border-2 border-foreground"
          sizes="64px"
        />
      </div>

      {/* ── Info Produk ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
        <h3 className="font-heading font-bold text-sm text-foreground leading-tight line-clamp-2">
          {item.product_name}
        </h3>

        <span className="font-body font-bold text-sm text-primary leading-none">
          {formatPrice(item.base_price)}
        </span>

        {/* Badge stok */}
        <span
          className={cn(
            "self-start font-body text-[10px] font-semibold",
            "px-2 py-0.5 rounded-full border",
            item.in_stock
              ? "bg-success-bg text-success border-success/30"
              : "bg-danger-bg text-danger border-danger/30"
          )}
        >
          {item.in_stock ? "Tersedia" : "Stok Habis"}
        </span>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {/* Link ke halaman detail produk */}
        <Link
          href={`/products/${item.product_slug}`}
          aria-label={`Lihat detail ${item.product_name}`}
        >
          <Button
            variant="primary"
            size="icon-xs"
            neo={false}
            tabIndex={-1}
            className="hover:opacity-80"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </Link>

        {/* Hapus dari wishlist */}
        <Button
          variant="danger"
          size="icon-xs"
          neo={false}
          onClick={() => onRemove(item.id)}
          aria-label={`Hapus ${item.product_name} dari wishlist`}
          className="hover:opacity-80"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
