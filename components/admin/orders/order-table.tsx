"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminOrderRow } from "./order-list-types";

export interface OrderTableProps {
  data: AdminOrderRow[];
  isLoading?: boolean;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

const SKELETON_ROWS = 5;

/**
 * Organism — tabel utama daftar pesanan admin.
 * - Klik baris atau tombol "Detail" → navigasi ke halaman detail.
 * - Loading state: skeleton rows.
 * - Empty state: icon + pesan.
 * Saat backend siap, ganti prop `data` dengan hasil API hook.
 */
export function OrderTable({ data, isLoading = false }: OrderTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4">No. Order</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Item &amp; Produk</th>
              <th className="py-3.5 px-4">Total Tagihan</th>
              <th className="py-3.5 px-4">Status Pesanan</th>
              <th className="py-3.5 px-4">Pembayaran</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="size-8 text-muted-foreground" />
                    <p className="font-heading font-bold text-sm">
                      Tidak ada pesanan ditemukan
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
              data.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  {/* Order Number & Date */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                      {order.order_number}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="size-3" />
                      {formatDate(order.created_at)}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.customer_email}
                    </div>
                  </td>

                  {/* Item */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div
                      className="truncate font-medium text-foreground text-xs"
                      title={order.first_item_name}
                    >
                      {order.first_item_name}
                    </div>
                    {order.item_count > 1 && (
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        +{order.item_count - 1} produk lainnya
                      </div>
                    )}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-bold text-foreground">
                      {formatIDR(order.total)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {order.payment_method}
                    </div>
                  </td>

                  {/* Order Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.status} size="sm" neo />
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={order.payment_status} size="sm" />
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
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
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
