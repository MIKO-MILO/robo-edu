"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Eye, XCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminComplaintRow } from "./complaint-list-types";

export interface ComplaintTableProps {
  data: AdminComplaintRow[];
  isLoading?: boolean;
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

const SKELETON_ROWS = 5;

/**
 * Organism — tabel utama daftar klaim admin.
 * - Klik baris atau tombol "Detail" → navigasi ke halaman detail klaim.
 * - Loading state: skeleton rows.
 * - Empty state: icon + pesan informatif.
 */
export function ComplaintTable({ data, isLoading = false }: ComplaintTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4">Subjek Klaim</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Produk yang Diklaim</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Tgl. Diajukan</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="size-8 text-muted-foreground" />
                    <p className="font-heading font-bold text-sm text-foreground">
                      Tidak ada klaim ditemukan
                    </p>
                    <p className="text-xs">
                      Coba ubah kata kunci pencarian atau filter status.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              data.map((complaint) => (
                <tr
                  key={complaint.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
                >
                  {/* Subject */}
                  <td className="py-3.5 px-4 max-w-[220px]">
                    <div
                      className="font-semibold text-foreground group-hover:text-primary transition-colors truncate"
                      title={complaint.subject}
                    >
                      {complaint.subject}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                      #{complaint.order_number}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[140px]">{complaint.customer_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
                      {complaint.customer_email}
                    </div>
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <Package className="size-3.5 text-muted-foreground shrink-0" />
                      <span
                        className="text-xs font-medium text-foreground truncate"
                        title={complaint.product_name}
                      >
                        {complaint.product_name}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={complaint.status} size="sm" neo />
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" />
                      {formatDate(complaint.created_at)}
                    </div>
                  </td>

                  {/* Action */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
                      className="gap-1 rounded-xl"
                    >
                      <Eye className="size-3.5" />
                      <span>Detail</span>
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
