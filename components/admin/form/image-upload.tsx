"use client";

import * as React from "react";
import { Upload, X, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AdminImageUploadProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onUpload?: (file: File) => Promise<string>;
  label?: string;
  helperText?: string;
  error?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  acceptTypes?: string[];
  containerClassName?: string;
  disabled?: boolean;
}

export function AdminImageUpload({
  value,
  onChange,
  onUpload,
  label = "Upload Gambar Produk / Category",
  helperText = "Format: JPG, PNG, WEBP. Maksimal 5MB.",
  error,
  multiple = false,
  maxSizeMB = 5,
  acceptTypes = ["image/jpeg", "image/png", "image/webp"],
  containerClassName,
  disabled = false,
}: AdminImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Normalize image list
  const imageList: string[] = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const handleUploadFile = async (file: File) => {
    if (!acceptTypes.includes(file.type)) {
      setUploadError("Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Ukuran file melebihi batas ${maxSizeMB}MB.`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      let uploadedUrl = "";
      if (onUpload) {
        uploadedUrl = await onUpload(file);
      } else {
        // Default MinIO API fallback upload handling via FormData
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload/minio", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Gagal mengunggah gambar ke server MinIO.");
        }

        const data = await res.json();
        uploadedUrl = data.url || data.fileUrl;
      }

      if (multiple) {
        const newImages = [...imageList, uploadedUrl];
        onChange?.(newImages);
      } else {
        onChange?.(uploadedUrl);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah.";
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => handleUploadFile(file));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => handleUploadFile(file));
    }
  };

  const handleRemove = (urlToRemove: string) => {
    if (multiple) {
      const updated = imageList.filter((url) => url !== urlToRemove);
      onChange?.(updated);
    } else {
      onChange?.("");
    }
  };

  const effectiveError = error || uploadError;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && (
        <label className="text-xs font-semibold text-foreground font-body flex items-center justify-between">
          <span>{label}</span>
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes.join(",")}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {/* Image Preview List if images present */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
          {imageList.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-square rounded-2xl border-2 border-border overflow-hidden bg-card neo-shadow"
            >
              {/* eslint-disable-next-next-img-element */}
              <img
                src={url}
                alt={`Preview ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  aria-label="Hapus gambar"
                  className="absolute top-2 right-2 bg-danger text-white p-1 rounded-full shadow-md hover:bg-danger/90 transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      {(!imageList.length || multiple) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-150 bg-card/60 text-center font-body",
            isDragging
              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
              : "border-border hover:border-primary/70 hover:bg-card",
            disabled && "cursor-not-allowed opacity-50 hover:border-border hover:bg-card/60",
            effectiveError && "border-danger bg-danger/5"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-3 text-primary font-medium text-xs">
              <Loader2 className="size-8 animate-spin" />
              <span>Mengunggah gambar ke MinIO...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-primary-100 text-primary neo-shadow">
                <Upload className="size-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-primary underline">Klik untuk pilih</span> atau drag & drop gambar
                </p>
                <p className="text-xs text-muted-foreground">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {effectiveError && (
        <p className="text-xs font-medium text-danger font-body mt-1">
          {effectiveError}
        </p>
      )}
    </div>
  );
}
