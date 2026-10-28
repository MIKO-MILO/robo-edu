"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type {
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  ResellerStatus,
  ReviewStatus,
  ComplaintStatus,
  ShipmentStatus,
  EmailLogStatus,
} from "@/types/enums";

export type StatusEnum =
  | ProductStatus
  | OrderStatus
  | PaymentStatus
  | ResellerStatus
  | ReviewStatus
  | ComplaintStatus
  | ShipmentStatus
  | EmailLogStatus
  | (string & {});

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-body border transition-all duration-150 select-none whitespace-nowrap",
  {
    variants: {
      statusTheme: {
        success: "bg-success-bg text-success border-success/30",
        warning: "bg-warning-bg text-warning border-warning/30",
        danger: "bg-danger-bg text-danger border-danger/30",
        info: "bg-info-bg text-info border-info/30",
        purple: "bg-accent-purple/40 text-foreground border-accent-purple",
        blue: "bg-accent-blue/40 text-foreground border-accent-blue",
        softBlue: "bg-accent-soft-blue/60 text-foreground border-accent-soft-blue",
        orange: "bg-accent-orange/40 text-foreground border-accent-orange",
        muted: "bg-muted text-muted-foreground border-border/50",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-3 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
      neo: {
        true: "border-border shadow-xs",
        false: "",
      },
    },
    defaultVariants: {
      statusTheme: "muted",
      size: "md",
      neo: false,
    },
  }
);
export type StatusTheme =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "blue"
  | "softBlue"
  | "orange"
  | "muted";

interface StatusConfig {
  label: string;
  theme: StatusTheme;
  dotColor?: string;
}

const statusMap: Record<string, StatusConfig> = {
  // ProductStatus
  ACTIVE: { label: "Aktif", theme: "success", dotColor: "bg-success" },
  DRAFT: { label: "Draft", theme: "warning", dotColor: "bg-warning" },
  INACTIVE: { label: "Nonaktif", theme: "muted", dotColor: "bg-muted-foreground" },
  OUT_OF_STOCK: { label: "Stok Habis", theme: "danger", dotColor: "bg-danger" },

  // OrderStatus & PaymentStatus
  PENDING: { label: "Menunggu", theme: "warning", dotColor: "bg-warning" },
  PAID: { label: "Dibayar", theme: "info", dotColor: "bg-info" },
  PROCESSING: { label: "Diproses", theme: "purple", dotColor: "bg-purple-600" },
  SHIPPED: { label: "Dikirim", theme: "softBlue", dotColor: "bg-sky-600" },
  DELIVERED: { label: "Terkirim", theme: "success", dotColor: "bg-success" },
  COMPLETED: { label: "Selesai", theme: "success", dotColor: "bg-success" },
  CANCELLED: { label: "Dibatalkan", theme: "danger", dotColor: "bg-danger" },
  REFUNDED: { label: "Di-Refund", theme: "orange", dotColor: "bg-amber-600" },
  FAILED: { label: "Gagal", theme: "danger", dotColor: "bg-danger" },
  EXPIRED: { label: "Kedaluwarsa", theme: "muted", dotColor: "bg-muted-foreground" },

  // ResellerStatus
  NOT_RESELLER: { label: "Bukan Reseller", theme: "muted", dotColor: "bg-muted-foreground" },
  APPROVED: { label: "Approved", theme: "success", dotColor: "bg-success" },
  REJECTED: { label: "Ditolak", theme: "danger", dotColor: "bg-danger" },

  // ReviewStatus
  PUBLISHED: { label: "Diterbitkan", theme: "success", dotColor: "bg-success" },
  HIDDEN: { label: "Disembunyikan", theme: "muted", dotColor: "bg-muted-foreground" },

  // ComplaintStatus
  OPEN: { label: "Terbuka", theme: "danger", dotColor: "bg-danger" },
  IN_REVIEW: { label: "Ditinjau", theme: "warning", dotColor: "bg-warning" },
  RESOLVED: { label: "Terselesaikan", theme: "success", dotColor: "bg-success" },

  // ShipmentStatus
  PACKED: { label: "Dikemas", theme: "info", dotColor: "bg-info" },
  PICKED_UP: { label: "Di-Pick Up", theme: "purple", dotColor: "bg-purple-600" },
  IN_TRANSIT: { label: "Dalam Perjalanan", theme: "softBlue", dotColor: "bg-sky-600" },

  // EmailLogStatus
  SENT: { label: "Terkirim", theme: "success", dotColor: "bg-success" },
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: StatusEnum;
  customLabel?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  customLabel,
  showDot = true,
  size,
  neo,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusMap[status] || {
    label: customLabel || status,
    theme: "muted" as const,
    dotColor: "bg-muted-foreground",
  };

  const labelText = customLabel || config.label;

  return (
    <span
      className={cn(
        statusBadgeVariants({
          statusTheme: config.theme,
          size,
          neo,
          className,
        })
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", config.dotColor || "bg-current")}
        />
      )}
      <span>{labelText}</span>
    </span>
  );
}
