"use client";

import * as React from "react";
import { Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewImage {
  id: string;
  url: string;
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  image: ReviewImage;
  onClose: () => void;
}

function ReviewImageLightbox({ image, onClose }: LightboxProps) {
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Tutup preview"
        >
          <X className="size-6" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt="Foto review"
          className="max-h-[80vh] w-auto object-contain rounded-2xl"
        />
      </div>
    </div>
  );
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────

interface ThumbnailProps {
  image: ReviewImage;
  index: number;
  onClick: () => void;
}

function ReviewImageThumbnail({ image, index, onClick }: ThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 border-border bg-muted/40",
        "hover:border-primary hover:shadow-sm transition-all duration-150 cursor-pointer",
        "aspect-square",
      )}
      title={`Foto ${index + 1}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Foto review ${index + 1}`}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </button>
  );
}

// ── Gallery (exported) ────────────────────────────────────────────────────────

export interface ReviewImageGalleryProps {
  images: ReviewImage[];
}

/**
 * Galeri foto review. Hanya muncul jika review memiliki gambar.
 * Setiap thumbnail bisa diklik untuk membuka lightbox.
 */
export function ReviewImageGallery({ images }: ReviewImageGalleryProps) {
  const [lightboxImage, setLightboxImage] = React.useState<ReviewImage | null>(
    null,
  );

  if (images.length === 0) return null;

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Images className="size-4 text-primary" />
            <h2 className="text-sm font-heading font-bold text-foreground">
              Foto Review
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {images.length} {images.length === 1 ? "foto" : "foto"}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <ReviewImageThumbnail
              key={img.id}
              image={img}
              index={i}
              onClick={() => setLightboxImage(img)}
            />
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Klik thumbnail untuk membuka preview penuh.
        </p>
      </div>

      {lightboxImage && (
        <ReviewImageLightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
