"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatNumber } from "@/lib/utils";
import type { SalesReportPoint } from "@/types";

export interface RevenueChartCardProps {
  data: SalesReportPoint[];
  isLoading?: boolean;
  className?: string;
}

export function RevenueChartCard({
  data,
  isLoading = false,
  className,
}: RevenueChartCardProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "orders">("revenue");

  const maxRevenue = Math.max(...data.map((d) => d.total_revenue), 1);
  const maxOrders = Math.max(...data.map((d) => d.total_orders), 1);

  const totalRevenue = data.reduce((acc, curr) => acc + curr.total_revenue, 0);
  const totalOrders = data.reduce((acc, curr) => acc + curr.total_orders, 0);

  return (
    <div
      className={`flex flex-col bg-card rounded-3xl border-2 border-border neo-shadow p-5 md:p-6 justify-between space-y-4 ${
        className || ""
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-border/15">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-green text-[#1A472A] border border-border neo-shadow-icon shrink-0">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Tren Omzet Revenue & Pesanan
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Grafik rincian pertumbuhan penjualan per periode
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border/20 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("revenue")}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeTab === "revenue"
                ? "bg-card text-foreground neo-shadow-icon border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Revenue (Rp)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
              activeTab === "orders"
                ? "bg-card text-foreground neo-shadow-icon border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Jumlah Pesanan
          </button>
        </div>
      </div>

      {/* Overview Stat summary bar */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-background border border-border/20">
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Total Revenue Periode
          </span>
          <span className="font-heading font-extrabold text-lg md:text-xl text-success">
            {formatRupiah(totalRevenue)}
          </span>
        </div>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Total Volume Pesanan
          </span>
          <span className="font-heading font-extrabold text-lg md:text-xl text-primary">
            {formatNumber(totalOrders)} Order
          </span>
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="py-2 space-y-3 flex-1 min-h-[220px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Calendar className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Tidak ada data laporan untuk rentang tanggal terpilih
            </p>
          </div>
        ) : (
          data.map((point, index) => {
            const percentage =
              activeTab === "revenue"
                ? Math.round((point.total_revenue / maxRevenue) * 100)
                : Math.round((point.total_orders / maxOrders) * 100);

            return (
              <div
                key={point.period || index}
                className="space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-foreground font-mono">
                    {point.period}
                  </span>
                  <span className="text-muted-foreground">
                    {activeTab === "revenue"
                      ? formatRupiah(point.total_revenue)
                      : `${formatNumber(point.total_orders)} pesanan`}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-border/20 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeTab === "revenue"
                        ? "bg-accent-green text-success"
                        : "bg-primary text-primary-100"
                    }`}
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Menampilkan {data.length} titik periode</span>
        <span className="font-semibold text-primary flex items-center gap-1">
          <TrendingUp className="size-3.5" /> Terupdate real-time
        </span>
      </div>
    </div>
  );
}
