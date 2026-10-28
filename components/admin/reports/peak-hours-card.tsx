"use client";

import React from "react";
import { Clock, Zap, Flame } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/utils";
import type { PeakHourDataPoint } from "@/types";

export interface PeakHoursCardProps {
  hoursData: PeakHourDataPoint[];
  isLoading?: boolean;
  className?: string;
}

export function PeakHoursCard({
  hoursData,
  isLoading = false,
  className,
}: PeakHoursCardProps) {
  const maxOrders = Math.max(...hoursData.map((h) => h.order_count), 1);
  const peakItem = hoursData.find((h) => h.is_peak) || hoursData[0];

  return (
    <div
      className={`flex flex-col bg-card rounded-3xl border-2 border-border neo-shadow p-5 md:p-6 justify-between space-y-4 ${
        className || ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-border/15">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-yellow text-secondary border border-border neo-shadow-icon shrink-0">
            <Zap className="size-5 fill-current" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Waktu Puncak Pesanan (Peak Hours)
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Analisis jam tersibuk transaksi masuk untuk optimasi staf & stok
            </p>
          </div>
        </div>

        {peakItem && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-accent-orange/60 text-secondary border border-secondary neo-shadow-icon shrink-0">
            <Flame className="size-3.5 fill-current text-[#D97706]" />
            Peak: {peakItem.hour_label}
          </span>
        )}
      </div>

      {/* Heatmap Bar Chart */}
      <div className="py-2 flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : hoursData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Clock className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada data distribusi jam transaksi
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 items-end pt-4 min-h-[160px]">
            {hoursData.map((item, index) => {
              const heightPercent = Math.round(
                (item.order_count / maxOrders) * 100
              );

              return (
                <div
                  key={item.hour_label || index}
                  className="flex flex-col items-center space-y-2 group"
                >
                  {/* Order count tooltip text */}
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border transition-all ${
                      item.is_peak
                        ? "bg-accent-yellow text-secondary border-secondary neo-shadow-icon scale-110"
                        : "bg-muted text-muted-foreground border-border/20 group-hover:bg-primary group-hover:text-primary-100"
                    }`}
                  >
                    {item.order_count}
                  </span>

                  {/* Visual Vertical Bar */}
                  <div className="w-full bg-muted/70 rounded-xl h-24 flex items-end p-1 border border-border/15">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        item.is_peak
                          ? "bg-accent-yellow border border-secondary"
                          : "bg-primary group-hover:bg-primary-600"
                      }`}
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    />
                  </div>

                  {/* Hour label */}
                  <span className="text-[11px] font-bold text-muted-foreground font-mono">
                    {item.hour_label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Diukur dari akumulasi transaksi 30 hari</span>
        <span className="font-semibold text-secondary">
          Jam Tersibuk: 13:00 - 16:00 WIB
        </span>
      </div>
    </div>
  );
}
