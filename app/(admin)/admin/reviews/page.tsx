"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  useTransition,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminSelect } from "@/components/admin/form/select";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { useToast } from "@/components/admin/use-toast";
import {
  ReviewStatsCards,
  ReviewTable,
  getReviewStats,
  type AdminReviewRow,
} from "@/components/admin/reviews";
import type { ReviewStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

interface ReviewListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function fetchAdminReviews(params: {
  page: number;
  limit: number;
  q: string;
  status: string;
  rating: string;
  sort: string;
}): Promise<{ data: AdminReviewRow[]; meta: ReviewListMeta }> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sort: params.sort,
  });
  if (params.q) qs.set("q", params.q);
  if (params.status !== "ALL") qs.set("status", params.status);
  if (params.rating !== "ALL") qs.set("rating", params.rating);

  const res = await fetch(`/api/admin/reviews?${qs.toString()}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `HTTP ${res.status}`);
  return { data: json.data as AdminReviewRow[], meta: json.meta as ReviewListMeta };
}

// ---------------------------------------------------------------------------
// Inner Component (uses useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminReviewsContent() {
  const router        = useRouter();
  const pathname      = usePathname();
  const searchParams  = useSearchParams();
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  // ── URL params ────────────────────────────────────────────────────────
  const searchQuery  = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const ratingFilter = searchParams.get("rating") || "ALL";
  const sortBy       = searchParams.get("sortBy") || "created_at";
  const sortOrder    = searchParams.get("sortOrder") || "desc";
  const currentPage  = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const LIMIT        = 20;

  // ── Data state ────────────────────────────────────────────────────────
  const [reviews, setReviews]       = useState<AdminReviewRow[]>([]);
  const [meta, setMeta]             = useState<ReviewListMeta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading]   = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ── Delete dialog state ───────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewRow | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── URL helpers ───────────────────────────────────────────────────────
  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [searchParams, pathname, router],
  );

  // ── Fetch ─────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await fetchAdminReviews({
        page: currentPage,
        limit: LIMIT,
        q: searchQuery,
        status: statusFilter,
        rating: ratingFilter,
        sort: `${sortBy}_${sortOrder}`,
      });
      setReviews(result.data);
      setMeta(result.meta);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat ulasan.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, ratingFilter, sortBy, sortOrder]);

  useEffect(() => { void load(); }, [load]);

  // ── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => getReviewStats(reviews), [reviews]);

  // ── Handlers URL params ───────────────────────────────────────────────
  const handleSearchChange = (val: string) => pushParams({ search: val, page: null });
  const handleStatusFilterChange = (val: string) => pushParams({ status: val, page: null });
  const handleRatingFilterChange = (val: string) => pushParams({ rating: val, page: null });
  const handleSortChange = (val: string) => {
    const lastUnderscore = val.lastIndexOf("_");
    const field = val.slice(0, lastUnderscore);
    const order = val.slice(lastUnderscore + 1);
    if (field && order) pushParams({ sortBy: field, sortOrder: order, page: null });
  };
  const handlePageChange = (page: number) => pushParams({ page: page > 1 ? String(page) : null });

  // ── Toggle status ─────────────────────────────────────────────────────
  const handleToggleStatus = async (review: AdminReviewRow) => {
    setProcessingId(review.id);
    const nextStatus: ReviewStatus = review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
    const label = nextStatus === "PUBLISHED" ? "VISIBLE" : "HIDDEN";

    try {
      const res = await fetch(`/api/admin/reviews/${review.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message ?? "Gagal mengubah status.");
      }
      // Optimistic update di state lokal
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r)),
      );
      toast({
        title: "Status Ulasan Diperbarui",
        description: `Ulasan dari ${review.user_name} berhasil diubah menjadi ${label}.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah Status",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message ?? "Gagal menghapus.");
      }
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast({
        title: "Review Berhasil Dihapus",
        description: `Ulasan dari ${deleteTarget.user_name} telah dihapus permanen.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Ulasan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Star className="size-5 fill-primary/30" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Moderasi Ulasan Customer
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Melihat, memoderasi, menyembunyikan, atau menghapus ulasan yang tidak sesuai ketentuan.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          neo={false}
          onClick={load}
          className="gap-1.5 rounded-xl border border-border font-heading font-bold text-xs self-start sm:self-auto"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      {/* KPI Stats */}
      <ReviewStatsCards stats={stats} />

      {/* Error banner */}
      {loadError && (
        <div className="flex items-center gap-2.5 rounded-2xl border-2 border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          <span>{loadError}</span>
          <Button variant="outline" size="xs" onClick={load} className="ml-auto">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Table */}
      <ReviewTable
        data={reviews}
        isLoading={isLoading}
        onToggleStatus={handleToggleStatus}
        onDeleteReview={(review) => setDeleteTarget(review)}
        processingId={processingId}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Cari produk, customer, atau komentar..."
        filters={[
          {
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: handleStatusFilterChange,
            options: [
              { value: "PUBLISHED", label: "VISIBLE (Tampil)" },
              { value: "HIDDEN", label: "HIDDEN (Disembunyikan)" },
            ],
          },
          {
            id: "rating",
            label: "Rating",
            value: ratingFilter,
            onChange: handleRatingFilterChange,
            options: [
              { value: "1", label: "★ 1 Bintang" },
              { value: "2", label: "★ 2 Bintang" },
              { value: "3", label: "★ 3 Bintang" },
              { value: "4", label: "★ 4 Bintang" },
              { value: "5", label: "★ 5 Bintang" },
            ],
          },
        ]}
        toolbarActions={
          <div className="min-w-[150px]">
            <AdminSelect
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              selectSize="sm"
              options={[
                { value: "created_at_desc", label: "Terbaru" },
                { value: "created_at_asc", label: "Terlama" },
                { value: "rating_asc", label: "Rating Terendah" },
                { value: "rating_desc", label: "Rating Tertinggi" },
              ]}
            />
          </div>
        }
      />

      {/* Pagination */}
      {!isLoading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-body px-1">
          <span>
            Halaman {meta.page} dari {meta.totalPages} &bull; {meta.total} ulasan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs transition-colors"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage >= meta.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs transition-colors"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Ulasan Customer?"
        description="Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini bersifat destruktif dan tidak dapat dibatalkan."
        itemName={
          deleteTarget
            ? `Ulasan dari ${deleteTarget.user_name} (${deleteTarget.product_name})`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export with Suspense boundary
// ---------------------------------------------------------------------------
export default function AdminReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <AdminReviewsContent />
    </Suspense>
  );
}
