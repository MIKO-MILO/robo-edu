import * as React from "react";
import { CircleDollarSign, ShoppingBag, TrendingUp, Calendar } from "lucide-react";
import { CustomerKpiCard } from "./customer-kpi-card";

export interface CustomerMetricCardsProps {
  totalSpent: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
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
 * Molecule — 4 Kartu metrik performa belanja pelanggan (LTV, Total Orders, AOV, Last Order).
 */
export function CustomerMetricCards({
  totalSpent,
  totalOrders,
  completedOrders,
  averageOrderValue,
  lastOrderAt,
}: CustomerMetricCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Belanja (LTV) */}
      <CustomerKpiCard
        icon={<CircleDollarSign className="size-5" />}
        label="Total Belanja (LTV)"
        value={formatIDR(totalSpent)}
        iconColorClass="bg-primary/10 text-primary"
      />

      {/* Total Pesanan */}
      <CustomerKpiCard
        icon={<ShoppingBag className="size-5" />}
        label="Total Pesanan"
        value={`${totalOrders} (${completedOrders} Selesai)`}
        iconColorClass="bg-success/10 text-success"
      />

      {/* Rata-rata Pesanan (AOV) */}
      <CustomerKpiCard
        icon={<TrendingUp className="size-5" />}
        label="Rata-rata Order (AOV)"
        value={formatIDR(averageOrderValue)}
        iconColorClass="bg-accent-purple/40 text-foreground"
      />

      {/* Pesanan Terakhir */}
      <CustomerKpiCard
        icon={<Calendar className="size-5" />}
        label="Pesanan Terakhir"
        value={lastOrderAt ? formatDate(lastOrderAt) : "Belum Ada"}
        iconColorClass="bg-warning/10 text-warning"
      />
    </div>
  );
}
