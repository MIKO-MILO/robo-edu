"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, Package, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UUID } from "@/types";

export interface LowStockItemProps {
  product_id: UUID;
  variant_id?: UUID;
  name: string;
  variant_name?: string;
  stock: number;
  threshold?: number;
}

export interface LowStockCardProps {
  items: LowStockItemProps[];
  isLoading?: boolean;
  className?: string;
}

export function LowStockCard({
  items,
  isLoading = false,
  className,
}: LowStockCardProps) {
  return (
    <div
      className={`flex flex-col bg-card rounded-3xl border-2 border-border neo-shadow p-5 md:p-6 justify-between ${
        className || ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b-2 border-border/15">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-peach text-danger border border-border neo-shadow-icon shrink-0">
            <AlertTriangle className="size-5 text-danger fill-danger/20" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Stok Menipis
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Produk & varian yang membutuhkan restock segera
            </p>
          </div>
        </div>

        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "shrink-0 flex items-center gap-1")}
        >
          <span>Stok Produk</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <div className="py-4 space-y-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <ShieldAlert className="size-10 mb-2 text-success opacity-80 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold text-foreground">
              Semua Stok Aman!
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Tidak ada produk dengan kuota stok di bawah batas minimal.
            </p>
          </div>
        ) : (
          items.slice(0, 5).map((item, index) => {
            const isCritical = item.stock <= 2;

            return (
              <div
                key={item.variant_id || item.product_id || index}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border/20 bg-background hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl border border-border/40 shrink-0 ${
                      isCritical
                        ? "bg-accent-peach/60 text-danger"
                        : "bg-accent-yellow/60 text-warning"
                    }`}
                  >
                    <Package className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-body font-bold text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs font-semibold text-muted-foreground truncate">
                        Varian: {item.variant_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-bold neo-shadow-icon ${
                      isCritical
                        ? "bg-accent-peach text-danger border-danger/40"
                        : "bg-accent-yellow text-secondary border-secondary/30"
                    }`}
                  >
                    Sisa {item.stock} unit
                  </div>

                  <Link
                    href={`/admin/products/${item.product_id}/edit`}
                    title="Edit Stok"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "xs" }),
                      "p-1 h-7 w-7 flex items-center justify-center shrink-0"
                    )}
                  >
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-danger flex items-center gap-1">
          ● {items.length} item perlu perhatian
        </span>
        <Link
          href="/admin/products"
          className="font-bold text-primary hover:underline"
        >
          Kelola Stok →
        </Link>
      </div>
    </div>
  );
}
