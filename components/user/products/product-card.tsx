"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  id?: string;
  name: string;
  price: string;
  rating?: number;
  reviewCount?: string;
  imageUrl: string;
  bgColorClass?: string;
  onDetailClick?: () => void;
  onWishlistClick?: () => void;
}

export function ProductCard({
  name,
  price,
  rating = 5.0,
  reviewCount = "1.2k reviews",
  imageUrl,
  bgColorClass = "bg-accent-pink",
  onDetailClick,
  onWishlistClick,
}: ProductCardProps) {
  return (
    <div
      className={`${bgColorClass} rounded-3xl p-4 flex flex-col gap-4 border-2 border-foreground shadow-[4px_4px_0px_0px_#3D2900]`}
    >
      {/* Container Gambar */}
      <div className="bg-card rounded-2xl aspect-square overflow-hidden border border-foreground relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Informasi Produk */}
      <div className="flex flex-col gap-2">
        <h3 className="font-heading font-bold text-base text-foreground leading-tight line-clamp-2">
          {name}
        </h3>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-body text-xs font-medium">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
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


        <Button
          onClick={onWishlistClick}
          aria-label="Add to wishlist"
          variant="card"
          size="icon-sm"
          className="text-danger"
        >
          <Heart className="w-4 h-4 fill-danger text-danger" />
        </Button>
      </div>
    </div>
  );
}