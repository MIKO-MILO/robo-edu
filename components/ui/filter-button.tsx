import React from "react";
import { cn } from "@/lib/utils";

// Preset class warna pastel dari globals.css untuk rotasi warna-warni komponen
export const PASTEL_VARIANTS = [
  "bg-accent-pink",
  "bg-accent-soft-blue",
  "bg-accent-peach",
  "bg-accent-green",
  "bg-accent-yellow",
  "bg-accent-blue",
  "bg-accent-orange",
  "bg-accent-purple",
] as const;

export interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isActive?: boolean;
  /** Index urutan item (0, 1, 2, dst) untuk rotasi warna otomatis */
  index?: number;
  /** Override class warna kustom jika tidak ingin memakai rotasi warna index */
  activeColorClass?: string;
}

export function FilterButton({
  children,
  isActive = false,
  index = 0,
  activeColorClass,
  className,
  ...props
}: FilterButtonProps) {
  // Hitung warna pastel secara otomatis berdasarkan index (dengan fallback rotasi)
  const resolvedColorClass =
    activeColorClass ?? PASTEL_VARIANTS[index % PASTEL_VARIANTS.length];

  return (
    <button
      type="button"
      className={cn(
        // Base Layout & Typography
        "px-6 py-2.5 rounded-full font-body font-semibold text-sm whitespace-nowrap cursor-pointer",
        // Interactive Mechanics & Border
        "transition-all duration-100 ease-in-out active:scale-95 border-2 border-foreground",
        // Conditional State Styling
        isActive
          ? `${resolvedColorClass} text-foreground neo-shadow`
          : "bg-card text-foreground neo-shadow neo-shadow-hover",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}