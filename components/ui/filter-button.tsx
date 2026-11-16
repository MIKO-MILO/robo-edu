import React from "react";
import { cn } from "@/lib/utils";

/** Pastel variants for product card background rotation. */
export const PASTEL_VARIANTS = [
  "bg-pastel-pink",
  "bg-pastel-blue",
  "bg-pastel-peach",
  "bg-pastel-green",
  "bg-pastel-yellow",
  "bg-pastel-orange",
  "bg-pastel-purple",
  "bg-pastel-butter",
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
