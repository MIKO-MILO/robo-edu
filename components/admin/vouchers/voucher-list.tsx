"use client";

import React, { useState, useMemo } from "react";
import type { Voucher, PaginationMeta, UUID } from "@/types";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit2Icon, Trash2Icon, TicketIcon, EyeIcon } from "lucide-react";
import { mapVoucherToPromoItem } from "@/types/voucher";
import { VoucherCardMulti, VoucherTicketSingle } from "@/components/user/landing";
import { cn } from "@/lib/utils";
import { LandingFeaturedToggle } from "@/components/admin/landing-featured-toggle";
import {
  useLandingFeaturedVouchers,
  useAddFeaturedVoucher,
  useRemoveFeaturedVoucher,
} from "@/hooks/admin/landing-config/use-landing-featured";

const MAX_FEATURED_VOUCHERS = 6;

export interface VoucherTableProps {
  data: Voucher[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onEdit?: (voucher: Voucher) => void;
  onDelete?: (id: UUID) => void;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VoucherList({
  data,
  isLoading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
}: VoucherTableProps) {
  const [previewVoucher, setPreviewVoucher] = useState<Voucher | null>(null);
  const [previewMode, setPreviewMode] = useState<"multi" | "single">("multi");
  const [previewThemeIndex, setPreviewThemeIndex] = useState(0);

  // ── Featured vouchers state ───────────────────────────────────────────
  const { data: featuredEntries, isLoading: isFeaturedLoading } = useLandingFeaturedVouchers();
  const addFeatured    = useAddFeaturedVoucher();
  const removeFeatured = useRemoveFeaturedVoucher();

  const featuredCount    = featuredEntries?.length ?? 0;
  const isAtLimit        = featuredCount >= MAX_FEATURED_VOUCHERS;
  // Map voucher_id → entry id for quick lookup
  const featuredByVoucherId = useMemo(() => {
    const map = new Map<string, string>();
    featuredEntries?.forEach((e) => map.set(e.voucher_id, e.id));
    return map;
  }, [featuredEntries]);

  const handleToggleFeatured = (voucher: Voucher) => {
    const entryId = featuredByVoucherId.get(voucher.id);
    if (entryId) {
      removeFeatured.mutate(entryId);
    } else {
      addFeatured.mutate(voucher.id);
    }
  };

  const previewPromoItem = useMemo(() => {
    if (!previewVoucher) return null;
    return mapVoucherToPromoItem(previewVoucher, previewThemeIndex);
  }, [previewVoucher, previewThemeIndex]);
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
        <div className="p-4 rounded-full bg-accent-soft-blue/30 border border-border mb-4">
          <TicketIcon className="size-10 text-foreground" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground">Tidak Ada Voucher</h3>
        <p className="font-body text-sm text-muted-foreground mt-1 max-w-sm">
          Belum ada voucher yang tersedia atau tidak ada voucher yang cocok dengan filter pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left border-collapse font-body">
          <thead>
            <tr className="border-b border-border bg-accent-soft-blue/40 text-foreground font-heading text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">Voucher</th>
              <th className="py-3.5 px-4 font-bold">Diskon</th>
              <th className="py-3.5 px-4 font-bold">Limit Penggunaan</th>
              <th className="py-3.5 px-4 font-bold">Masa Berlaku</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Landing Page</th>
              <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {data.map((voucher) => (
              <tr
                key={voucher.id}
                className="hover:bg-muted/40 transition-colors duration-150"
              >
                {/* Voucher Info */}
                <td className="py-3 px-4">
                  <div className="font-heading font-bold text-foreground line-clamp-1">
                    {voucher.code}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {voucher.name}
                  </div>
                </td>

                {/* Discount */}
                <td className="py-3 px-4 font-bold text-foreground">
                  {voucher.discount_type === "PERCENTAGE" 
                    ? `${voucher.discount_value}%` 
                    : formatIDR(voucher.discount_value)
                  }
                  {voucher.discount_type === "PERCENTAGE" && voucher.maximum_discount && (
                    <div className="text-xs text-muted-foreground font-normal">
                      Maks: {formatIDR(voucher.maximum_discount)}
                    </div>
                  )}
                </td>
                
                {/* Usage Limit */}
                <td className="py-3 px-4">
                  <div className={voucher.usage_limit && voucher.used_count >= voucher.usage_limit ? "font-medium text-danger" : "font-medium text-foreground"}>
                    {voucher.used_count} / {voucher.usage_limit ?? "∞"}
                  </div>
                </td>

                {/* Masa Berlaku */}
                <td className="py-3 px-4 text-sm text-foreground">
                  {voucher.end_at ? new Date(voucher.end_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <StatusBadge 
                    status={voucher.is_active ? "ACTIVE" : "INACTIVE"}
                  />
                </td>

                {/* Landing Page toggle */}
                <td className="py-3 px-4">
                  {(() => {
                    const isFeatured = featuredByVoucherId.has(voucher.id);
                    const isPending  =
                      (addFeatured.isPending    && addFeatured.variables    === voucher.id) ||
                      (removeFeatured.isPending  && removeFeatured.variables === featuredByVoucherId.get(voucher.id));

                    let disabledReason: string | undefined;
                    if (!voucher.is_active) {
                      disabledReason = "Hanya voucher aktif yang dapat ditampilkan di landing page.";
                    } else if (isAtLimit && !isFeatured) {
                      disabledReason = "Maksimal 6 voucher dapat ditampilkan di landing page.";
                    }

                    return (
                      <LandingFeaturedToggle
                        isFeatured={isFeatured}
                        isLoading={isFeaturedLoading}
                        isPending={isPending}
                        disabledReason={disabledReason}
                        onToggle={() => handleToggleFeatured(voucher)}
                      />
                    );
                  })()}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      neo={false}
                      onClick={() => setPreviewVoucher(voucher)}
                      title="Lihat Preview Tiket"
                    >
                      <EyeIcon className="size-3.5" />
                      <span>Preview</span>
                    </Button>
                    {onEdit && (
                      <Button
                        type="button"
                        variant="accent-yellow"
                        size="xs"
                        neo={false}
                        onClick={() => onEdit(voucher)}
                        title="Edit Voucher"
                      >
                        <Edit2Icon className="size-3.5" />
                        <span>Edit</span>
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        type="button"
                        variant="danger"
                        size="xs"
                        neo={false}
                        onClick={() => onDelete(voucher.id)}
                        title="Hapus Voucher"
                      >
                        <Trash2Icon className="size-3.5" />
                        <span>Hapus</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta && meta.total_pages > 1 && onPageChange && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Dialog Preview Voucher */}
      <Dialog open={!!previewVoucher} onOpenChange={(open) => !open && setPreviewVoucher(null)}>
        <DialogContent className="max-w-4xl p-6 bg-card border-border">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
              <EyeIcon className="size-5 text-primary" />
              Preview Kartu Voucher: {previewVoucher?.code}
            </DialogTitle>
            <DialogDescription className="font-body text-xs text-muted-foreground">
              Desain kartu voucher yang tampil langsung di antarmuka pengunjung website.
            </DialogDescription>
          </DialogHeader>

          {previewPromoItem && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("multi")}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      previewMode === "multi"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Card Multi (2 Sejajar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("single")}
                    className={cn(
                      "px-3 py-1 rounded-lg transition-all cursor-pointer",
                      previewMode === "single"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Tiket Single (Besar)
                  </button>
                </div>

                {previewMode === "multi" && (
                  <div className="inline-flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-body">Tema Pola:</span>
                    {[
                      { index: 0, label: "Biru", color: "bg-voucher-blue" },
                      { index: 1, label: "Kuning", color: "bg-voucher-yellow" },
                      { index: 2, label: "Ungu", color: "bg-voucher-purple" },
                    ].map((th) => (
                      <button
                        key={th.index}
                        type="button"
                        onClick={() => setPreviewThemeIndex(th.index)}
                        title={`Pola tema ${th.label}`}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 transition-transform cursor-pointer",
                          th.color,
                          previewThemeIndex === th.index
                            ? "border-secondary scale-110 shadow-xs"
                            : "border-white/80 opacity-70 hover:opacity-100"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Box Preview dengan Latar Belakang Website */}
              <div className="bg-background rounded-2xl p-4 sm:p-8 flex items-center justify-center border border-border/40 overflow-hidden min-h-[280px]">
                {previewMode === "multi" ? (
                  <div className="w-full max-w-lg">
                    <VoucherCardMulti item={previewPromoItem} index={previewThemeIndex} />
                  </div>
                ) : (
                  <div className="w-full max-w-3xl">
                    <VoucherTicketSingle item={previewPromoItem} />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
