"use client";

import React from "react";
import { Download, RefreshCw, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReportsHeaderProps {
  onRefresh?: () => void;
  onExportCSV?: () => void;
  isFetching?: boolean;
}

export function ReportsHeader({
  onRefresh,
  onExportCSV,
  isFetching = false,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-border/15">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Laporan Penjualan
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-accent-yellow text-secondary border border-secondary neo-shadow-icon">
            <Sparkles className="size-3 fill-current" />
            Analytics
          </span>
        </div>
        <p className="font-body text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Pantau omzet revenue, tren pesanan, performa kategori, dan produk terlaris.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="default"
          neo
          onClick={onRefresh}
          disabled={isFetching}
          className="bg-card"
        >
          <RefreshCw
            className={`size-4 ${isFetching ? "animate-spin text-primary" : ""}`}
          />
          <span>{isFetching ? "Memuat..." : "Refresh"}</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          neo
          onClick={onExportCSV}
          className="flex items-center gap-2"
        >
          <Download className="size-4" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
}
