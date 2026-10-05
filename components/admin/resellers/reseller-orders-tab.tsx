import * as React from "react";
import { ShoppingBag, Calendar, Package } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { ResellerOrderSummary } from "./reseller-list-types";

export interface ResellerOrdersTabProps {
  orders: ResellerOrderSummary[];
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
  }).format(new Date(isoString));
}

/**
 * Molecule — Daftar pesanan terkini pemohon reseller (Neo-Brutalist).
 * Membantu admin menilai kelayakan pengajuan berdasarkan riwayat transaksi.
 * Sesuai PRD Bab 13 (Manajemen Pesanan) dan konteks review FR-010.
 */
export function ResellerOrdersTab({ orders }: ResellerOrdersTabProps) {
  const isEmpty = orders.length === 0;

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      {/* Card header */}
      <div className="p-4 border-b border-border bg-accent-orange/60 flex items-center justify-between">
        <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-foreground">
          <ShoppingBag className="size-[18px]" />
          Riwayat Pesanan Terakhir
        </h2>
        <span className="border border-border bg-card text-[10px] font-mono px-2 py-0.5 font-bold text-foreground">
          {orders.length} Pesanan
        </span>
      </div>

      <div className="p-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Package className="size-10 opacity-30" />
            <p className="text-xs font-body italic">Belum ada riwayat pesanan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  "p-4 border border-border rounded-xl bg-background",
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                )}
              >
                {/* Left: Order info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="font-heading font-bold text-xs text-foreground">
                    {order.order_number}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-body truncate">
                    {order.first_item_name}
                    {order.item_count > 1 && (
                      <span className="ml-1 text-primary font-semibold">
                        + {order.item_count - 1} produk lainnya
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-body">
                    <Calendar className="size-3 shrink-0" />
                    {formatDate(order.created_at)}
                  </div>
                </div>

                {/* Right: Status + Amount */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <StatusBadge status={order.status} size="sm" showDot={false} />
                  <div className="font-heading font-bold text-sm text-foreground">
                    {formatIDR(order.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
