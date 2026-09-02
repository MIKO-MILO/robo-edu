"use client";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { StarRating } from "@/components/ui/star-rating";
import { WishlistButton } from "@/components/ui/wishlist-button";

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  rating?: number;
  reviewCount?: string;
  imageUrl: string;
  bgColorClass?: string;
  isWishlisted?: boolean;
  onDetailClick?: () => void;
  onWishlistClick?: () => void;
}

export function ProductCard({
  name,
  price,
  rating = 5.0,
  reviewCount = "1.2k ulasan",
  imageUrl,
  bgColorClass = "bg-accent-pink",
  isWishlisted,
  onDetailClick,
  onWishlistClick,
}: ProductCardProps) {
  return (
    <div
      className={`${bgColorClass} rounded-3xl p-4 flex flex-col gap-4 border-2 border-foreground`}
    >
      {/* Container Gambar (Reusable Component) */}
      <ProductImage src={imageUrl} alt={name} size="md" />

      {/* Informasi Produk */}
      <div className="flex flex-col gap-2">
        <h3 className="font-heading font-bold text-base text-foreground leading-tight line-clamp-2">
          {name}
        </h3>

        <div className="flex justify-between items-center">
          {/* Star Rating (Reusable Component) */}
          <StarRating
            rating={rating}
            reviewCount={reviewCount}
            variant="single"
            size="sm"
          />

          <span className="font-heading font-bold text-base text-foreground">
            {price}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-auto pt-2">
        <Button onClick={onDetailClick} variant="card" size="sm">
          Product Detail
        </Button>

        <WishlistButton
          isWishlisted={isWishlisted}
          onClick={onWishlistClick}
          variant="card"
          size="icon-sm"
        />
      </div>
    </div>
  );
}