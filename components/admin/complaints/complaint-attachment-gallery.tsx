"use client";

import * as React from "react";
import { Images, Play, FileQuestion, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminComplaintAttachment } from "./complaint-list-types";

export interface ComplaintAttachmentGalleryProps {
  attachments: AdminComplaintAttachment[];
}

/**
 * Derive media_type from file_type MIME string.
 * Exported so mock data can reuse the same logic.
 */
export function deriveMediaType(
  fileType: string | null
): "PHOTO" | "VIDEO" | "OTHER" {
  if (!fileType) return "OTHER";
  if (fileType.startsWith("image/")) return "PHOTO";
  if (fileType.startsWith("video/")) return "VIDEO";
  return "OTHER";
}

interface LightboxProps {
  attachment: AdminComplaintAttachment;
  onClose: () => void;
}

/** Atom — fullscreen lightbox for photo/video preview. */
function AttachmentLightbox({ attachment, onClose }: LightboxProps) {
  const isPhoto = attachment.media_type === "PHOTO";
  const isVideo = attachment.media_type === "VIDEO";

  // Close on Escape key
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
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
          aria-label="Tutup preview"
        >
          <X className="size-6" />
        </button>

        {/* Media */}
        {isPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="max-h-[80vh] w-auto object-contain rounded-2xl"
          />
        )}
        {isVideo && (
          <video
            src={attachment.file_url}
            controls
            autoPlay
            className="max-h-[80vh] w-full rounded-2xl"
          />
        )}
        {!isPhoto && !isVideo && (
          <div className="bg-card rounded-2xl p-8 text-center">
            <FileQuestion className="size-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">{attachment.file_name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Format tidak didukung untuk preview
            </p>
          </div>
        )}

        {/* File name */}
        <p className="mt-3 text-white/70 text-xs truncate max-w-full">
          {attachment.file_name}
        </p>
      </div>
    </div>
  );
}

interface AttachmentThumbnailProps {
  attachment: AdminComplaintAttachment;
  onClick: () => void;
}

/** Atom — thumbnail card for one attachment. */
function AttachmentThumbnail({ attachment, onClick }: AttachmentThumbnailProps) {
  const isPhoto = attachment.media_type === "PHOTO";
  const isVideo = attachment.media_type === "VIDEO";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border-2 border-border bg-muted/40",
        "hover:border-primary hover:shadow-sm transition-all duration-150 cursor-pointer",
        "aspect-square"
      )}
      title={attachment.file_name}
    >
      {isPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      )}

      {isVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 gap-1">
          <div className="size-10 rounded-full bg-card/80 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-100 transition-colors">
            <Play className="size-5 ml-0.5" />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground px-2 text-center truncate w-full">
            Video
          </span>
        </div>
      )}

      {!isPhoto && !isVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 gap-1">
          <FileQuestion className="size-8 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground px-2 text-center truncate w-full">
            File
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

      {/* File name tooltip at bottom */}
      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-[10px] font-medium truncate">{attachment.file_name}</p>
      </div>
    </button>
  );
}

/**
 * Organism — galeri lampiran klaim.
 * Membedakan PHOTO (gambar) dan VIDEO (player), bisa diklik untuk lightbox.
 */
export function ComplaintAttachmentGallery({
  attachments,
}: ComplaintAttachmentGalleryProps) {
  const [lightboxItem, setLightboxItem] =
    React.useState<AdminComplaintAttachment | null>(null);

  if (attachments.length === 0) {
    return (
      <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
          <Images className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-base text-foreground">
            Lampiran
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
          <Images className="size-8 stroke-[1.5]" />
          <p className="text-xs font-medium">Tidak ada lampiran pada klaim ini.</p>
        </div>
      </div>
    );
  }

  const photoCount = attachments.filter((a) => a.media_type === "PHOTO").length;
  const videoCount = attachments.filter((a) => a.media_type === "VIDEO").length;

  return (
    <>
      <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-3">
          <div className="flex items-center gap-2">
            <Images className="size-4 text-primary" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Lampiran
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            {photoCount > 0 && <span>{photoCount} Foto</span>}
            {photoCount > 0 && videoCount > 0 && <span>·</span>}
            {videoCount > 0 && <span>{videoCount} Video</span>}
          </div>
        </div>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {attachments.map((att) => (
            <AttachmentThumbnail
              key={att.id}
              attachment={att}
              onClick={() => setLightboxItem(att)}
            />
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Klik thumbnail untuk membuka preview penuh.
        </p>
      </div>

      {/* Lightbox */}
      {lightboxItem && (
        <AttachmentLightbox
          attachment={lightboxItem}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </>
  );
}
