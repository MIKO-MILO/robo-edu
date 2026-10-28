"use client";

import React, { useState } from "react";
import type { Category, PaginationMeta, UUID } from "@/types";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2Icon, Trash2Icon, LayersIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";

export interface CategoryTableProps {
  data: Category[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (id: UUID) => void | Promise<void>;
  isDeletingId?: UUID | null;
}

export function CategoryTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onEdit,
  onDelete,
  isDeletingId,
}: CategoryTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

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
              className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
            >
              <div className="space-y-2 flex-1">
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
        <div className="p-4 rounded-full bg-accent-yellow/30 border border-border mb-4">
          <LayersIcon className="size-10 text-foreground" />
        </div>
        <h3 className="font-heading font-bold text-lg text-foreground">
          Tidak Ada Kategori
        </h3>
        <p className="font-body text-sm text-muted-foreground mt-1 max-w-sm">
          Belum ada kategori yang tersedia atau tidak ada yang cocok dengan pencarian.
        </p>
      </div>
    );
  }

  /* ── Table ── */
  return (
    <>
      <div className="w-full space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="border-b border-border bg-accent-soft-blue/40 text-foreground font-heading text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Nama Kategori</th>
                <th className="py-3.5 px-4 font-bold">Slug</th>
                <th className="py-3.5 px-4 font-bold">Deskripsi</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {data.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-muted/40 transition-colors duration-150"
                >
                  {/* Nama */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-yellow/30 border border-border">
                        <LayersIcon className="size-4 text-foreground" />
                      </div>
                      <span className="font-heading font-bold text-foreground">
                        {category.name}
                      </span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                      {category.slug}
                    </span>
                  </td>

                  {/* Deskripsi */}
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {category.description || (
                        <span className="italic opacity-50">Tidak ada deskripsi</span>
                      )}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {category.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-bg text-success text-xs font-bold border border-success/20">
                        <CheckCircle2Icon className="size-3.5" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                        <XCircleIcon className="size-3.5" />
                        Nonaktif
                      </span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          type="button"
                          variant="accent-yellow"
                          size="xs"
                          neo={false}
                          onClick={() => onEdit(category)}
                          title="Edit Kategori"
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
                          onClick={() => setDeleteTarget(category)}
                          disabled={isDeletingId === category.id}
                          title="Hapus Kategori"
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
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Hapus Kategori"
        description="Kategori yang dihapus tidak dapat dikembalikan. Produk yang terhubung ke kategori ini mungkin terpengaruh."
        itemName={deleteTarget?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingId === deleteTarget?.id}
        confirmText="Ya, Hapus Kategori"
      />
    </>
  );
}
