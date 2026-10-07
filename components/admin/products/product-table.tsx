import React, { useRef, useState } from "react";
import type { ProductListItem, PaginationMeta, ProductStatus } from "@/types";
import { ProductStatusBadge } from "./product-status-badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2Icon, Trash2Icon, PackageIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductTableProps {
  data: ProductListItem[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onEdit?: (product: ProductListItem) => void;
  onDelete?: (product: ProductListItem) => void;
  onStatusChange?: (product: ProductListItem, newStatus: ProductStatus) => void;
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "ACTIVE",       label: "Aktif" },
  { value: "DRAFT",        label: "Draft" },
  { value: "INACTIVE",     label: "Nonaktif" },
  { value: "OUT_OF_STOCK", label: "Stok Habis" },
];

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Inline Status Dropdown ────────────────────────────────────────────────

function StatusDropdown({
  product,
  onStatusChange,
}: {
  product: ProductListItem;
  onStatusChange: (product: ProductListItem, newStatus: ProductStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Tutup kalau klik di luar
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Badge yang bisa diklik */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Klik untuk ubah status"
        className="flex items-center gap-1 group"
      >
        <ProductStatusBadge status={product.status} />
        <ChevronDownIcon
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[130px] rounded-2xl border-2 border-border bg-card shadow-lg overflow-hidden">
          {STATUS_OPTIONS.filter((opt) => opt.value !== product.status).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setOpen(false);
                onStatusChange(product, opt.value);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body text-foreground hover:bg-muted/50 transition-colors"
            >
              <ProductStatusBadge status={opt.value} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Table ─────────────────────────────────────────────────────────────

export function ProductTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
            >
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
        <div className="p-4 rounded-full bg-accent-yellow/30 border border-border mb-4">
          <PackageIcon className="size-10 text-foreground" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground">Tidak Ada Produk</h3>
        <p className="font-body text-sm text-muted-foreground mt-1 max-w-sm">
          Belum ada produk yang tersedia atau tidak ada produk yang cocok dengan filter pencarian.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left border-collapse font-body">
          <thead>
            <tr className="border-b border-border bg-accent-soft-blue/40 text-foreground font-heading text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">Produk</th>
              <th className="py-3.5 px-4 font-bold">Kategori</th>
              <th className="py-3.5 px-4 font-bold">Harga Base</th>
              <th className="py-3.5 px-4 font-bold">
                Status
                <span className="ml-1 text-[10px] font-normal text-muted-foreground normal-case">
                  (klik untuk ubah)
                </span>
              </th>
              <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {data.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-muted/40 transition-colors duration-150"
              >
                {/* Thumbnail & Info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          product.primary_image_url &&
                          !product.primary_image_url.includes("coresg-normal.trae.ai") &&
                          !product.primary_image_url.includes("text_to_image")
                            ? product.primary_image_url
                            : `https://placehold.co/48x48/e8f4fd/2483d0?text=${encodeURIComponent(
                                product.name.slice(0, 2).toUpperCase(),
                              )}`
                        }
                        alt={product.name}
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            `https://placehold.co/48x48/e8f4fd/2483d0?text=${encodeURIComponent(
                              product.name.slice(0, 2).toUpperCase(),
                            )}`;
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-foreground line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 font-medium text-foreground">
                  {product.category?.name || "-"}
                </td>

                {/* Price */}
                <td className="py-3 px-4 font-bold text-foreground">
                  {formatIDR(product.price.base_price)}
                  {product.price.reseller_price !== null && (
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-normal">
                      Reseller: {formatIDR(product.price.reseller_price)}
                    </div>
                  )}
                </td>

                {/* Status — inline dropdown jika onStatusChange tersedia */}
                <td className="py-3 px-4">
                  {onStatusChange ? (
                    <StatusDropdown
                      product={product}
                      onStatusChange={onStatusChange}
                    />
                  ) : (
                    <ProductStatusBadge status={product.status} />
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Button
                        type="button"
                        variant="accent-yellow"
                        size="xs"
                        neo={false}
                        onClick={() => onEdit(product)}
                        title="Edit Produk"
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
                        onClick={() => onDelete(product)}
                        title="Hapus Produk"
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
