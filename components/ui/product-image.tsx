"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export interface ProductImageProps
  extends Omit<ImageProps, "src" | "alt"> {
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

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80";

export function ProductImage({
  src,
  alt,
  size = "full",
  aspectRatio = "square",
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  ...props
}: ProductImageProps) {
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src);
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(!src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setImgSrc(src || fallbackSrc);
    setHasError(!src);
  }

  const containerSizeClass = size !== "full" ? SIZE_MAP[size] : "";
  const aspectClass = aspectRatio !== "auto" ? ASPECT_MAP[aspectRatio] : "";

  return (
    <div
      className={cn(
        "bg-card rounded-2xl overflow-hidden border border-foreground relative flex items-center justify-center shrink-0 select-none",
        containerSizeClass,
        aspectClass,
        className
      )}
    >
      {hasError || !imgSrc ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-accent-soft-blue text-foreground/70 p-2 text-center">
          <span className="text-2xl mb-1">🤖</span>
          <span className="font-body text-xs font-semibold line-clamp-1">
            {alt}
          </span>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => {
            if (imgSrc !== fallbackSrc) {
              setImgSrc(fallbackSrc);
            } else {
              setHasError(true);
            }
          }}
          className={cn(
            "object-cover w-full h-full transition-opacity duration-200",
            imageClassName
          )}
          {...props}
        />
      )}
    </div>
  );
}
