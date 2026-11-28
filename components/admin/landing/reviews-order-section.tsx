"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { GripVertical, MessageSquare, ExternalLink, Loader2, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useLandingFeaturedReviews,
  useReorderFeaturedReviews,
  type FeaturedReviewEntry,
} from "@/hooks/admin/landing-config/use-landing-featured";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-2.5",
            i < rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────
function PanelSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
      <div className="h-5 bg-muted rounded w-1/3" />
      <div className="h-3.5 bg-muted rounded w-2/3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-14 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag & Drop List
// ─────────────────────────────────────────────────────────────────────────────
interface DragListProps {
  items: FeaturedReviewEntry[];
  onReorder: (reordered: FeaturedReviewEntry[]) => void;
}

function DraggableReviewList({ items, onReorder }: DragListProps) {
  const dragItem     = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx]         = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
    setOverIdx(idx);
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) {
      setDraggingIdx(null);
      setOverIdx(null);
      return;
    }
    if (dragItem.current === dragOverItem.current) {
      setDraggingIdx(null);
      setOverIdx(null);
      return;
    }

    const reordered = [...items];
    const dragged   = reordered.splice(dragItem.current, 1)[0];
    reordered.splice(dragOverItem.current, 0, dragged);

    dragItem.current     = null;
    dragOverItem.current = null;
    setDraggingIdx(null);
    setOverIdx(null);
    onReorder(reordered);
  };

  return (
    <ul className="space-y-2" aria-label="Urutan review di landing page">
      {items.map((entry, idx) => (
        <li
          key={entry.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragEnter={() => handleDragEnter(idx)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 bg-card px-3 py-2.5 transition-all duration-100 cursor-grab active:cursor-grabbing select-none",
            draggingIdx === idx
              ? "opacity-40 border-primary/40 shadow-none"
              : overIdx === idx && draggingIdx !== idx
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-border/80 hover:bg-muted/30 shadow-xs",
          )}
        >
          {/* Drag handle */}
          <GripVertical className="size-4 text-muted-foreground/60 shrink-0" aria-hidden="true" />

          {/* Position badge */}
          <span className="w-5 text-center text-xs font-heading font-bold text-muted-foreground shrink-0">
            {idx + 1}
          </span>

          {/* Review icon */}
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <MessageSquare className="size-3.5" aria-hidden="true" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-heading font-bold text-foreground truncate">
                {entry.review.user_name}
              </p>
              <StarRow rating={entry.review.rating} />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {entry.review.comment
                ? entry.review.comment.slice(0, 80) + (entry.review.comment.length > 80 ? "…" : "")
                : "(tidak ada komentar)"}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "shrink-0 text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-lg border",
              entry.review.status === "PUBLISHED"
                ? "bg-success-bg text-success border-success/30"
                : "bg-muted text-muted-foreground border-border",
            )}
          >
            {entry.review.status === "PUBLISHED" ? "Tampil" : entry.review.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main section
// ─────────────────────────────────────────────────────────────────────────────
export function ReviewsOrderSection() {
  const { data: entries, isLoading, isError, error, refetch } = useLandingFeaturedReviews();
  const reorderMutation = useReorderFeaturedReviews();

  // Local order state for optimistic DnD
  const [localItems, setLocalItems] = useState<FeaturedReviewEntry[] | null>(null);

  const serverItems  = entries ?? [];
  const displayItems = localItems ?? serverItems;

  const handleReorder = useCallback(
    (reordered: FeaturedReviewEntry[]) => {
      setLocalItems(reordered);
      const payload = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }));
      reorderMutation.mutate(payload, {
        onSettled: () => setLocalItems(null),
      });
    },
    [reorderMutation],
  );

  if (isLoading) return <PanelSkeleton />;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Urutan Review di Landing Page
            </h3>
            <p className="text-xs text-muted-foreground">
              Seret baris untuk mengubah urutan. Untuk menambah/hapus review, pergi ke halaman{" "}
              <Link
                href="/admin/reviews"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Moderasi Ulasan
              </Link>
              .
            </p>
          </div>

          {/* Counter */}
          <div className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-heading font-bold text-foreground">
            <MessageSquare className="size-3.5 text-amber-500" />
            <span>{displayItems.length}</span>
          </div>
        </div>

        {/* Error banner */}
        {isError && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-xs text-danger">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error instanceof Error ? error.message : "Gagal memuat data."}</span>
            <Button variant="outline" size="xs" onClick={() => void refetch()} className="ml-auto">
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Saving indicator */}
        {reorderMutation.isPending && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Menyimpan urutan…</span>
          </div>
        )}

        {/* Empty state */}
        {displayItems.length === 0 && !isError && (
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 py-10 text-center gap-3">
            <div className="p-3 rounded-full bg-muted border border-border">
              <MessageSquare className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-heading font-bold text-foreground">Belum Ada Review Featured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Aktifkan toggle "Featured" di{" "}
                <Link
                  href="/admin/reviews"
                  className="text-primary underline underline-offset-2 hover:text-primary/80 inline-flex items-center gap-0.5"
                >
                  Moderasi Ulasan
                  <ExternalLink className="size-2.5" />
                </Link>{" "}
                untuk menambahkan review ke sini.
              </p>
            </div>
          </div>
        )}

        {/* List */}
        {displayItems.length > 0 && (
          <div className="mt-5">
            <DraggableReviewList items={displayItems} onReorder={handleReorder} />
          </div>
        )}
      </div>

      {/* Footer info */}
      {displayItems.length > 0 && (
        <div className="px-6 py-3 bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
          <GripVertical className="size-3.5 shrink-0" />
          <span>Seret baris untuk mengubah urutan. Perubahan disimpan otomatis.</span>
        </div>
      )}
    </div>
  );
}
