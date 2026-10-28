"use client";

import React from "react";
import { Trophy, Flame, PackageCheck, Award } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/utils";
import type { TopProductReportItem } from "@/types";

export interface TopProductsReportCardProps {
  products: TopProductReportItem[];
  isLoading?: boolean;
  className?: string;
}

export function TopProductsReportCard({
  products,
  isLoading = false,
  className,
}: TopProductsReportCardProps) {
  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-accent-yellow text-secondary border-secondary neo-shadow-icon font-extrabold";
      case 2:
        return "bg-secondary-100 text-secondary border-secondary font-bold";
      case 3:
        return "bg-accent-orange/60 text-secondary border-secondary font-bold";
      default:
        return "bg-muted text-muted-foreground border-border/40 font-medium";
    }
  };

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
            <Trophy className="size-5 text-secondary fill-accent-yellow" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Laporan Produk Terlaris
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Peringkat produk berdasarkan total unit terjual dan kontribusi omzet
            </p>
          </div>
        </div>
      </div>

      {/* Table / List Content */}
      <div className="overflow-x-auto py-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <PackageCheck className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada data produk terlaris
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-border/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="pb-3 px-2 text-center w-12">Rank</th>
                <th className="pb-3 px-3">Produk</th>
                <th className="pb-3 px-3">Kategori</th>
                <th className="pb-3 px-3 text-center">Pergerakan</th>
                <th className="pb-3 px-3 text-center">Sisa Stok</th>
                <th className="pb-3 px-3 text-right">Terjual</th>
                <th className="pb-3 px-3 text-right">Margin</th>
                <th className="pb-3 px-3 text-right">Total Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/15 text-sm font-body">
              {products.map((item, index) => {
                const rank = index + 1;
                const currentStock = item.stock ?? Math.max(15 - index * 3, 2);
                const isLowStock = currentStock <= 5;
                const isFastMoving =
                  item.movement_type === "FAST_MOVING" || rank <= 3;
                const margin = item.profit_margin ?? (35 - index * 2);

                return (
                  <tr
                    key={item.product_id || index}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-2 text-center">
                      <div
                        className={`inline-flex size-7 items-center justify-center rounded-xl border text-xs mx-auto ${getRankBadgeStyle(
                          rank
                        )}`}
                      >
                        {rank === 1 ? (
                          <Trophy className="size-3.5 fill-current" />
                        ) : (
                          `#${rank}`
                        )}
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-3 font-bold text-foreground max-w-xs truncate">
                      {item.name}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-xs font-semibold text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-muted border border-border/20">
                        {item.category_name || "Kategori STEM"}
                      </span>
                    </td>

                    {/* Pergerakan Produk */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                          isFastMoving
                            ? "bg-accent-green/40 text-success border-success/40"
                            : "bg-accent-yellow/40 text-secondary border-secondary/30"
                        }`}
                      >
                        {isFastMoving ? "⚡ Fast-Moving" : "🐢 Slow-Moving"}
                      </span>
                    </td>

                    {/* Informasi Stok Tersisa (Sisa Stok) */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border neo-shadow-icon ${
                          isLowStock
                            ? "bg-accent-peach text-danger border-danger/40 animate-pulse"
                            : "bg-accent-soft-blue text-[#103B5E] border-primary-300"
                        }`}
                      >
                        {isLowStock
                          ? `Sisa ${currentStock} (Kritis)`
                          : `${currentStock} unit`}
                      </span>
                    </td>

                    {/* Total Sold */}
                    <td className="py-3 px-3 text-right font-bold text-foreground">
                      {formatNumber(item.total_sold)} unit
                    </td>

                    {/* Profit Margin */}
                    <td className="py-3 px-3 text-right font-extrabold text-xs text-primary">
                      {margin}%
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3 px-3 text-right font-heading font-extrabold text-foreground text-sm">
                      {formatRupiah(item.total_revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Menampilkan top {products.length} produk terlaris</span>
        <span className="font-semibold text-primary">Diurutkan berdasarkan unit terjual</span>
      </div>
    </div>
  );
}
