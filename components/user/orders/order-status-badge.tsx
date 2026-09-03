"use client";

import React from "react";
import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  dotColor: string;
}

const STATUS_CONFIGS: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    bgClass: "bg-accent-yellow text-foreground border-foreground",
    dotColor: "bg-amber-600",
  },
  PAID: {
    label: "Sudah Dibayar",
    bgClass: "bg-accent-soft-blue text-foreground border-foreground",
    dotColor: "bg-blue-600",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    bgClass: "bg-accent-soft-blue text-foreground border-foreground",
    dotColor: "bg-blue-600",
  },
  SHIPPED: {
    label: "Sedang Dikirim",
    bgClass: "bg-accent-purple text-foreground border-foreground",
    dotColor: "bg-indigo-600",
  },
  DELIVERED: {
    label: "Pesanan Tiba",
    bgClass: "bg-accent-green text-foreground border-foreground",
    dotColor: "bg-emerald-600",
  },
  COMPLETED: {
    label: "Pesanan Selesai",
    bgClass: "bg-accent-green text-foreground border-foreground",
    dotColor: "bg-emerald-600",
  },
  CANCELLED: {
    label: "Dibatalkan",
    bgClass: "bg-accent-peach text-foreground border-foreground",
    dotColor: "bg-rose-600",
  },
  REFUNDED: {
    label: "Pengembalian Dana",
    bgClass: "bg-accent-peach text-foreground border-foreground",
    dotColor: "bg-rose-600",
  },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    bgClass: "bg-muted text-foreground border-foreground",
    dotColor: "bg-gray-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-bold border-2 shrink-0 select-none shadow-[1px_1px_0px_0px_#3D2900]",
        config.bgClass,
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
