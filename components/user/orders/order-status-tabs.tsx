"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

export type OrderTabKey = "all" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderTab {
  key: OrderTabKey;
  label: string;
  statuses: OrderStatus[] | null;
  count?: number;
}

export const ORDER_TABS: OrderTab[] = [
  { key: "all", label: "Semua", statuses: null },
  { key: "processing", label: "Diproses", statuses: ["PENDING", "PAID", "PROCESSING"] },
  { key: "shipped", label: "Dikirim", statuses: ["SHIPPED"] },
  { key: "completed", label: "Selesai", statuses: ["DELIVERED", "COMPLETED"] },
  { key: "cancelled", label: "Dibatalkan", statuses: ["CANCELLED", "REFUNDED"] },
];

export interface OrderStatusTabsProps {
  activeTab: OrderTabKey;
  onTabChange: (tab: OrderTabKey) => void;
  counts?: Partial<Record<OrderTabKey, number>>;
  className?: string;
}

export function OrderStatusTabs({
  activeTab,
  onTabChange,
  counts,
  className,
}: OrderStatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter status pesanan"
      className={cn(
        "flex flex-wrap items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none",
        className
      )}
    >
      {ORDER_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts?.[tab.key];

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-bold text-sm whitespace-nowrap cursor-pointer transition-all duration-150 select-none active:scale-95 border-2 border-foreground",
              isActive
                ? "bg-accent-soft-blue text-foreground neo-shadow scale-100"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 neo-shadow neo-shadow-hover"
            )}
          >
            <span>{tab.label}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-heading font-bold border border-foreground transition-colors",
                  isActive
                    ? "bg-card text-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
