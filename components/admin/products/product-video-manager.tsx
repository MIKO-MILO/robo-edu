"use client";

import React, { useRef, useState } from "react";
import type { UUID } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  UploadIcon,
  Trash2Icon,
  VideoIcon,
  AlertCircleIcon,
  PlayIcon,
  PauseIcon,
  FilmIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface VideoItem {
  id: UUID;
  product_id: string;
  video_url: string;
  video_key: string;
  title: string | null;
  sort_order: number;
}

export interface ProductVideoManagerProps {
  productId?: UUID;
  videos: VideoItem[];
  disabled?: boolean;
  onUploadVideo?: (file: File, title?: string) => void | Promise<void>;
  onDeleteVideo?: (videoId: UUID) => void | Promise<void>;
  isUploading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Single video card with inline preview
// ─────────────────────────────────────────────────────────────────────────────

function VideoCard({
  video,
  onDelete,
}: {
  video: VideoItem;
  onDelete: (id: UUID) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(video.id);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-border bg-background transition-transform duration-150 hover:-translate-y-0.5">
        {/* Video container */}
        <div className="relative aspect-video w-full bg-foreground/5 overflow-hidden">
          <video
            ref={videoRef}
            src={video.video_url}
            className="w-full h-full object-cover"
            preload="metadata"
            onEnded={() => setPlaying(false)}
            onClick={togglePlay}
          />

          {/* Play/Pause overlay */}
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={playing ? "Jeda video" : "Putar video"}
          >
            <div className="size-12 rounded-full bg-background/90 border-2 border-border flex items-center justify-center">
              {playing ? (
                <PauseIcon className="size-5 text-foreground" />
              ) : (
                <PlayIcon className="size-5 text-foreground fill-foreground" />
              )}
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-2 flex items-center justify-between gap-2 border-t border-border bg-card">
          <span className="text-xs font-body text-muted-foreground truncate flex-1">
            {video.title || `Video ${video.sort_order + 1}`}
          </span>
          <Button
            type="button"
            variant="danger"
            size="icon-xs"
            neo={false}
            onClick={() => setConfirmOpen(true)}
            title="Hapus Video"
          >
            <Trash2Icon className="size-3" />
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title="Hapus Video?"
        description={`Video "${video.title || `Video ${video.sort_order + 1}`}" akan dihapus permanen.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ProductVideoManager({
  productId,
  videos = [],
  disabled,
  onUploadVideo,
  onDeleteVideo,
  isUploading,
}: ProductVideoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [titleInput, setTitleInput] = useState("");

  const sortedVideos = [...videos].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadVideo) {
      await onUploadVideo(file, titleInput.trim() || undefined);
      setTitleInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <FilmIcon className="size-5 text-primary" />
            <span>Video Produk</span>
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Unggah video demo atau review produk. Format: MP4, WebM, OGG. Maks. 200 MB.
          </p>
        </div>
      </div>

      {/* Disabled notice */}
      {disabled && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-accent-yellow/20 text-[#3D2900]">
          <AlertCircleIcon className="size-5 shrink-0" />
          <p className="font-body text-xs font-semibold">
            Simpan data produk terlebih dahulu sebelum dapat mengunggah video.
          </p>
        </div>
      )}

      {/* Upload area */}
      {!disabled && (
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Title input */}
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Judul video (opsional)"
            disabled={isUploading}
            className="flex-1 h-9 rounded-xl border-2 border-border bg-background px-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogv,.ogg,.mov"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="accent-soft-blue"
            size="sm"
            neo={false}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            {isUploading ? (
              <>
                <Spinner className="size-4" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <UploadIcon className="size-4" />
                <span>Unggah Video</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!disabled && sortedVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <VideoIcon className="size-10 text-muted-foreground mb-2" />
          <p className="font-body text-xs text-muted-foreground">
            Belum ada video produk. Klik "Unggah Video" untuk menambahkan.
          </p>
        </div>
      )}

      {/* Video grid */}
      {!disabled && sortedVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={onDeleteVideo ?? (() => {})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
