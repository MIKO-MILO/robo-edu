"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { WishlistButton } from "@/components/ui/wishlist-button";
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
  outOfStock?: boolean;
  onWishlistClick?: () => void;
  onAddToCart?: (quantity: number) => void;
}

/**
 * ProductCard — dumb display component.
 *
 * Layout:
 * ┌─────────────────────────┐
 * │  [Image]          [♡]  │  ← wishlist top-right overlay
 * ├─────────────────────────┤
 * │  Nama Produk            │
 * │                         │
 * │  Rp harga       [🛒]  │  ← price bottom-left, cart icon bottom-right
 * └─────────────────────────┘
 */
export function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  bgColorClass = "bg-pastel-pink",
  isWishlisted,
  isAddingToCart = false,
  outOfStock = false,
  onWishlistClick,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (!outOfStock && slug) router.push(`/product/${slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistClick?.();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(1);
  };

  const isDisabled = outOfStock || isAddingToCart;

  return (
    <div
      role="article"
      onClick={handleCardClick}
      className={cn(
        bgColorClass,
        "rounded-2xl p-3 flex flex-col gap-3",
        !outOfStock && slug && "cursor-pointer",
        outOfStock && "opacity-75",
      )}
    >
      {/* Image + wishlist overlay */}
      <div className="relative">
        <div className={cn("rounded-xl overflow-hidden", outOfStock && "grayscale opacity-60")}>
          <ProductImage src={imageUrl} alt={name} size="md" />
        </div>

        {/* Wishlist — top right */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <WishlistButton
            isWishlisted={isWishlisted}
            onClick={handleWishlistClick}
            disabled={isDisabled}
            variant="card"
            size="icon-sm"
            neo={false}
            className="rounded-full"
          />
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <span className="bg-card/85 backdrop-blur-[2px] text-danger font-heading font-bold text-xs px-3 py-1.5 rounded-lg border border-danger/30 select-none">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Name */}
      <p className={cn(
        "font-heading font-bold text-sm leading-tight line-clamp-2 px-1",
        outOfStock ? "text-muted-foreground" : "text-foreground",
      )}>
        {name}
      </p>

      {/* Price + cart */}
      <div className="flex items-center justify-between gap-2 px-1 mt-auto">
        <span className={cn(
          "font-heading font-bold text-base",
          outOfStock ? "text-muted-foreground" : "text-foreground",
        )}>
          {price}
        </span>

        <Button
          type="button"
          variant="card"
          size="icon-sm"
          neo={false}
          disabled={isDisabled}
          onClick={handleAddToCart}
          aria-label={`Tambah ${name} ke keranjang`}
          className="rounded-xl shrink-0 border border-border-strong"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
