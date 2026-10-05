"use client";

import React, { useState, useMemo, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/form/input";
import { AdminSelect } from "@/components/admin/form/select";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { useToast } from "@/components/admin/use-toast";
import {
  ReviewStatsCards,
  ReviewTable,
  MOCK_ADMIN_REVIEWS,
  getReviewStats,
  type AdminReviewRow,
} from "@/components/admin/reviews";

// ---------------------------------------------------------------------------
// Inner Component (Uses useSearchParams - must be inside Suspense boundary)
// ---------------------------------------------------------------------------
function AdminReviewsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  // Master local state for interactive demo experience (client-side simulation)
  const [reviews, setReviews] = useState<AdminReviewRow[]>(MOCK_ADMIN_REVIEWS);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // State for confirm delete modal
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // URL State Params
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const ratingFilter = searchParams.get("rating") || "ALL";
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // URL parameter update handlers
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (val: string) => {
    updateUrlParams({ search: val });
  };

  const handleStatusFilterChange = (val: string) => {
    updateUrlParams({ status: val });
  };

  const handleRatingFilterChange = (val: string) => {
    updateUrlParams({ rating: val });
  };

  const handleSortChange = (val: string) => {
    const [field, order] = val.split("_");
    if (field && order) {
      updateUrlParams({ sortBy: field, sortOrder: order });
    }
  };

  // Action Handler 1: Toggle Status (PUBLISHED <-> HIDDEN)
  const handleToggleStatus = async (review: AdminReviewRow) => {
    setProcessingId(review.id);
    const nextStatus = review.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
    const statusLabel = nextStatus === "PUBLISHED" ? "VISIBLE" : "HIDDEN";

    try {
      // Simulate backend async delay (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r))
      );

      toast({
        title: "Status Ulasan Diperbarui",
        description: `Ulasan dari ${review.user_name} berhasil diubah menjadi ${statusLabel}.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal Mengubah Status",
        description: "Terjadi kesalahan saat memproses perubahan status review.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Action Handler 2: Delete Review (Requires Confirmation Dialog)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      // Simulate backend async API call (600ms)
      await new Promise((resolve) => setTimeout(resolve, 600));

      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));

      toast({
        title: "Review Berhasil Dihapus",
        description: `Ulasan dari customer ${deleteTarget.user_name} telah dihapus permanen.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal Menghapus Ulasan",
        description: "Terjadi kesalahan sistem saat menghapus data ulasan.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Computed & Filtered list based on state controls
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // 1. Search Query (product_name OR user_name OR comment)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.product_name.toLowerCase().includes(q) ||
          r.user_name.toLowerCase().includes(q) ||
          (r.comment && r.comment.toLowerCase().includes(q))
      );
    }

    // 2. Filter Status (PUBLISHED / HIDDEN)
    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // 3. Filter Rating (1 to 5)
    if (ratingFilter !== "ALL") {
      const targetRating = Number(ratingFilter);
      result = result.filter((r) => r.rating === targetRating);
    }

    // 4. Sorting (Date or Rating, asc or desc)
    result.sort((a, b) => {
      if (sortBy === "rating") {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      }
      // default: created_at
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [reviews, searchQuery, statusFilter, ratingFilter, sortBy, sortOrder]);

  // Overall Stats
  const stats = useMemo(() => getReviewStats(reviews), [reviews]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            Melihat, memoderasi, menyembunyikan (hide), atau menghapus ulasan yang tidak sesuai ketentuan.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          neo={false}
          onClick={() => setReviews([...MOCK_ADMIN_REVIEWS])}
          className="gap-1.5 rounded-xl border border-border font-heading font-bold text-xs self-start sm:self-auto"
          title="Reset Data Ulasan ke kondisi awal"
        >
          <RefreshCw className="size-3.5" />
          <span>Reset Demo Data</span>
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <ReviewStatsCards stats={stats} />

      {/* Main Review Data Table dengan DataTable bawaan */}
      <ReviewTable
        data={filteredAndSortedReviews}
        onToggleStatus={handleToggleStatus}
        onDeleteReview={(review: AdminReviewRow) => setDeleteTarget(review)}
        processingId={processingId}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Cari berdasarkan nama produk atau nama customer..."
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

      {/* Confirmation Dialog for Destructive Delete Action */}
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
// Main Route Page Export (wrapped in Suspense boundary for Next.js App Router)
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
