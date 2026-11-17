import React from "react";
import { cn } from "@/lib/utils";

/** 
 * Varian warna pastel yang sedikit lebih pekat dari sebelumnya (pas di tengah),
 * sepenuhnya menggunakan token global dengan opasitas dinamis tanpa hardcode.
 */
export const PASTEL_VARIANTS = [
  "bg-accent-blue/40",    // Biru lembut berasa
  "bg-accent-yellow/45",  // Kuning pastel hangat
  "bg-accent-pink/40",    // Pink lembut manis
  "bg-accent-purple/40",  // Ungu soft
  "bg-accent-green/40",   // Hijau pastel segar
  "bg-accent-orange/40",  // Orange lembut
  "bg-accent-peach/45",   // Peach hangat
  "bg-accent-butter",     // Butter lembut asli
] as const;

export interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isActive?: boolean;
  index?: number;
  activeColorClass?: string;
}

/**
 * Pill-shaped category filter button.
 * Active state uses `filter-pill-active` utility from globals.css
 * (soft-blue bg + primary ring) — no hardcoded values here.
 */
export function FilterButton({
  children,
  isActive = false,
  className,
  ...props
}: FilterButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "px-5 py-2 rounded-full font-body font-semibold text-sm whitespace-nowrap cursor-pointer",
        "transition-all duration-100 ease-in-out active:scale-95",
        isActive
          ? "filter-pill-active"
          : "bg-card text-foreground border border-border-strong hover:border-primary/50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}