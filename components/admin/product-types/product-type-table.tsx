"use client";

import React, { useState } from "react";
import type { ProductType, PaginationMeta, UUID } from "@/types";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TagIcon,
  Edit2Icon,
  Trash2Icon,
  CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";

export interface ProductTypeTableProps {
  data: ProductType[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onEdit?: (productType: ProductType) => void;
  onDelete?: (id: UUID) => void | Promise<void>;
  isDeletingId?: UUID | null;
}

export function ProductTypeTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
  isDeletingId,
}: ProductTypeTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !onDelete) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
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
          <TagIcon className="size-10 text-foreground" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">
          Tidak Ada Tipe Produk
        </h3>
        <p className="mt-1 max-w-sm font-body text-sm text-muted-foreground">
          Belum ada tipe produk yang tersedia atau tidak ada yang cocok dengan
          pencarian.
        </p>
      </div>
    );
  }

  /* ── Table ── */
  return (
    <>
      <div className="w-full space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full border-collapse text-left font-body">
            <thead>
              <tr className="border-b border-border bg-accent-soft-blue/40 font-heading text-xs uppercase tracking-wider text-foreground">
                <th className="px-4 py-3.5 font-bold">Nama Tipe Produk</th>
                <th className="px-4 py-3.5 font-bold">Slug</th>
                <th className="px-4 py-3.5 font-bold">Deskripsi</th>
                <th className="px-4 py-3.5 font-bold">Status</th>
                <th className="px-4 py-3.5 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {data.map((productType) => (
                <tr
                  key={productType.id}
                  className="transition-colors duration-150 hover:bg-muted/40"
                >
                  {/* Nama */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-accent-yellow/30">
                        <TagIcon className="size-4 text-foreground" />
                      </div>
                      <span className="font-heading font-bold text-foreground">
                        {productType.name}
                      </span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                      {productType.slug}
                    </span>
                  </td>

                  {/* Deskripsi */}
                  <td className="max-w-xs px-4 py-3">
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {productType.description || (
                        <span className="italic opacity-50">
                          Tidak ada deskripsi
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {productType.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success-bg px-2.5 py-1 text-xs font-bold text-success">
                        <CheckCircle2Icon className="size-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
                        <XCircleIcon className="size-3.5" />
                        Nonaktif
                      </span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          type="button"
                          variant="accent-yellow"
                          size="xs"
                          neo={false}
                          onClick={() => onEdit(productType)}
                          title="Edit Tipe Produk"
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
                          onClick={() => setDeleteTarget(productType)}
                          disabled={isDeletingId === productType.id}
                          title="Hapus Tipe Produk"
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

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus Tipe Produk"
        description="Tipe produk yang dihapus tidak dapat dikembalikan. Produk yang terhubung ke tipe ini mungkin terpengaruh."
        itemName={deleteTarget?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingId === deleteTarget?.id}
        confirmText="Ya, Hapus Tipe Produk"
      />
    </>
  );
}
