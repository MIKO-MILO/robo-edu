"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VoucherBadgeProps {
  nilaiDiskon: string;
  className?: string;
  bgClass?: string;
  textClass?: string;
}

/**
 * Atom — Pill badge untuk nilai diskon dengan border putih rapi.
 */
export function VoucherBadge({
  nilaiDiskon,
  className,
  bgClass = "bg-white",
  textClass = "text-secondary",
}: VoucherBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-1 rounded-full border-2 border-white shadow-xs select-none",
        bgClass,
        className
      )}
    >
      <span
        className={cn(
          "font-heading font-extrabold text-sm sm:text-base tracking-tight leading-none",
          textClass
        )}
      >
        {nilaiDiskon}
      </span>
    </div>
  );
}
