"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewItem {
  order_item_id: string;
  product_name: string;
  variant_name: string | null;
  already_reviewed: boolean;
}

interface ItemFormState {
  rating: number;
  comment: string;
  files: File[];
  previews: string[];
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
}

const RATING_LABELS: Record<number, string> = {
  5: "Sangat Memuaskan",
  4: "Bagus & Berfungsi Baik",
  3: "Cukup Baik",
  2: "Kurang Memuaskan",
  1: "Mengecewakan",
};

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function defaultFormState(): ItemFormState {
  return {
    rating: 5,
    comment: "",
    files: [],
    previews: [],
    isSubmitting: false,
    isSubmitted: false,
    error: null,
  };
}

// ── Review Section (per item) ─────────────────────────────────────────────────

interface ReviewSectionProps {
  item: ReviewItem;
  form: ItemFormState;
  onChange: (patch: Partial<ItemFormState>) => void;
  onSubmit: () => void;
}

function ReviewSection({ item, form, onChange, onSubmit }: ReviewSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const remaining = MAX_FILES - form.files.length;
    if (remaining <= 0) return;

    const toAdd: File[] = [];
    const newPreviews: string[] = [];

    for (const file of selected.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) {
        onChange({ error: "Hanya file gambar yang diizinkan." });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onChange({ error: `File "${file.name}" melebihi batas 10 MB.` });
        continue;
      }
      toAdd.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (toAdd.length > 0) {
      onChange({
        files: [...form.files, ...toAdd],
        previews: [...form.previews, ...newPreviews],
        error: null,
      });
    }

    // Reset input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(form.previews[index] ?? "");
    onChange({
      files: form.files.filter((_, i) => i !== index),
      previews: form.previews.filter((_, i) => i !== index),
    });
  }

  if (item.already_reviewed || form.isSubmitted) {
    return (
      <div className="rounded-3xl border-2 border-foreground bg-card p-5 neo-shadow flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading font-bold text-sm text-foreground line-clamp-2">
              {item.product_name}
            </p>
            {item.variant_name && (
              <p className="font-body text-xs text-muted-foreground mt-0.5">
                {item.variant_name}
              </p>
            )}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold font-heading">
            <CheckCircle2 className="w-3 h-3" />
            Sudah Diulas
          </span>
        </div>

        <div className="flex flex-col gap-2 opacity-60 pointer-events-none select-none">
          <StarRating rating={form.isSubmitted ? form.rating : 5} variant="interactive" size="lg" />
          <textarea
            rows={3}
            disabled
            value={form.isSubmitted ? form.comment : ""}
            readOnly
            placeholder="Sudah diulas sebelumnya"
            className="w-full bg-muted/40 border-2 border-foreground rounded-2xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground resize-none"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-foreground bg-card p-5 neo-shadow flex flex-col gap-4">
      {/* Product name */}
      <div>
        <p className="font-heading font-bold text-sm text-foreground line-clamp-2">
          {item.product_name}
        </p>
        {item.variant_name && (
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {item.variant_name}
          </p>
        )}
      </div>

      {/* Star rating */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <span className="font-body font-bold text-xs text-foreground">
          Bagaimana penilaianmu?
        </span>
        <StarRating
          rating={form.rating}
          variant="interactive"
          size="lg"
          onRatingChange={(v) => onChange({ rating: v })}
        />
        <span className="text-xs font-heading font-bold text-primary">
          {form.rating} Bintang — {RATING_LABELS[form.rating]}
        </span>
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body font-bold text-xs text-foreground">
          Ceritakan Pengalamanmu{" "}
          <span className="font-normal text-muted-foreground">(Opsional)</span>
        </label>
        <textarea
          rows={3}
          value={form.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          disabled={form.isSubmitting}
          placeholder="Bagaimana kualitas komponen, kemudahan perakitan, dan panduannya?"
          className="w-full bg-muted/40 border-2 border-foreground rounded-2xl p-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary neo-shadow-icon transition-all resize-none disabled:opacity-60"
        />
      </div>

      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-body font-bold text-xs text-foreground">
            Foto Produk{" "}
            <span className="font-normal text-muted-foreground">
              (Opsional · maks {MAX_FILES} foto · maks 10 MB/foto)
            </span>
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {form.files.length}/{MAX_FILES}
          </span>
        </div>

        {/* Preview grid */}
        {form.previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.previews.map((src, i) => (
              <div
                key={src}
                className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-foreground neo-shadow-icon"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`foto-${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={form.isSubmitting}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-60"
                  aria-label="Hapus foto"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add more button inline */}
            {form.files.length < MAX_FILES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={form.isSubmitting}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-foreground flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors disabled:opacity-60 cursor-pointer"
                aria-label="Tambah foto"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {form.previews.length === 0 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={form.isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-dashed border-foreground hover:bg-muted transition-colors text-sm font-body text-muted-foreground disabled:opacity-60 cursor-pointer w-full justify-center"
          >
            <ImagePlus className="w-4 h-4" />
            Tambahkan Foto
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={form.isSubmitting}
        />
      </div>

      {/* Error */}
      {form.error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{form.error}</span>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end pt-1">
        <Button
          type="button"
          variant="primary"
          size="default"
          disabled={form.isSubmitting}
          onClick={onSubmit}
          className="gap-2 min-w-[140px]"
        >
          {form.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Kirim Ulasan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderReviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [orderNumber, setOrderNumber] = useState<string>("");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [forms, setForms] = useState<Record<string, ItemFormState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Fetch order items ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat pesanan.");

        const d = json.data;
        setOrderNumber(d.order_number ?? "");

        const mapped: ReviewItem[] = (d.order_items ?? []).map(
          (item: {
            id: string;
            product_name_snapshot: string;
            variant_name_snapshot: string | null;
            already_reviewed: boolean;
          }) => ({
            order_item_id: item.id,
            product_name: item.product_name_snapshot,
            variant_name: item.variant_name_snapshot ?? null,
            already_reviewed: item.already_reviewed ?? false,
          }),
        );

        setItems(mapped);

        const initialForms: Record<string, ItemFormState> = {};
        for (const item of mapped) {
          initialForms[item.order_item_id] = defaultFormState();
        }
        setForms(initialForms);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Gagal memuat pesanan.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // ── Patch a single form ──────────────────────────────────────────────
  function patchForm(orderItemId: string, patch: Partial<ItemFormState>) {
    setForms((prev) => ({
      ...prev,
      [orderItemId]: { ...(prev[orderItemId] ?? defaultFormState()), ...patch },
    }));
  }

  // ── Upload files for one item ────────────────────────────────────────
  async function uploadFiles(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/minio", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal mengunggah foto.");
      urls.push(json.url as string);
    }
    return urls;
  }

  // ── Submit one item's review ─────────────────────────────────────────
  async function handleSubmitItem(orderItemId: string) {
    const form = forms[orderItemId];
    if (!form) return;

    patchForm(orderItemId, { isSubmitting: true, error: null });

    try {
      // 1. Upload photos
      let imageUrls: string[] = [];
      if (form.files.length > 0) {
        imageUrls = await uploadFiles(form.files);
      }

      // 2. POST review
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_item_id: orderItemId,
          rating: form.rating,
          comment: form.comment.trim() || undefined,
          image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        patchForm(orderItemId, {
          isSubmitting: false,
          error: json.message ?? "Gagal mengirim ulasan.",
        });
        return;
      }

      patchForm(orderItemId, { isSubmitting: false, isSubmitted: true, error: null });

      // Check if all reviewable items are now done
      const updatedForms = {
        ...forms,
        [orderItemId]: { ...form, isSubmitting: false, isSubmitted: true },
      };
      const allDone = items
        .filter((item) => !item.already_reviewed)
        .every((item) => updatedForms[item.order_item_id]?.isSubmitted);

      if (allDone) {
        toast.success("Semua ulasan berhasil dikirim!", {
          description: "Terima kasih telah berbagi pengalamanmu.",
        });
        setTimeout(() => {
          router.push(`/profile/orders/${id}`);
        }, 1500);
      } else {
        toast.success("Ulasan berhasil dikirim!");
      }
    } catch (err) {
      patchForm(orderItemId, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-sm">Memuat pesanan...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">{loadError}</p>
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" size="sm">Kembali ke Detail Pesanan</Button>
        </Link>
      </div>
    );
  }

  const reviewableItems = items.filter((i) => !i.already_reviewed);
  const submittedCount = reviewableItems.filter(
    (i) => forms[i.order_item_id]?.isSubmitted,
  ).length;
  const allSubmitted = reviewableItems.length > 0 && submittedCount === reviewableItems.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={`/profile/orders/${id}`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            Tulis Ulasan
          </h1>
          {orderNumber && (
            <p className="font-body text-xs text-muted-foreground">
              No. Order: <span className="font-bold text-foreground">{orderNumber}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Progress hint ───────────────────────────────────────── */}
      {reviewableItems.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
          <span>
            {submittedCount}/{reviewableItems.length} ulasan dikirim
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full bg-primary rounded-full transition-all duration-500",
              )}
              style={{
                width: `${reviewableItems.length > 0 ? (submittedCount / reviewableItems.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ── All-done banner ─────────────────────────────────────── */}
      {allSubmitted && (
        <div className="rounded-3xl border-2 border-emerald-400 bg-emerald-50 p-5 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="font-heading font-bold text-base text-emerald-800">
            Semua Ulasan Terkirim!
          </h2>
          <p className="font-body text-xs text-emerald-700">
            Terima kasih telah berbagi pengalamanmu. Kamu akan diarahkan ke detail pesanan.
          </p>
        </div>
      )}

      {/* ── Item sections ───────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <p className="font-heading font-bold text-base text-foreground">
            Tidak ada produk yang perlu diulas
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Semua produk dalam pesanan ini sudah pernah diulas.
          </p>
          <Link href={`/profile/orders/${id}`}>
            <Button variant="outline" size="sm" className="mt-2">
              Kembali ke Detail Pesanan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <ReviewSection
              key={item.order_item_id}
              item={item}
              form={forms[item.order_item_id] ?? defaultFormState()}
              onChange={(patch) => patchForm(item.order_item_id, patch)}
              onSubmit={() => void handleSubmitItem(item.order_item_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}