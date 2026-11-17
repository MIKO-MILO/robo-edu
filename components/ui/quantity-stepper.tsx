"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Atom — Quantity stepper pill.
 *
 * Layout: [−] [qty] [+] dalam satu pill rounded-full.
 * Dipakai di ProductCard (catalog listing) dan bisa digunakan di mana pun
 * yang butuh input quantity tanpa context dependency.
 *
 * UX notes:
 * - Tombol − di-disable saat value === min.
 * - Tombol + di-disable saat value === max (jika max diberikan).
 * - Seluruh stepper di-disable saat prop disabled=true (mis. saat loading).
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (max === undefined || value < max) onChange(value + 1);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border-2 border-foreground bg-card neo-shadow",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* Decrement */}
      <Button
        type="button"
        variant="card"
        size="icon-sm"
        neo={false}
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        aria-label="Kurangi jumlah"
        className="rounded-full border-none shadow-none disabled:opacity-40"
      >
        <Minus className="w-3 h-3" />
      </Button>

      {/* Value display */}
      <span
        className="min-w-[1.5rem] text-center text-sm font-heading font-bold text-foreground select-none px-0.5"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      {/* Increment */}
      <Button
        type="button"
        variant="card"
        size="icon-sm"
        neo={false}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={handleIncrement}
        aria-label="Tambah jumlah"
        className="rounded-full border-none shadow-none disabled:opacity-40"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
