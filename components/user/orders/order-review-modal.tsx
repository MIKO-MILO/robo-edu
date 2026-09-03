"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Star, ThumbsUp, Sparkles, CheckCircle2 } from "lucide-react";

export interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  productName?: string;
  onSubmitSuccess?: () => void;
}

export function OrderReviewModal({
  isOpen,
  onClose,
  orderNumber,
  productName = "Advanced Servo Motor Controller Board V2",
  onSubmitSuccess,
}: OrderReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComment("");
      onSubmitSuccess?.();
      onClose();
    }, 1500);
  };

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

        {isSubmitted ? (
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
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="bg-muted p-3.5 rounded-2xl border border-foreground">
              <p className="text-xs font-body text-muted-foreground">Produk yang diulas:</p>
              <p className="font-heading font-bold text-sm text-foreground line-clamp-1 mt-0.5">
                {productName}
              </p>
            </div>

            {/* Interactive Star Rating */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <span className="font-body font-bold text-sm text-foreground">
                Bagaimana penilaianmu?
              </span>
              <StarRating
                rating={rating}
                variant="interactive"
                size="lg"
                onRatingChange={(newRating) => setRating(newRating)}
              />
              <span className="text-xs font-heading font-bold text-primary">
                {rating === 5 && "Sangat Memuaskan ⭐⭐⭐⭐⭐"}
                {rating === 4 && "Bagus & Berfungsi Baik ⭐⭐⭐⭐"}
                {rating === 3 && "Cukup Baik ⭐⭐⭐"}
                {rating === 2 && "Kurang Memuaskan ⭐⭐"}
                {rating === 1 && "Mengecewakan ⭐"}
              </span>
            </div>

            {/* Comment Area */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="review-comment"
                className="font-body font-bold text-xs text-foreground"
              >
                Ceritakan Pengalamanmu (Opsional)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagaimana kualitas komponen, kemudahan perakitan, dan panduannya?"
                className="w-full bg-muted/40 border-2 border-foreground rounded-2xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary neo-shadow-icon transition-all resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="card" size="default" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="default">
                Kirim Ulasan
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
