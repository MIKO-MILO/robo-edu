"use client";

import React from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { SalesMetricsOverview } from "@/types";

export interface SalesMetricsCardsProps {
  metrics: SalesMetricsOverview;
  isLoading?: boolean;
}

export function SalesMetricsCards({
  metrics,
  isLoading = false,
}: SalesMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-3xl bg-muted/60 border-2 border-border/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* 1. LAPORAN REVENUE */}
      <StatCard
        title="Total Revenue"
        value={formatRupiah(metrics.total_revenue)}
        variant="success"
        icon={<DollarSign className="size-6 stroke-[2.5]" />}
        trend={{
          value: metrics.growth_percentage,
          label: "vs periode lalu",
        }}
        badgeText="Omzet Bersih"
      />

      {/* 2. LAPORAN PESANAN */}
      <StatCard
        title="Total Pesanan"
        value={formatNumber(metrics.total_orders)}
        variant="primary"
        icon={<ShoppingBag className="size-6 stroke-[2.5]" />}
        subtitle={`${metrics.completed_orders} selesai · ${metrics.pending_orders} pending`}
        badgeText={`${metrics.completed_orders} Selesai`}
      />

      {/* 3. METRIK AOV (AVERAGE ORDER VALUE) */}
      <StatCard
        title="Rata-Rata Transaksi (AOV)"
        value={formatRupiah(metrics.average_order_value)}
        variant="purple"
        icon={<CreditCard className="size-6 stroke-[2.5]" />}
        subtitle="Nilai rata-rata per order"
        badgeText="Efisiensi Sales"
      />

      {/* 4. METRIK REPEAT PURCHASE & CUSTOMER */}
      <StatCard
        title="Repeat Order Rate"
        value={`${metrics.repeat_customer_rate}%`}
        variant="info"
        icon={<Users className="size-6 stroke-[2.5]" />}
        subtitle={`${formatNumber(metrics.total_items_sold)} unit produk terjual`}
        badgeText="Loyalitas Customer"
      />
    </div>
  );
}
