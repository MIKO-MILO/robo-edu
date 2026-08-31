"use client";

import { FilterButton } from "@/components/ui/filter-button";
import type { OrderStatus } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Tipe nilai tab — "ALL" untuk semua, atau status spesifik.
// "PAID" & "PROCESSING" digabung ke "PROCESSING" dari sudut pandang customer.
// ─────────────────────────────────────────────────────────────────────────────
export type OrderTabValue = "ALL" | OrderStatus;

interface TabConfig {
  value: OrderTabValue;
  label: string;
  activeColorClass: string;
}

const TABS: TabConfig[] = [
  { value: "ALL", label: "Semua", activeColorClass: "bg-accent-blue" },
  { value: "PENDING", label: "Belum Bayar", activeColorClass: "bg-accent-yellow" },
  { value: "PROCESSING", label: "Diproses", activeColorClass: "bg-accent-soft-blue" },
  { value: "SHIPPED", label: "Dikirim", activeColorClass: "bg-accent-purple" },
  { value: "COMPLETED", label: "Selesai", activeColorClass: "bg-accent-green" },
  { value: "CANCELLED", label: "Dibatalkan", activeColorClass: "bg-accent-peach" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface OrderStatusTabsProps {
  activeTab: OrderTabValue;
  onTabChange: (tab: OrderTabValue) => void;
}

export function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Filter status pesanan"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
    >
      {TABS.map((tab) => (
        <FilterButton
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          isActive={activeTab === tab.value}
          activeColorClass={tab.activeColorClass}
          onClick={() => onTabChange(tab.value)}
          className="shrink-0"
        >
          {tab.label}
        </FilterButton>
      ))}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — ubah OrderTabValue ke filter status yang dikirim ke API.
// "PROCESSING" di tab = filter PAID | PROCESSING di backend.
// ─────────────────────────────────────────────────────────────────────────────
export function tabToApiStatus(tab: OrderTabValue): OrderStatus[] | undefined {
  if (tab === "ALL") return undefined;
  if (tab === "PROCESSING") return ["PAID", "PROCESSING"];
  return [tab];
}
