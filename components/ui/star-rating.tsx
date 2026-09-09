"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  /** Nilai rating (contoh: 4.8 atau 5.0) */
  rating: number;
  /** Label atau jumlah ulasan (contoh: "1.2k ulasan" atau 120) */
  reviewCount?: string | number;
  /** Tipe tampilan bintang:
   * - "single": 1 bintang tunggal (cocok untuk Product Card Katalog)
   * - "full": 5 bintang visual (cocok untuk Detail Produk & Review List)
   * - "interactive": 5 bintang interaktif yang bisa diklik/hover (cocok untuk Form Review)
   */
  variant?: "single" | "full" | "interactive";
  /** Ukuran ikon bintang */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Override warna bintang aktif */
  starColorClass?: string;
  /** Override warna bintang kosong/inaktif */
  emptyStarColorClass?: string;
  /** Tampilkan teks angka rating (default: true) */
  showScore?: boolean;
  /** Tampilkan teks jumlah ulasan (default: true jika reviewCount terisi) */
  showCount?: boolean;
  /** Callback saat rating diklik (khusus variant="interactive") */
  onRatingChange?: (newRating: number) => void;
  className?: string;
}

const SIZE_MAP = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

const TEXT_SIZE_MAP = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function StarRating({
  rating = 5.0,
  reviewCount,
  variant = "single",
  size = "sm",
  starColorClass = "fill-amber-400 text-amber-400",
  emptyStarColorClass = "fill-muted text-muted-foreground/30",
  showScore = true,
  showCount = true,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizeClass = SIZE_MAP[size];
  const textSizeClass = TEXT_SIZE_MAP[size];
  const currentRating = hoverRating !== null ? hoverRating : rating;

  // Single Star Mode (Katalog / Product Card)
  if (variant === "single") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 text-muted-foreground select-none",
          className
        )}
      >
        <Star className={cn(starSizeClass, starColorClass, "shrink-0")} />
        {showScore && (
          <span className={cn("font-body font-medium", textSizeClass)}>
            {rating.toFixed(1)}
          </span>
        )}
        {showCount && reviewCount !== undefined && (
          <span
            className={cn(
              "font-body font-normal text-muted-foreground/80",
              textSizeClass
            )}
          >
            ({reviewCount})
          </span>
        )}
      </div>
    );
  }

  // Interactive 5-Star Mode (Form Ulasan)
  if (variant === "interactive") {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= currentRating;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              className="cursor-pointer transition-transform hover:scale-110 focus:outline-none p-0.5"
              aria-label={`Beri rating ${starValue} bintang`}
            >
              <Star
                className={cn(
                  starSizeClass,
                  "transition-colors",
                  isFilled ? starColorClass : emptyStarColorClass
                )}
              />
            </button>
          );
        })}
        {showScore && (
          <span
            className={cn(
              "font-body font-bold ml-2 text-foreground",
              textSizeClass
            )}
          >
            {currentRating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  // Full 5-Star Mode (Detail Produk & Daftar Ulasan)
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 select-none",
        className
      )}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercentage = Math.max(
            0,
            Math.min(1, rating - (starIndex - 1))
          );
          return (
            <div key={starIndex} className="relative">
              <Star className={cn(starSizeClass, emptyStarColorClass)} />
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star className={cn(starSizeClass, starColorClass)} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showScore && (
        <span
          className={cn(
            "font-body font-semibold text-foreground",
            textSizeClass
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}

      {showCount && reviewCount !== undefined && (
        <span className={cn("font-body text-muted-foreground", textSizeClass)}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
