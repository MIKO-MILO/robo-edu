"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderPeriod = "3_months" | "6_months" | "2024" | "2023" | "all";

export interface PeriodOption {
  value: OrderPeriod;
  label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "3_months", label: "3 Bulan Terakhir" },
  { value: "6_months", label: "6 Bulan Terakhir" },
  { value: "2024", label: "Tahun 2024" },
  { value: "2023", label: "Tahun 2023" },
  { value: "all", label: "Semua Waktu" },
];

export interface OrderPeriodSelectProps {
  value: OrderPeriod;
  onChange: (value: OrderPeriod) => void;
  className?: string;
}

export function OrderPeriodSelect({
  value,
  onChange,
  className,
}: OrderPeriodSelectProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as OrderPeriod)}
        aria-label="Filter periode waktu pesanan"
        className="appearance-none w-full sm:w-auto bg-card border-2 border-foreground hover:border-foreground/80 px-4 py-2.5 pr-10 rounded-xl font-body font-bold text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary neo-shadow neo-shadow-hover transition-all"
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-card text-foreground py-1">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-foreground pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
    </div>
  );
}
