"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Star, CheckCircle2, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReviewableItem {
  /** order_item.id — dipakai sebagai body POST /api/reviews */
  order_item_id: string;
  product_name: string;
  variant_name: string | null;
  /** sudah pernah direview sebelumnya */
  already_reviewed: boolean;
}

export interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  /** Daftar item yang bisa direview. Kalau kosong / tidak dikirim, modal akan fetch sendiri. */
  items?: ReviewableItem[];
  /** orderId — dipakai untuk fetch items kalau `items` tidak dikirim */
  orderId?: string;
  onSubmitSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "Sangat Memuaskan ⭐⭐⭐⭐⭐",
  4: "Bagus & Berfungsi Baik ⭐⭐⭐⭐",
  3: "Cukup Baik ⭐⭐⭐",
  2: "Kurang Memuaskan ⭐⭐",
  1: "Mengecewakan ⭐",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OrderReviewModal({
  isOpen,
  onClose,
  orderNumber,
  items: itemsProp,
  orderId,
  onSubmitSuccess,
}: OrderReviewModalProps) {
  // ── Item list state ────────────────────────────────────────────────────
  const [items, setItems] = useState<ReviewableItem[]>(itemsProp ?? []);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Reset when modal closes ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setRating(5);
      setComment("");
      setSubmitError(null);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // ── Load items from API if not passed as prop ─────────────────────────
  useEffect(() => {
    if (!isOpen || !orderId || (itemsProp && itemsProp.length > 0)) return;
    setItemsLoading(true);
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const d = json.data;
        const mapped: ReviewableItem[] = (d.order_items ?? []).map(
          (item: {
            id: string;
            product_name_snapshot: string;
            variant_name_snapshot: string | null;
          }) => ({
            order_item_id: item.id,
            product_name: item.product_name_snapshot,
            variant_name: item.variant_name_snapshot ?? null,
            already_reviewed: false, // will be enriched below
          }),
        );
        setItems(mapped);
        // Auto-select kalau hanya 1 item
        if (mapped.length === 1) setSelectedItem(mapped[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setItemsLoading(false));
  }, [isOpen, orderId, itemsProp]);

  // Sync when itemsProp changes
  useEffect(() => {
    if (itemsProp && itemsProp.length > 0) {
      setItems(itemsProp);
      const reviewable = itemsProp.filter((i) => !i.already_reviewed);
      if (reviewable.length === 1) setSelectedItem(reviewable[0] ?? null);
    }
  }, [itemsProp]);

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_item_id: selectedItem.order_item_id,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.message ?? "Gagal mengirim ulasan.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSubmitSuccess?.();
        onClose();
      }, 1800);
    } catch {
      setSubmitError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const reviewableItems = items.filter((i) => !i.already_reviewed);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-2 border-foreground bg-card p-6 sm:p-7 rounded-3xl neo-shadow">
        <DialogHeader className="border-b-2 border-foreground pb-4 text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-yellow border-2 border-foreground neo-shadow-icon">
              <Star className="w-5 h-5 text-foreground fill-amber-400" />
            </div>
            <div>
              <DialogTitle className="font-heading font-bold text-xl text-foreground">
                Beri Ulasan Produk
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-muted-foreground">
                No. Order: <span className="font-bold text-foreground">{orderNumber}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Loading items ─────────────────────────────────────── */}
        {itemsLoading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-body text-muted-foreground">Memuat produk...</p>
          </div>
        )}

        {/* ── Sukses ───────────────────────────────────────────── */}
        {!itemsLoading && isSuccess && (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent-green border-2 border-foreground flex items-center justify-center neo-shadow animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-foreground" />
            </div>
            <h4 className="font-heading font-bold text-lg text-foreground">
              Terima Kasih atas Ulasanmu!
            </h4>
            <p className="font-body text-xs text-muted-foreground max-w-xs">
              Ulasanmu sangat berharga bagi kami dan komunitas perakit robot lainnya.
            </p>
          </div>
        )}

        {/* ── Pilih produk (multi-item) ─────────────────────────── */}
        {!itemsLoading && !isSuccess && !selectedItem && reviewableItems.length > 1 && (
          <div className="flex flex-col gap-3 py-2">
            <p className="font-body text-sm font-bold text-foreground">
              Pilih produk yang ingin diulas:
            </p>
            {reviewableItems.map((item) => (
              <button
                key={item.order_item_id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 border-foreground hover:border-primary hover:bg-primary/5 transition-all text-left neo-shadow-icon cursor-pointer"
              >
                <div>
                  <p className="font-heading font-bold text-sm text-foreground line-clamp-1">
                    {item.product_name}
                  </p>
                  {item.variant_name && (
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {item.variant_name}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}

            {/* Already reviewed items */}
            {items.some((i) => i.already_reviewed) && (
              <p className="text-xs text-muted-foreground font-body text-center mt-1">
                {items.filter((i) => i.already_reviewed).length} produk sudah pernah direview.
              </p>
            )}
          </div>
        )}

        {/* ── Semua sudah direview ──────────────────────────────── */}
        {!itemsLoading && !isSuccess && reviewableItems.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="font-heading font-bold text-base text-foreground">
              Semua produk sudah direview
            </p>
            <p className="font-body text-xs text-muted-foreground">
              Terima kasih telah berbagi pengalamanmu!
            </p>
          </div>
        )}

        {/* ── Form review ──────────────────────────────────────── */}
        {!itemsLoading && !isSuccess && selectedItem && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            {/* Nama produk */}
            <div className="bg-muted p-3.5 rounded-2xl border border-foreground">
              <p className="text-xs font-body text-muted-foreground">Produk yang diulas:</p>
              <p className="font-heading font-bold text-sm text-foreground line-clamp-1 mt-0.5">
                {selectedItem.product_name}
              </p>
              {selectedItem.variant_name && (
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {selectedItem.variant_name}
                </p>
              )}
              {/* Tombol ganti produk kalau multi-item */}
              {reviewableItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="mt-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Ganti produk
                </button>
              )}
            </div>

            {/* Bintang */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <span className="font-body font-bold text-sm text-foreground">
                Bagaimana penilaianmu?
              </span>
              <StarRating
                rating={rating}
                variant="interactive"
                size="lg"
                onRatingChange={setRating}
              />
              <span className="text-xs font-heading font-bold text-primary">
                {RATING_LABELS[rating]}
              </span>
            </div>

            {/* Komentar */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="review-comment" className="font-body font-bold text-xs text-foreground">
                Ceritakan Pengalamanmu (Opsional)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                placeholder="Bagaimana kualitas komponen, kemudahan perakitan, dan panduannya?"
                className="w-full bg-muted/40 border-2 border-foreground rounded-2xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary neo-shadow-icon transition-all resize-none disabled:opacity-60"
              />
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-center gap-2 text-xs text-danger bg-danger-bg border border-danger/30 rounded-xl px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Aksi */}
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="card"
                size="default"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="default"
                disabled={isSubmitting}
                className="gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Ulasan"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
