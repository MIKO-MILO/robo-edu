"use client";

import React, { useRef } from "react";
import Image from "next/image";
import type { ProductImage, UUID } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  UploadIcon,
  Trash2Icon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ImageIcon,
  AlertCircleIcon,
} from "lucide-react";

export type ImageItem = Pick<
  ProductImage,
  "id" | "image_url" | "is_primary" | "sort_order"
> & { alt_text?: string | null };

export interface ProductImageManagerProps {
  productId?: UUID;
  images: ImageItem[];
  disabled?: boolean;
  onUploadImage?: (file: File) => void | Promise<void>;
  onDeleteImage?: (imageId: UUID) => void | Promise<void>;
  onReorderImage?: (
    imageId: UUID,
    body: { sort_order?: number; is_primary?: boolean }
  ) => void | Promise<void>;
  isUploading?: boolean;
}

export function ProductImageManager({
  productId,
  images = [],
  disabled,
  onUploadImage,
  onDeleteImage,
  onReorderImage,
  isUploading,
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadImage) {
      await onUploadImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetPrimary = (imageId: UUID) => {
    if (onReorderImage) {
      onReorderImage(imageId, { is_primary: true });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0 || !onReorderImage) return;
    const currentImg = images[index];
    const prevImg = images[index - 1];

    onReorderImage(currentImg.id, { sort_order: prevImg.sort_order ?? index - 1 });
    onReorderImage(prevImg.id, { sort_order: currentImg.sort_order ?? index });
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1 || !onReorderImage) return;
    const currentImg = images[index];
    const nextImg = images[index + 1];

    onReorderImage(currentImg.id, { sort_order: nextImg.sort_order ?? index + 1 });
    onReorderImage(nextImg.id, { sort_order: currentImg.sort_order ?? index });
  };

  // Sort images by sort_order
  const sortedImages = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <div className="space-y-4 rounded-2xl border-2 border-[#3D2900] bg-card p-6 neo-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            <span>Galeri Foto Produk</span>
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Unggah foto produk multi-angle. Foto dengan label "Utama" akan menjadi thumbnail katalog.
          </p>
        </div>

        {!disabled && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="accent-yellow"
              size="sm"
              neo
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="size-4" />
                  <span>Unggah Gambar</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Disabled Notice */}
      {disabled && (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#3D2900] bg-accent-yellow/20 text-[#3D2900]">
          <AlertCircleIcon className="size-5 shrink-0" />
          <p className="font-body text-xs font-semibold">
            Simpan data produk terlebih dahulu sebelum dapat mengunggah gambar.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!disabled && sortedImages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
          <ImageIcon className="size-10 text-muted-foreground mb-2" />
          <p className="font-body text-xs text-muted-foreground">
            Belum ada foto produk yang diunggah. Klik tombol "Unggah Gambar" di atas untuk menambahkan foto.
          </p>
        </div>
      )}

      {/* Images Grid */}
      {!disabled && sortedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedImages.map((img, idx) => (
            <div
              key={img.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-[#3D2900] bg-background neo-shadow transition-transform duration-150 hover:-translate-y-0.5"
            >
              {/* Image Container */}
              <div className="relative aspect-square w-full bg-muted">
                <Image
                  src={img.image_url}
                  alt={img.alt_text || "Gambar Produk"}
                  fill
                  className="object-cover"
                />

                {/* Primary Badge */}
                {img.is_primary && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full border-2 border-[#3D2900] bg-accent-yellow px-2 py-0.5 text-[10px] font-bold text-[#3D2900] shadow-[1px_1px_0px_#3D2900]">
                    <StarIcon className="size-3 fill-[#3D2900]" />
                    <span>Utama</span>
                  </span>
                )}
              </div>

              {/* Action Controls */}
              <div className="p-2 space-y-2 border-t-2 border-[#3D2900] bg-card">
                <div className="flex items-center justify-between gap-1">
                  {/* Move Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      title="Geser Kiri/Naik"
                    >
                      <ArrowUpIcon className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={idx === sortedImages.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      title="Geser Kanan/Turun"
                    >
                      <ArrowDownIcon className="size-3" />
                    </Button>
                  </div>

                  {/* Delete Button */}
                  {onDeleteImage && (
                    <Button
                      type="button"
                      variant="danger"
                      size="icon-xs"
                      neo
                      onClick={() => onDeleteImage(img.id)}
                      title="Hapus Gambar"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  )}
                </div>

                {/* Set Primary Button */}
                {!img.is_primary && onReorderImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="w-full text-[10px] h-6 py-0"
                    onClick={() => handleSetPrimary(img.id)}
                  >
                    Jadikan Utama
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
