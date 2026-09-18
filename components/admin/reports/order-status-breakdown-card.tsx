"use client";

import React from "react";
import { CheckCircle2, Clock, PackageCheck, XCircle, RotateCcw, AlertCircle } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/utils";
import type { OrderStatusBreakdownItem } from "@/types";

export interface OrderStatusBreakdownCardProps {
  statuses: OrderStatusBreakdownItem[];
  isLoading?: boolean;
  className?: string;
}

export function OrderStatusBreakdownCard({
  statuses,
  isLoading = false,
  className,
}: OrderStatusBreakdownCardProps) {
  const getStatusIcon = (key: string) => {
    switch (key) {
      case "COMPLETED":
        return <CheckCircle2 className="size-4 text-success" />;
      case "PROCESSING":
        return <PackageCheck className="size-4 text-primary" />;
      case "PENDING":
        return <Clock className="size-4 text-warning" />;
      case "CANCELLED":
        return <XCircle className="size-4 text-danger" />;
      case "REFUNDED":
        return <RotateCcw className="size-4 text-[#831843]" />;
      default:
        return <AlertCircle className="size-4 text-muted-foreground" />;
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
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft-blue text-[#103B5E] border border-border neo-shadow-icon shrink-0">
            <PackageCheck className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Detail Status Pesanan Lengkap
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Rincian status order termasuk pesanan selesai, batal, dan pengembalian (refund)
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="py-2 space-y-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : statuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <PackageCheck className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada rincian status pesanan
            </p>
          </div>
        ) : (
          statuses.map((item, index) => (
            <div
              key={item.status_key || index}
              className="p-3.5 rounded-2xl border border-border/20 bg-background space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex size-8 items-center justify-center rounded-xl border shrink-0 ${item.color}`}
                  >
                    {getStatusIcon(item.status_key)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body font-bold text-sm text-foreground truncate">
                      {item.label}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {formatNumber(item.count)} Transaksi ({item.percentage}%)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-extrabold text-sm text-foreground block">
                    {formatRupiah(item.total_amount)}
                  </span>
                  {item.status_key === "CANCELLED" && (
                    <span className="text-[11px] font-bold text-danger">
                      Rate Batal: {item.percentage}%
                    </span>
                  )}
                  {item.status_key === "REFUNDED" && (
                    <span className="text-[11px] font-bold text-[#831843]">
                      Refund Rate: {item.percentage}%
                    </span>
                  )}
                  {item.status_key === "COMPLETED" && (
                    <span className="text-[11px] font-bold text-success">
                      Berhasil Sukses
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/15">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Transparansi audit order</span>
        <span className="font-semibold text-primary">Tervalidasi Sistem</span>
      </div>
    </div>
  );
}
