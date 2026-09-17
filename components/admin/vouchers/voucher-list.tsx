import React from "react";
import type { Voucher, PaginationMeta, UUID } from "@/types";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit2Icon, Trash2Icon, TicketIcon } from "lucide-react";

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

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
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
    </div>
  );
}
