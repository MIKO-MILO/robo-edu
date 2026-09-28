"use client";

import React, { useState } from "react";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";
import { DataTable, type ColumnDef, type DataTableFilter } from "@/components/admin/data-table";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Review } from "@/types/review";

export interface AdminReviewRow extends Review {
  product_name: string;
  user_name: string;
  user_email?: string;
}

export interface ReviewStats {
  totalReviews: number;
  visibleReviews: number;
  hiddenReviews: number;
  averageRating: number;
}

export function getReviewStats(reviews: AdminReviewRow[]): ReviewStats {
  const totalReviews = reviews.length;
  const visibleReviews = reviews.filter((r) => r.status === "PUBLISHED").length;
  const hiddenReviews = reviews.filter((r) => r.status === "HIDDEN").length;
  
  const sumRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

  return {
    totalReviews,
    visibleReviews,
    hiddenReviews,
    averageRating,
  };
}

export const MOCK_ADMIN_REVIEWS: AdminReviewRow[] = [
  {
    id: "rev-101",
    order_item_id: "ord-item-01",
    user_id: "usr-01",
    user_name: "Budi Santoso",
    user_email: "budi.santoso@example.com",
    product_id: "prod-01",
    product_name: "Robotics Starter Kit Deluxe v2",
    rating: 5,
    comment: "Produk sangat luar biasa! Anak saya sangat senang merakit komponen robotik ini. Instruksi perakitan sangat jelas dan mudah dipahami oleh pemula.",
    status: "PUBLISHED",
    created_at: "2026-09-18T08:15:00Z",
    updated_at: "2026-09-18T08:15:00Z",
  },
  {
    id: "rev-102",
    order_item_id: "ord-item-02",
    user_id: "usr-02",
    user_name: "Siti Rahmawati",
    user_email: "siti.rahma@example.com",
    product_id: "prod-02",
    product_name: "Sensor Kit Arduino Complete Pack",
    rating: 1,
    comment: "Kecewa sekali, dus dalam keadaan penyok dan salah satu modul sensor gyro tidak terdeteksi saat dihubungkan ke mikrokontroler. Tolong admin respon komplain saya!",
    status: "PUBLISHED",
    created_at: "2026-09-17T14:30:00Z",
    updated_at: "2026-09-17T14:30:00Z",
  },
  {
    id: "rev-103",
    order_item_id: "ord-item-03",
    user_id: "usr-03",
    user_name: "Ahmad Dahlan",
    user_email: "ahmad.d@example.com",
    product_id: "prod-03",
    product_name: "IoT Smart Home Education Set",
    rating: 4,
    comment: "Kualitas bagus dan respon penjual sangat baik. Hanya saja pengiriman oleh kurir agak sedikit lambat dibanding perkiraan awal.",
    status: "PUBLISHED",
    created_at: "2026-09-16T11:00:00Z",
    updated_at: "2026-09-16T11:00:00Z",
  },
  {
    id: "rev-104",
    order_item_id: "ord-item-04",
    user_id: "usr-04",
    user_name: "Spam User / Bot Account",
    user_email: "spammer999@temp-mail.com",
    product_id: "prod-01",
    product_name: "Robotics Starter Kit Deluxe v2",
    rating: 1,
    comment: "Toko penipu promo judi slot klik link hxxps://spam-link-unusual.site/claim-bonus sekarang juga!!",
    status: "HIDDEN",
    created_at: "2026-09-15T09:22:00Z",
    updated_at: "2026-09-15T10:00:00Z",
  },
  {
    id: "rev-105",
    order_item_id: "ord-item-05",
    user_id: "usr-05",
    user_name: "Rian Prasetyo",
    user_email: "rian.prasetyo@example.com",
    product_id: "prod-04",
    product_name: "Raspberry Pi 4 Model B (8GB RAM)",
    rating: 5,
    comment: "Barang ori 100%, mulus tanpa cacat. Sudah dites jalankan Python & OpenCV berjalan lancar tanpa kendala panas berlebih.",
    status: "PUBLISHED",
    created_at: "2026-09-14T16:45:00Z",
    updated_at: "2026-09-14T16:45:00Z",
  },
  {
    id: "rev-106",
    order_item_id: "ord-item-06",
    user_id: "usr-06",
    user_name: "Dewi Lestari",
    user_email: "dewi.lestari@example.com",
    product_id: "prod-02",
    product_name: "Sensor Kit Arduino Complete Pack",
    rating: 2,
    comment: "Buku panduannya tidak ada di dalam boks paket, terpaksa harus minta PDF dulu ke CS.",
    status: "HIDDEN",
    created_at: "2026-09-13T10:15:00Z",
    updated_at: "2026-09-13T10:15:00Z",
  },
  {
    id: "rev-107",
    order_item_id: "ord-item-07",
    user_id: "usr-07",
    user_name: "Eko Wijaya",
    user_email: "eko.wijaya@example.com",
    product_id: "prod-05",
    product_name: "Servo Motor MG996R Metal Gear",
    rating: 3,
    comment: "Torsi lumayan kuat, tapi agak bising saat beroperasi dibawah beban berat.",
    status: "PUBLISHED",
    created_at: "2026-09-12T13:00:00Z",
    updated_at: "2026-09-12T13:00:00Z",
  },
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function ReviewStatsCards({ stats }: { stats: ReviewStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <MessageSquare className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold">Total Review</p>
          <p className="text-xl font-bold font-heading text-foreground">{stats.totalReviews}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
          <Star className="size-5 fill-amber-400" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold">Rata-rata Rating</p>
          <p className="text-xl font-bold font-heading text-foreground">{stats.averageRating} / 5.0</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-success-bg text-success border border-success/30 shrink-0">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold">Tampil (Visible)</p>
          <p className="text-xl font-bold font-heading text-foreground">{stats.visibleReviews}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-muted text-muted-foreground border border-border shrink-0">
          <XCircle className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-semibold">Disembunyikan (Hidden)</p>
          <p className="text-xl font-bold font-heading text-foreground">{stats.hiddenReviews}</p>
        </div>
      </div>
    </div>
  );
}

export interface ReviewTableProps {
  data: AdminReviewRow[];
  isLoading?: boolean;
  onToggleStatus: (review: AdminReviewRow) => Promise<void> | void;
  onDeleteReview: (review: AdminReviewRow) => void;
  processingId?: string | null;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  toolbarActions?: React.ReactNode;
}

export function ReviewTable({
  data,
  isLoading = false,
  onToggleStatus,
  onDeleteReview,
  processingId = null,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  toolbarActions,
}: ReviewTableProps) {
  const [selectedReview, setSelectedReview] = useState<AdminReviewRow | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const columns: ColumnDef<AdminReviewRow>[] = [
    {
      key: "product_name",
      header: "Produk",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[220px]">
          <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0 border border-border/40">
            <Package className="size-4" />
          </div>
          <div className="truncate flex flex-col">
            <span className="font-bold text-foreground truncate" title={row.product_name}>
              {row.product_name}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              ID: {row.product_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "user_name",
      header: "Customer",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[180px]">
          <div className="p-2 rounded-xl bg-primary-100 text-primary-900 shrink-0 border border-primary-300">
            <User className="size-4" />
          </div>
          <div className="truncate flex flex-col">
            <span className="font-semibold text-foreground truncate" title={row.user_name}>
              {row.user_name}
            </span>
            {row.user_email && (
              <span className="text-[10px] text-muted-foreground truncate" title={row.user_email}>
                {row.user_email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <StarRating
            rating={row.rating}
            variant="full"
            size="sm"
            showScore={true}
            showCount={false}
          />
        </div>
      ),
    },
    {
      key: "comment",
      header: "Komentar",
      cell: (row) => {
        const commentText = row.comment || "(Tidak ada komentar)";
        const isLong = commentText.length > 70;
        const isExpanded = expandedRowIds.has(row.id);

        return (
          <div className="max-w-[280px] md:max-w-[340px] space-y-1">
            <p className={cn("text-xs text-foreground leading-relaxed", !isExpanded && "line-clamp-2")}>
              {commentText}
            </p>
            {isLong && (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => toggleExpand(row.id)}
                  className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  {isExpanded ? (
                    <>
                      <span>Sembunyikan</span>
                      <ChevronUp className="size-3" />
                    </>
                  ) : (
                    <>
                      <span>Baca selebihnya</span>
                      <ChevronDown className="size-3" />
                    </>
                  )}
                </button>
                <span className="text-muted-foreground text-[10px]">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedReview(row)}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Buka Modal
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <StatusBadge
          status={row.status}
          customLabel={row.status === "PUBLISHED" ? "VISIBLE" : "HIDDEN"}
        />
      ),
    },
    {
      key: "created_at",
      header: "Tanggal",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
          <Calendar className="size-3.5 shrink-0" />
          <span>{formatDate(row.created_at)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => {
        const isProcessing = processingId === row.id;
        const isVisible = row.status === "PUBLISHED";

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant={isVisible ? "outline" : "primary"}
              size="sm"
              neo={false}
              disabled={isProcessing}
              onClick={() => onToggleStatus(row)}
              className={cn(
                "h-8 px-2.5 text-xs font-semibold rounded-xl transition-all gap-1.5",
                isVisible
                  ? "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "bg-primary text-primary-100"
              )}
              title={isVisible ? "Sembunyikan ulasan (HIDDEN)" : "Tampilkan ulasan (VISIBLE)"}
            >
              {isProcessing ? (
                <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isVisible ? (
                <>
                  <EyeOff className="size-3.5" />
                  <span className="hidden sm:inline">Hide</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  <span className="hidden sm:inline">Show</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              neo={false}
              disabled={isProcessing}
              onClick={() => onDeleteReview(row)}
              className="h-8 w-8 p-0 rounded-xl text-danger border-danger/30 hover:bg-danger-bg hover:border-danger transition-colors"
              title="Hapus Review"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable<AdminReviewRow>
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchable={!!onSearchChange}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        toolbarActions={toolbarActions}
        emptyMessage="Belum ada ulasan customer yang sesuai dengan filter."
      />

      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="border border-border bg-card max-w-lg p-6 rounded-2xl shadow-xl font-body">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={selectedReview?.status || "PUBLISHED"}
                customLabel={selectedReview?.status === "PUBLISHED" ? "VISIBLE" : "HIDDEN"}
              />
              <span className="text-xs text-muted-foreground">
                {selectedReview && formatDate(selectedReview.created_at)}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold font-heading text-foreground pt-1">
              Detail Ulasan Customer
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tinjauan lengkap komentar ulasan produk oleh pembeli.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/60 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Nama Produk:</span>
                  <span className="font-bold text-foreground block truncate" title={selectedReview.product_name}>
                    {selectedReview.product_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Nama Customer:</span>
                  <span className="font-bold text-foreground block truncate" title={selectedReview.user_name}>
                    {selectedReview.user_name}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Rating Pembeli:</span>
                <StarRating
                  rating={selectedReview.rating}
                  variant="full"
                  size="md"
                  showScore={true}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">Isi Komentar Ulasan:</span>
                <div className="p-4 rounded-2xl bg-background border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedReview.comment || "(Tidak ada komentar tertulis)"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
