"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface ProductImageProps extends Omit<ImageProps, "src" | "alt"> {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  fallbackSrc?: string;
  className?: string;
  imageClassName?: string;
}

const SIZE_MAP = {
  xs: "w-12 h-12",
  sm: "w-16 h-16",
  md: "w-full aspect-square",
  lg: "w-full max-w-md aspect-square",
  xl: "w-full max-w-lg aspect-square",
  full: "w-full h-full",
};

const ASPECT_MAP = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

/**
 * URL sumber yang diketahui tidak bisa dirender sebagai gambar statis —
 * langsung skip ke fallback tanpa mencoba load.
 */
function isUnrenderableUrl(url: string): boolean {
  return (
    url.includes("coresg-normal.trae.ai") ||
    url.includes("text_to_image") ||
    url.includes("image_is_generating")
  );
}

/**
 * URL yang tidak perlu dioptimasi oleh Next.js Image Optimizer.
 */
function shouldSkipOptimization(url: string): boolean {
  return (
    url.startsWith("/api/images/") ||
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.includes("placehold.co")
  );
}

/**
 * Generate URL placeholder dari placehold.co dengan label nama produk.
 * Format: https://placehold.co/400x400/e8f4fd/2483d0?text=Nama+Produk
 */
function makePlaceholderUrl(label: string): string {
  const text = encodeURIComponent(
    label.length > 20 ? label.slice(0, 20) + "…" : label,
  );
  return `https://placehold.co/400x400/e8f4fd/2483d0?text=${text}`;
}

export function ProductImage({
  src,
  alt,
  size = "full",
  aspectRatio = "square",
  fallbackSrc,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  ...props
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false);

  // Reset error state kalau src berubah
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setImgError(false);
  }

  // Tentukan URL yang akan dirender
  const resolvedFallback = fallbackSrc ?? makePlaceholderUrl(alt);

  const shouldUseFallback =
    !src ||
    imgError ||
    isUnrenderableUrl(src);

  const imgSrc = shouldUseFallback ? resolvedFallback : src;

  const containerSizeClass = size !== "full" ? SIZE_MAP[size] : "";
  const aspectClass = aspectRatio !== "auto" ? ASPECT_MAP[aspectRatio] : "";

  return (
    <div
      className={cn(
        "bg-card rounded-2xl overflow-hidden border border-foreground relative flex items-center justify-center shrink-0 select-none",
        containerSizeClass,
        aspectClass,
        className,
      )}
    >
      <Image
        key={imgSrc}
        src={imgSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={shouldSkipOptimization(imgSrc)}
        onError={() => setImgError(true)}
        className={cn(
          "object-cover w-full h-full transition-opacity duration-200",
          imageClassName,
        )}
        {...props}
      />
    </div>
  );
}
