"use client";

import React from "react";
import type { InventoryVariantRow, PaginationMeta, UUID } from "@/types";
import { ProductStatusBadge } from "@/components/admin/products/product-status-badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageIcon, SlidersHorizontalIcon } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/lib/api/endpoints/inventory";
import { cn } from "@/lib/utils";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StockBadge({ stock }: { stock: number }) {
  const isCritical = stock === 0;
  const isLow = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums",
        isCritical &&
          "border-danger/30 bg-danger-bg text-danger",
        isLow &&
          "border-amber-400/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
        !isCritical &&
          !isLow &&
          "border-success/20 bg-success-bg text-success"
      )}
    >
      {stock}
    </span>
  );
}

export interface InventoryTableProps {
  data: InventoryVariantRow[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onAdjust?: (row: InventoryVariantRow) => void;
  isAdjustingId?: UUID | null;
}

export function InventoryTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onAdjust,
  isAdjustingId,
}: InventoryTableProps) {
  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Empty State ── */
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
        <div className="mb-4 rounded-full border border-border bg-accent-yellow/30 p-4">
          <PackageIcon className="size-10 text-foreground" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          Tidak Ada Data Stok
        </h3>
        <p className="mt-1 max-w-sm font-body text-sm text-muted-foreground">
          Tidak ada varian produk yang ditemukan. Coba ubah filter pencarian.
        </p>
      </div>
    );
  }

  /* ── Table ── */
  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full border-collapse text-left font-body">
          <thead>
            <tr className="border-b border-border bg-accent-soft-blue/40 font-heading text-xs uppercase tracking-wider text-foreground">
              <th className="px-4 py-3.5 font-bold">Produk</th>
              <th className="px-4 py-3.5 font-bold">Varian</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-4 py-3.5 font-bold">Stok / Kuota</th>
              <th className="px-4 py-3.5 font-bold">Harga</th>
              <th className="px-4 py-3.5 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {data.map((row) => (
              <tr
                key={row.variant_id}
                className="transition-colors duration-150 hover:bg-muted/40"
              >
                {/* Produk */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-yellow/30">
                      <PackageIcon className="size-4 text-foreground" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-foreground leading-tight">
                        {row.product_name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        SKU:{" "}
                        <code className="font-mono">{row.product_sku}</code>
                        {" · "}
                        {row.category_name}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Varian */}
                <td className="px-4 py-3">
                  <p className="font-heading font-semibold text-foreground">
                    {row.variant_name}
                  </p>
                  <span className="rounded-lg bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {row.variant_sku}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <ProductStatusBadge status={row.status} />
                </td>

                {/* Stok */}
                <td className="px-4 py-3">
                  <StockBadge stock={row.stock} />
                  {row.stock <= LOW_STOCK_THRESHOLD && (
                    <p className="mt-0.5 font-body text-[11px] text-amber-600 dark:text-amber-400">
                      {row.stock === 0 ? "Habis" : "Stok menipis"}
                    </p>
                  )}
                </td>

                {/* Harga */}
                <td className="px-4 py-3">
                  <span className="font-heading font-semibold text-foreground">
                    {formatIDR(row.price)}
                  </span>
                </td>

                {/* Aksi */}
                <td className="px-4 py-3 text-right">
                  {onAdjust && (
                    <Button
                      type="button"
                      variant="accent-yellow"
                      size="xs"
                      neo={false}
                      onClick={() => onAdjust(row)}
                      disabled={isAdjustingId === row.variant_id}
                      title="Atur Stok"
                    >
                      <SlidersHorizontalIcon className="size-3.5" />
                      <span>Atur Stok</span>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && onPageChange && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
