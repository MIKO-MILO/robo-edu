import * as React from "react";
import { cn } from "@/lib/utils";

export interface CustomerKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconColorClass: string;
  onClick?: () => void;
}

/**
 * Atom — satu KPI card di halaman daftar pelanggan admin.
 * Menampilkan ikon + label + nilai dengan border neo-brutalist.
 */
export function CustomerKpiCard({
  icon,
  label,
  value,
  iconColorClass,
  onClick,
}: CustomerKpiCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-card border-2 border-border shadow-xs flex items-center gap-3 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className={cn("p-2.5 rounded-xl shrink-0", iconColorClass)}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-body">{label}</div>
        <div className="text-xl font-heading font-bold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
