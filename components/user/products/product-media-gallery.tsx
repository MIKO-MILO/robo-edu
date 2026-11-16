"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaImageItem {
  src: string;
  alt: string;
}

export interface MediaVideoItem {
  id: string;
  url: string;
  title: string | null;
  sort_order: number;
}

export interface ProductMediaGalleryProps {
  images?: MediaImageItem[];
  videos?: MediaVideoItem[];
  productName: string;
  className?: string;
}

type MediaItem =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; url: string; title: string };

export function ProductMediaGallery({
  images = [],
  videos = [],
  productName,
  className,
}: ProductMediaGalleryProps) {
  const mediaList: MediaItem[] = useMemo(() => {
    let baseImages: MediaItem[] = images.map((img) => ({
      type: "image",
      src: img.src,
      alt: img.alt || productName,
    }));

    if (baseImages.length === 0) {
      baseImages = [
        { type: "image", src: "/images/placeholder-product.jpg", alt: productName },
      ];
    }
    if (baseImages.length === 1) {
      baseImages = [baseImages[0], baseImages[0], baseImages[0]];
    } else if (baseImages.length === 2) {
      baseImages = [baseImages[0], baseImages[1], baseImages[0]];
    }

    const vidItems: MediaItem[] = videos.map((vid, idx) => ({
      type: "video",
      url: vid.url,
      title: vid.title ?? `Video ${productName} ${idx + 1}`,
    }));

    return [...baseImages, ...vidItems];
  }, [images, videos, productName]);

  const [activeIndex, setActiveIndex] = useState(0);
  const totalMedia = mediaList.length;

  const safeActiveIndex = Math.min(activeIndex, totalMedia - 1);
  const currentMedia = mediaList[safeActiveIndex] ?? mediaList[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalMedia);
  };

  const visibleThumbnails = useMemo(() => {
    if (totalMedia <= 3) {
      return mediaList.map((item, idx) => ({ item, originalIndex: idx }));
    }
    const startWindow = Math.min(
      Math.max(0, Math.floor(safeActiveIndex / 3) * 3),
      totalMedia - 3
    );
    return mediaList
      .slice(startWindow, startWindow + 3)
      .map((item, idx) => ({ item, originalIndex: startWindow + idx }));
  }, [mediaList, safeActiveIndex, totalMedia]);

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)}>
      {/* Gambar Utama Besar Tanpa Kotak Putih */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-transparent">
        {currentMedia.type === "video" ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            controls
            autoPlay
            className="w-full h-full object-contain bg-foreground/95 rounded-2xl"
            aria-label={currentMedia.title}
          >
            Browser kamu tidak mendukung tag video.
          </video>
        ) : (
          <ProductImage
            src={currentMedia.src}
            alt={currentMedia.alt}
            size="full"
            aspectRatio="square"
            className="w-full h-full bg-transparent border-0 rounded-2xl shadow-none"
            imageClassName="object-contain"
            sizes="(max-width: 1024px) 90vw, 45vw"
            priority
          />
        )}
      </div>

      {/* Thumbnail Strip dengan Panah & Outline Biru Tua (ring-primary) */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          neo={false}
          onClick={handlePrev}
          aria-label="Media sebelumnya"
          className="text-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5px]" />
        </Button>

        <div className="flex items-center gap-3 sm:gap-4">
          {visibleThumbnails.map(({ item, originalIndex }) => {
            const isSelected = originalIndex === safeActiveIndex;

            return (
              <button
                key={`thumb-${item.type}-${originalIndex}`}
                type="button"
                onClick={() => setActiveIndex(originalIndex)}
                aria-label={`Tampilkan media ${originalIndex + 1}`}
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer flex items-center justify-center bg-card",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-75 hover:opacity-100 border border-transparent"
                )}
              >
                {item.type === "image" ? (
                  <ProductImage
                    src={item.src}
                    alt={item.alt}
                    size="full"
                    aspectRatio="square"
                    className="w-full h-full bg-transparent border-0 rounded-xl"
                    imageClassName="object-cover"
                    sizes="80px"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
                    <PlayCircle
                      className={cn(
                        "w-6 h-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          neo={false}
          onClick={handleNext}
          aria-label="Media selanjutnya"
          className="text-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
        >
          <ArrowRight className="w-6 h-6 stroke-[2.5px]" />
        </Button>
      </div>
    </div>
  );
}