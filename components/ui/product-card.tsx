"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { WishlistButton } from "@/components/ui/wishlist-button";
import { StarRating } from "@/components/ui/star-rating";
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

export function ProductCard({
  slug,
  name,
  price,
  rating = 5.0,
  imageUrl,
  bgColorClass = "bg-accent-blue/40",
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
        "bg-card",
        "rounded-2xl p-3 flex flex-col gap-3",
        !outOfStock && slug && "cursor-pointer",
        outOfStock && "opacity-75",
      )}
    >
      {/* Kotak Gambar dengan background pastel bersih tanpa outline */}
      <div
        className={cn(
          bgColorClass,
          "rounded-xl p-4 relative overflow-hidden",
          outOfStock && "grayscale opacity-60",
        )}
      >
        <div className="rounded-lg overflow-hidden">
          <ProductImage src={imageUrl} alt={name} size="md" />
        </div>

        {/* Wishlist — kanan atas */}
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <WishlistButton
            isWishlisted={isWishlisted}
            onClick={handleWishlistClick}
            disabled={isDisabled}
            variant="card"
            size="icon-sm"
            neo={false}
            className="w-11 h-11 p-0 rounded-full flex items-center justify-center cursor-pointer [&_svg]:!w-5 [&_svg]:!h-5"
          />
        </div>

        {/* Cart — kanan bawah (sejajar di bawah Wishlist) */}
        <div className="absolute bottom-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="default"
            size="icon-sm"
            neo={false}
            disabled={isDisabled}
            onClick={handleAddToCart}
            aria-label={`Tambah ${name} ke keranjang`}
            className="w-11 h-11 p-0 rounded-full shrink-0 bg-primary-600 hover:bg-primary-700 text-card border-0 flex items-center justify-center cursor-pointer shadow-sm [&_svg]:!w-5 [&_svg]:!h-5"
          >
            <ShoppingCart className="w-5 h-5 text-card" />
          </Button>
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-card/85 backdrop-blur-[2px]">
            <span className="text-danger font-heading font-bold text-xs px-3 py-1.5 rounded-lg border border-danger/30 select-none">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Informasi Produk (Judul & Rating Badge) */}
      <div className="flex flex-col gap-1.5 px-1">
        <p
          className={cn(
            "font-heading font-bold text-sm leading-tight line-clamp-2",
            outOfStock ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {name}
        </p>

        <StarRating
          rating={rating}
          variant="badge"
          size="xs"
        />
      </div>

      {/* Price */}
      <div className="flex items-center justify-between gap-2 px-1 mt-auto">
        <span
          className={cn(
            "font-heading font-bold text-base",
            outOfStock ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {price}
        </span>
      </div>
    </div>
  );
}