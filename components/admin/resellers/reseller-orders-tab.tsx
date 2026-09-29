import * as React from "react";
import { ShoppingBag, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
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
 * Molecule — Daftar pesanan terkini pemohon reseller untuk konteks review admin.
 * Membantu admin menilai kelayakan pengajuan berdasarkan riwayat transaksi.
 */
export function ResellerOrdersTab({ orders }: ResellerOrdersTabProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs">
        <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
          <ShoppingBag className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Riwayat Pesanan
          </h3>
        </div>
        <div className="text-center py-6 text-xs text-muted-foreground italic">
          Belum ada riwayat pesanan.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-5 rounded-2xl border-2 border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-sm text-foreground">
            Riwayat Pesanan Terkini
          </h3>
        </div>
        <span className="text-[11px] font-heading font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {orders.length} Pesanan
        </span>
      </div>

      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div className="space-y-1">
              <div className="font-heading font-bold text-xs text-foreground">
                {order.order_number}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {order.first_item_name}
                {order.item_count > 1 && ` + ${order.item_count - 1} produk lainnya`}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(order.created_at)}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
              <StatusBadge status={order.status} size="sm" showDot={false} />
              <div className="font-heading font-bold text-sm text-foreground">
                {formatIDR(order.total)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
