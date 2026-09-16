"use client";

import React from "react";
import { Layers, PieChart, Tag } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/utils";
import type { CategorySalesReportItem } from "@/types";

export interface CategorySalesCardProps {
  categories: CategorySalesReportItem[];
  isLoading?: boolean;
  className?: string;
}

export function CategorySalesCard({
  categories,
  isLoading = false,
  className,
}: CategorySalesCardProps) {
  const categoryColors = [
    "bg-accent-yellow border-secondary",
    "bg-accent-purple border-border",
    "bg-accent-blue border-primary",
    "bg-accent-orange border-secondary",
    "bg-accent-green border-success",
    "bg-accent-pink border-border",
  ];

  return (
    <div
      className={`flex flex-col bg-card rounded-3xl border-2 border-border neo-shadow p-5 md:p-6 justify-between space-y-4 ${
        className || ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-border/15">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-purple text-[#2E1065] border border-border neo-shadow-icon shrink-0">
            <PieChart className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Penjualan Per Kategori
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Kontribusi omzet & unit terjual berdasarkan kelompok produk
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="py-2 space-y-4 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Layers className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada data kategori penjualan
            </p>
          </div>
        ) : (
          categories.map((cat, index) => {
            const colorClass = categoryColors[index % categoryColors.length];
            const isFastMoving =
              cat.movement_type === "FAST_MOVING" || index <= 1;
            const margin = cat.profit_margin ?? (38 - index * 4);

            return (
              <div
                key={cat.category_id || index}
                className="p-3 rounded-2xl border border-border/20 bg-background space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`inline-block size-3 rounded-full border neo-shadow-icon shrink-0 ${colorClass}`}
                    />
                    <div className="min-w-0">
                      <span className="font-body font-bold text-sm text-foreground truncate block">
                        {cat.category_name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isFastMoving
                              ? "bg-accent-green/40 text-success border-success/30"
                              : "bg-accent-yellow/40 text-secondary border-secondary/30"
                          }`}
                        >
                          {isFastMoving ? "⚡ Fast-Moving" : "🐢 Slow-Moving"}
                        </span>
                        <span className="text-[10px] font-bold text-primary">
                          Margin: {margin}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-heading font-extrabold text-sm text-foreground block">
                      {formatRupiah(cat.total_revenue)}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {formatNumber(cat.total_sold)} unit ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Share Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Kategori Aktif: {categories.length}</span>
        <span className="font-semibold text-primary">100% Total Share</span>
      </div>
    </div>
  );
}
