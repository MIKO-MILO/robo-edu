"use client";

import React from "react";
import { QrCode, Building2, Wallet, CreditCard } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/utils";
import type { PaymentMethodBreakdownItem } from "@/types";

export interface PaymentMethodCardProps {
  methods: PaymentMethodBreakdownItem[];
  isLoading?: boolean;
  className?: string;
}

export function PaymentMethodCard({
  methods,
  isLoading = false,
  className,
}: PaymentMethodCardProps) {
  const getMethodIcon = (key: string) => {
    switch (key) {
      case "QRIS":
        return <QrCode className="size-5" />;
      case "BANK_TRANSFER":
        return <Building2 className="size-5" />;
      case "E_WALLET":
        return <Wallet className="size-5" />;
      case "CREDIT_CARD":
        return <CreditCard className="size-5" />;
      default:
        return <Wallet className="size-5" />;
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
          <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-blue text-[#0C4A6E] border border-border neo-shadow-icon shrink-0">
            <QrCode className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Breakdown Metode Pembayaran
            </h3>
            <p className="font-body text-xs text-muted-foreground font-medium">
              Porsi transaksi via QRIS, Transfer Bank, E-Wallet, dan Kartu Kredit
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-2 space-y-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        ) : methods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Wallet className="size-10 mb-2 opacity-40 stroke-[1.5]" />
            <p className="font-body text-sm font-semibold">
              Belum ada data pembayaran
            </p>
          </div>
        ) : (
          methods.map((item, index) => (
            <div
              key={item.method_key || index}
              className="p-3.5 rounded-2xl border border-border/20 bg-background space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl border border-border/30 shrink-0 ${item.color_class}`}
                  >
                    {getMethodIcon(item.method_key)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body font-bold text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatNumber(item.total_transactions)} Transaksi
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-heading font-extrabold text-sm text-foreground block">
                    {formatRupiah(item.total_revenue)}
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {item.percentage}% Share
                  </span>
                </div>
              </div>

              {/* Progress percentage bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/15">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color_class}`}
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/15 flex items-center justify-between text-xs text-muted-foreground">
        <span>Menampilkan 4 metode pembayaran</span>
        <span className="font-semibold text-success">Instan Settlement</span>
      </div>
    </div>
  );
}
