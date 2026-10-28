import * as React from "react";
import { cn } from "@/lib/utils";

export interface OrderKpiCardProps {
  /** Lucide icon node */
  icon: React.ReactNode;
  label: string;
  value: number | string;
  /** Tailwind classes untuk container ikon, mis. "bg-primary/10 text-primary" */
  iconColorClass: string;
  /** Opsional: klik seluruh card (misal untuk quick-filter) */
  onClick?: () => void;
}

/**
 * Atom — satu KPI card di halaman daftar pesanan.
 * Menampilkan ikon + label + nilai.
 */
export function OrderKpiCard({
  icon,
  label,
  value,
  iconColorClass,
  onClick,
}: OrderKpiCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-card border-2 border-border shadow-xs flex items-center gap-3",
        onClick && "cursor-pointer hover:bg-muted/30 transition-colors"
      )}
      onClick={onClick}
    >
      <div className={cn("p-2.5 rounded-xl shrink-0", iconColorClass)}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-body">{label}</div>
        <div className="text-lg font-heading font-bold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
