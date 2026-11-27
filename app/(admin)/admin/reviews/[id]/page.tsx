"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Package,
  User,
  Mail,
  Calendar,
  ShoppingBag,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { useToast } from "@/components/admin/use-toast";
import { ReviewImageGallery } from "@/components/admin/reviews";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ReviewStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewDetail {
  id: string;
  order_item_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  product_name: string;
  user_name: string;
  user_email: string;
  order_number: string;
  images: { id: string; url: string }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  params: Promise<{ id: string }>;
}

export default function AdminReviewDetailPage({ params }: Props) {
  const { id } = use(params);
  const router  = useRouter();
  const { toast } = useToast();

  const [review, setReview]       = useState<ReviewDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // ── Fetch detail ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`/api/admin/reviews/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
        if (!cancelled) setReview(json.data as ReviewDetail);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat review.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Toggle status (hide / show) ───────────────────────────────────────
  const handleToggleStatus = async () => {
    if (!review) return;
    const newStatus: ReviewStatus = review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
    setIsTogglingStatus(true);
    try {
      const res  = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal mengubah status.");

      setReview((prev) => prev ? { ...prev, status: newStatus } : prev);
      toast({
        title: newStatus === "HIDDEN" ? "Ulasan Disembunyikan" : "Ulasan Ditampilkan",
        description:
          newStatus === "HIDDEN"
            ? "Ulasan tidak akan muncul di halaman produk."
            : "Ulasan kembali tampil di halaman produk.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah Status",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        variant: "error",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res  = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal menghapus.");

      toast({
        title: "Review Dihapus",
        description: "Ulasan berhasil dihapus secara permanen.",
        variant: "success",
      });
      router.push("/admin/reviews");
    } catch (err) {
      toast({
        title: "Gagal Menghapus",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pt-1">
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-10 w-72 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error || !review) {
    return (
      <div className="space-y-4 pt-1">
        <Button
          variant="outline"
          size="sm"
          neo={false}
          onClick={() => router.push("/admin/reviews")}
          className="gap-1.5 rounded-xl"
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar
        </Button>
        <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error ?? "Review tidak ditemukan."}</span>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pt-1 pb-20">
      {/* Back button */}
      <Button
        variant="outline"
        size="sm"
        neo={false}
        onClick={() => router.push("/admin/reviews")}
        className="gap-1.5 rounded-xl border-border font-heading font-bold text-xs"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Daftar
      </Button>

      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Star className="size-5 fill-primary/30" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Detail Ulasan Customer
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground font-mono">ID: {review.id}</p>
              <StatusBadge
                status={review.status}
                customLabel={review.status === "PUBLISHED" ? "Tampil di Produk" : "Disembunyikan"}
                size="sm"
                showDot
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            neo={false}
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={
              review.status === "PUBLISHED"
                ? "gap-1.5 rounded-xl text-warning border-warning/30 hover:bg-warning-bg hover:border-warning font-heading font-bold text-xs"
                : "gap-1.5 rounded-xl text-success border-success/30 hover:bg-success-bg hover:border-success font-heading font-bold text-xs"
            }
          >
            {review.status === "PUBLISHED" ? (
              <>
                <EyeOff className="size-3.5" />
                {isTogglingStatus ? "Menyembunyikan..." : "Sembunyikan Ulasan"}
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                {isTogglingStatus ? "Menampilkan..." : "Tampilkan Ulasan"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            neo={false}
            onClick={() => setShowDelete(true)}
            className="gap-1.5 rounded-xl text-danger border-danger/30 hover:bg-danger-bg hover:border-danger font-heading font-bold text-xs"
          >
            <Trash2 className="size-3.5" />
            Hapus Review
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Rating card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-heading font-bold text-foreground">Rating Pembeli</h2>
            <StarRating
              rating={review.rating}
              variant="full"
              size="lg"
              showScore={true}
              showCount={false}
            />
          </div>

          {/* Comment card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-heading font-bold text-foreground">Isi Komentar</h2>
            <div className="rounded-xl bg-background border border-border p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {review.comment ?? (
                <span className="text-muted-foreground italic">(Tidak ada komentar tertulis)</span>
              )}
            </div>
          </div>

          {/* Image gallery — only rendered when review has photos */}
          <ReviewImageGallery images={review.images} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Produk */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-muted-foreground border border-border/40">
                <Package className="size-4" />
              </div>
              <h2 className="text-sm font-heading font-bold text-foreground">Produk</h2>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">{review.product_name}</p>
            <p className="text-[11px] text-muted-foreground font-mono">ID: {review.product_id}</p>
          </div>

          {/* Customer */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary-100 text-primary-900 border border-primary-300">
                <User className="size-4" />
              </div>
              <h2 className="text-sm font-heading font-bold text-foreground">Customer</h2>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{review.user_name}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{review.user_email}</span>
              </div>
            </div>
          </div>

          {/* Order */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-muted text-muted-foreground border border-border/40">
                <ShoppingBag className="size-4" />
              </div>
              <h2 className="text-sm font-heading font-bold text-foreground">Nomor Order</h2>
            </div>
            <p className="text-sm font-mono font-semibold text-foreground">{review.order_number}</p>
          </div>

          {/* Tanggal */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 shrink-0" />
              <span className="font-semibold">Tanggal Review</span>
            </div>
            <p className="text-xs text-foreground">{formatDate(review.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      <ConfirmDeleteDialog
        open={showDelete}
        onOpenChange={(open) => !open && setShowDelete(false)}
        title="Hapus Ulasan Customer?"
        description="Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini bersifat destruktif dan tidak dapat dibatalkan."
        itemName={`Ulasan dari ${review.user_name} (${review.product_name})`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
      />
    </div>
  );
}
