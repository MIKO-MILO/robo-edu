"use client";

import React from "react";
import {
  Star,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Package,
  User,
  Calendar,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable, type ColumnDef, type DataTableFilter } from "@/components/admin/data-table";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
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

  return { totalReviews, visibleReviews, hiddenReviews, averageRating };
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
    comment: "Kecewa sekali, dus dalam keadaan penyok dan salah satu modul sensor gyro tidak terdeteksi saat dihubungkan ke mikrokontroler.",
    status: "PUBLISHED",
    created_at: "2026-09-17T14:30:00Z",
    updated_at: "2026-09-17T14:30:00Z",
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
  onDeleteReview: (review: AdminReviewRow) => void;
  onToggleStatus?: (review: AdminReviewRow) => Promise<void>;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  toolbarActions?: React.ReactNode;
}

export function ReviewTable({
  data,
  isLoading = false,
  onDeleteReview,
  onToggleStatus,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  toolbarActions,
}: ReviewTableProps) {
  const router = useRouter();

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
        return (
          <div className="max-w-[280px] md:max-w-[340px]">
            <p className="text-xs text-foreground leading-relaxed line-clamp-1">
              {commentText}
            </p>
          </div>
        );
      },
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
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={row.status}
          customLabel={row.status === "PUBLISHED" ? "Tampil" : "Disembunyikan"}
          size="sm"
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {onToggleStatus && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              neo={false}
              onClick={() => void onToggleStatus(row)}
              className={
                row.status === "PUBLISHED"
                  ? "h-8 w-8 p-0 rounded-xl text-muted-foreground border-border hover:bg-muted transition-colors"
                  : "h-8 w-8 p-0 rounded-xl text-success border-success/30 hover:bg-success-bg hover:border-success transition-colors"
              }
              title={row.status === "PUBLISHED" ? "Sembunyikan ulasan" : "Tampilkan ulasan"}
            >
              {row.status === "PUBLISHED" ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            neo={false}
            onClick={() => router.push(`/admin/reviews/${row.id}`)}
            className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 border-border hover:bg-muted"
            title="Lihat detail review"
          >
            <ExternalLink className="size-3.5" />
            <span className="hidden sm:inline">Lihat Detail</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            neo={false}
            onClick={() => onDeleteReview(row)}
            className="h-8 w-8 p-0 rounded-xl text-danger border-danger/30 hover:bg-danger-bg hover:border-danger transition-colors"
            title="Hapus Review"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
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
  );
}
