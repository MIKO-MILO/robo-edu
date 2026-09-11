import React from "react";
import type { ProductStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const config: Record<
    ProductStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    ACTIVE: {
      label: "Aktif",
      bg: "bg-emerald-100 dark:bg-emerald-950/50",
      text: "text-emerald-800 dark:text-emerald-200",
      border: "border-emerald-600",
    },
    DRAFT: {
      label: "Draft",
      bg: "bg-amber-100 dark:bg-amber-950/50",
      text: "text-amber-800 dark:text-amber-200",
      border: "border-amber-600",
    },
    INACTIVE: {
      label: "Nonaktif",
      bg: "bg-stone-200 dark:bg-stone-800",
      text: "text-stone-700 dark:text-stone-300",
      border: "border-stone-500",
    },
    OUT_OF_STOCK: {
      label: "Stok Habis",
      bg: "bg-rose-100 dark:bg-rose-950/50",
      text: "text-rose-800 dark:text-rose-200",
      border: "border-rose-600",
    },
  };

  const statusConfig = config[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border-2 shadow-[2px_2px_0px_#3D2900] select-none",
        statusConfig.bg,
        statusConfig.text,
        statusConfig.border,
        className
      )}
    >
      {statusConfig.label}
    </span>
  );
}
