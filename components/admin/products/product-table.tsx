import React from "react";
import Image from "next/image";
import type { ProductListItem, PaginationMeta, UUID } from "@/types";
import { ProductStatusBadge } from "./product-status-badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2Icon, Trash2Icon, PackageIcon } from "lucide-react";

export interface ProductTableProps {
  data: ProductListItem[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onEdit?: (product: ProductListItem) => void;
  onDelete?: (id: UUID) => void;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-2xl border-2 border-[#3D2900] bg-card p-4 neo-shadow">
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
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#3D2900] bg-card p-12 text-center neo-shadow">
        <div className="p-4 rounded-full bg-accent-yellow/30 border-2 border-[#3D2900] mb-4">
          <PackageIcon className="size-10 text-[#3D2900]" />
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
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border-2 border-[#3D2900] bg-card neo-shadow">
        <table className="w-full text-left border-collapse font-body">
          <thead>
            <tr className="border-b-2 border-[#3D2900] bg-accent-soft-blue/40 text-foreground font-heading text-xs uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">Produk</th>
              <th className="py-3.5 px-4 font-bold">Kategori</th>
              <th className="py-3.5 px-4 font-bold">Harga Base</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y border-border/60 text-sm">
            {data.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-muted/40 transition-colors duration-150"
              >
                {/* Thumbnail & Product Info */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border-2 border-[#3D2900] bg-muted shadow-[2px_2px_0px_#3D2900]">
                      {product.primary_image_url ? (
                        <Image
                          src={product.primary_image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-accent-yellow/20 text-[#3D2900]">
                          <PackageIcon className="size-6" />
                        </div>
                      )}
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

                {/* Status */}
                <td className="py-3 px-4">
                  <ProductStatusBadge status={product.status} />
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <Button
                        type="button"
                        variant="accent-yellow"
                        size="xs"
                        neo
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
                        neo
                        onClick={() => onDelete(product.id)}
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
    </div>
  );
}
