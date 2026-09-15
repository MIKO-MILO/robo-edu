import * as React from "react";
import { ShoppingCart, Clock, Truck, CheckCircle2 } from "lucide-react";
import { OrderKpiCard } from "./order-kpi-card";
import type { OrderStats } from "./order-list-types";

export interface OrderStatsProps {
  stats: OrderStats;
}

/**
 * Molecule — grid 4 KPI cards ringkasan status pesanan.
 * Menerima `stats` yang sudah dihitung di parent / hook.
 */
export function OrderStatsGrid({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <OrderKpiCard
        icon={<ShoppingCart className="size-5" />}
        label="Total Pesanan"
        value={stats.total}
        iconColorClass="bg-primary/10 text-primary"
      />
      <OrderKpiCard
        icon={<Clock className="size-5" />}
        label="Menunggu"
        value={stats.pending}
        iconColorClass="bg-warning/10 text-warning"
      />
      <OrderKpiCard
        icon={<Truck className="size-5" />}
        label="Diproses / Kirim"
        value={stats.processing_shipped}
        iconColorClass="bg-purple-500/10 text-purple-600"
      />
      <OrderKpiCard
        icon={<CheckCircle2 className="size-5" />}
        label="Selesai"
        value={stats.completed}
        iconColorClass="bg-success/10 text-success"
      />
    </div>
  );
}
