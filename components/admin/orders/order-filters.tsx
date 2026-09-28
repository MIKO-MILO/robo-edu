"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_TABS } from "./order-list-types";

export interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (status: string) => void;
  className?: string;
}

/**
 * Molecule — toolbar pencarian + tab filter status pesanan.
 * State dikelola di parent (URL-driven) dan diteruskan sebagai props.
 */
export function OrderFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  className,
}: OrderFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border-2 border-border",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cari no. order, customer, produk..."
          defaultValue={searchQuery}
          onChange={onSearchChange}
          className="pl-10"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        {ORDER_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusChange(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer",
              statusFilter === tab.key
                ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
