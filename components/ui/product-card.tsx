"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { StarRating } from "@/components/ui/star-rating";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  id?: string;
  slug?: string;
  name: string;
  price: string;
  rating?: number;
  reviewCount?: string;
  imageUrl: string;
  bgColorClass?: string;
  isWishlisted?: boolean;
  isAddingToCart?: boolean;
  /** Jika true: tampilkan overlay "Stok Habis", disable semua aksi, card non-clickable. */
  outOfStock?: boolean;
  onWishlistClick?: () => void;
  /**
   * Dipanggil saat user menekan tombol add-to-cart.
   * Menerima quantity yang dipilih user (selalu >= 1).
   */
  onAddToCart?: (quantity: number) => void;
}

/**
 * Dumb ProductCard — tidak tahu tentang context/store apapun.
 *
 * Layout normal:
 * ┌───────────────────────────┐
 * │  [Image]                  │
 * ├───────────────────────────┤
 * │  Nama Produk              │
 * │  ★ rating   Rp harga      │
 * ├───────────────────────────┤
 * │ [♡]       [− qty +] [🛒] │
 * └───────────────────────────┘
 *
 * Layout out-of-stock:
 * ┌───────────────────────────┐
 * │  [Image grayscale]        │
 * │  ┌─────────────────────┐  │
 * │  │   Stok Habis        │  │  ← overlay di tengah image
 * │  └─────────────────────┘  │
 * ├───────────────────────────┤
 * │  Nama Produk (muted)      │
 * │  ★ rating   Rp harga      │
 * ├───────────────────────────┤
 * │ [♡ disabled] [− disabled +] [🛒 disabled] │
 * └───────────────────────────┘
 */
export function ProductCard({
  slug,
  name,
  price,
  rating = 5.0,
  reviewCount = "0 ulasan",
  imageUrl,
  bgColorClass = "bg-accent-pink",
  isWishlisted,
  isAddingToCart = false,
  outOfStock = false,
  onWishlistClick,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  // ── Navigasi ke detail (hanya jika stok tersedia) ───────────────────────
  const handleCardClick = () => {
    if (!outOfStock && slug) router.push(`/product/${slug}`);
  };

  // ── Wishlist ─────────────────────────────────────────────────────────────
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistClick?.();
  };

  // ── Add to cart + reset qty ───────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(quantity);
    setQuantity(1);
  };

  const isDisabled = outOfStock || isAddingToCart;

  return (
    <div
      role="article"
      onClick={handleCardClick}
      className={cn(
        bgColorClass,
        "rounded-3xl p-3 flex flex-col gap-3",
        "border-2 border-foreground neo-shadow",
        // Navigable hanya saat stok tersedia
        !outOfStock && slug && "cursor-pointer neo-shadow-hover",
        // Redup keseluruhan saat stok habis
        outOfStock && "opacity-75",
      )}
    >
      {/* ── Gambar Produk + Overlay Stok Habis ─────────────────── */}
      <div className="relative">
        <div className={cn(outOfStock && "grayscale opacity-60")}>
          <ProductImage src={imageUrl} alt={name} size="md" />
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
            <span className="bg-card/85 backdrop-blur-[2px] text-danger font-heading font-bold text-sm px-3 py-1.5 rounded-xl border border-danger/30 select-none">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* ── Info Produk ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 px-1">
        <h3
          className={cn(
            "font-heading font-bold text-sm leading-tight line-clamp-2",
            outOfStock ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {name}
        </h3>

        <div className="flex justify-between items-center">
          <StarRating
            rating={rating}
            reviewCount={reviewCount}
            variant="single"
            size="sm"
          />
          <span
            className={cn(
              "font-heading font-bold text-sm",
              outOfStock ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {price}
          </span>
        </div>
      </div>

      {/* ── Action Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1 px-1">
        {/* Kiri: Wishlist */}
        <WishlistButton
          isWishlisted={isWishlisted}
          onClick={handleWishlistClick}
          disabled={isDisabled}
          variant="card"
          size="icon-sm"
        />

        {/* Kanan: Stepper + Add to Cart berdempetan */}
        <div className="flex items-center gap-1.5">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            disabled={isDisabled}
          />

          <Button
            type="button"
            variant="card"
            size="icon-sm"
            disabled={isDisabled}
            onClick={handleAddToCart}
            aria-label={`Tambah ${name} ke keranjang`}
            className="shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
