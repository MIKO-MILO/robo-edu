import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResellerKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconColorClass: string;
  onClick?: () => void;
}

/**
 * Atom — satu KPI card di halaman daftar pengajuan reseller.
 * Menampilkan ikon + label + nilai dengan border neo-brutalist.
 *
 * Dipisahkan dari CustomerKpiCard untuk menjaga kemandirian modul reseller,
 * mengikuti prinsip YAGNI (bisa dikembangkan berbeda di masa depan).
 */
export function ResellerKpiCard({
  icon,
  label,
  value,
  iconColorClass,
  onClick,
}: ResellerKpiCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-card border border-border flex items-center gap-3 transition-colors",
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
