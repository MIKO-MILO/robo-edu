"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantitySelectorProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

/**
 * QuantitySelector
 * ----------------
 * Atom: tombol −/+ bulat dengan angka di tengah.
 * Tombol menggunakan rounded-full bg-foreground text-background,
 * tanpa border outline / shadow — sesuai gaya halaman product detail.
 *
 * Props min/max dipakai untuk disable otomatis di batas.
 */
export function QuantitySelector({
  value,
  onDecrement,
  onIncrement,
  min = 1,
  max,
  className,
  label = "Quantity",
}: QuantitySelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="font-body font-semibold text-sm text-foreground">
          {label}
        </span>
      )}

      <div className="flex items-center gap-4">
        {/* Decrement */}
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          aria-label="Kurangi jumlah"
          className="w-9 h-9 rounded-full bg-foreground text-background hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Count */}
        <span className="font-body font-bold text-base text-foreground min-w-[1.5rem] text-center select-none">
          {value}
        </span>

        {/* Increment */}
        <button
          type="button"
          onClick={onIncrement}
          disabled={max !== undefined && value >= max}
          aria-label="Tambah jumlah"
          className="w-9 h-9 rounded-full bg-foreground text-background hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
