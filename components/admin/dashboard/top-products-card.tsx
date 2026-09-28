"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Flame, ChevronRight, PackageCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatNumber, formatRupiah, cn } from "@/lib/utils";
import type { Money, UUID } from "@/types";

export interface TopProductItem {
  product_id: UUID;
  name: string;
  total_sold: number;
  price?: Money;
  category?: string;
}

export interface TopProductsCardProps {
  products: TopProductItem[];
  isLoading?: boolean;
  className?: string;
}

export function TopProductsCard({
  products,
  isLoading = false,
  className,
}: TopProductsCardProps) {
  const maxSold = Math.max(...products.map((p) => p.total_sold), 1);

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
      className={`flex flex-col bg-card rounded-3xl border-2 border-border neo-shadow p-5 md:p-6 justify-between ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b-2 border-border/15">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-orange text-secondary border border-border neo-shadow-icon shrink-0">
            <Flame className="size-5 text-[#D97706] fill-[#F59E0B]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Produk Terlaris
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Produk dengan volume penjualan tertinggi bulan ini
            </p>
          </div>
        </div>

        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0 flex items-center gap-1")}
        >
          <span>Lihat Semua</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="py-4 space-y-4 flex-1">
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
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <PackageCheck className="size-10 mb-2 opacity-50 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada data produk terlaris
            </p>
          </div>
        ) : (
          products.slice(0, 5).map((item, index) => {
            const rank = index + 1;
            const percentage = Math.round((item.total_sold / maxSold) * 100);

            return (
              <div
                key={item.product_id || index}
                className="group relative flex flex-col p-3 rounded-2xl border border-border/20 bg-background hover:bg-muted/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-7 items-center justify-center rounded-xl border text-xs shrink-0 ${getRankBadgeStyle(
                        rank
                      )}`}
                    >
                      {rank === 1 ? (
                        <Trophy className="size-3.5 fill-current" />
                      ) : (
                        `#${rank}`
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-body font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </p>
                      {item.price !== undefined && (
                        <p className="text-xs font-semibold text-muted-foreground">
                          {formatRupiah(item.price)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-heading font-extrabold text-sm text-foreground">
                      {formatNumber(item.total_sold)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground block">
                      terjual
                    </span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/20">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Menampilkan 5 produk teratas</span>
        <span className="font-semibold text-primary">Diperbarui otomatis</span>
      </div>
    </div>
  );
}
