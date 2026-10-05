"use client";

import * as React from "react";
import { SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RESELLER_STATUS_TABS } from "./reseller-list-types";

export interface ResellerFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusFilterChange: (status: string) => void;
  className?: string;
}

/**
 * Molecule — toolbar pencarian + tab filter status pengajuan reseller.
 * Tab: Semua / Menunggu Review / Disetujui / Ditolak
 */
export function ResellerFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  className,
}: ResellerFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border",
        className
      )}
    >
      {/* Search Input */}
      <div className="flex flex-1 items-center gap-2 max-w-xl">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Cari nama, email, atau no. telepon..."
            defaultValue={searchQuery}
            onChange={onSearchChange}
            className="pl-10 h-10 rounded-xl"
          />
        </div>

        {/* Status Filter Mobile (Select) — visible hanya di mobile sebagai alternatif tabs */}
        <div className="w-40 shrink-0 lg:hidden">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusFilterChange(val ?? "ALL")}
          >
            <SelectTrigger className="h-10 rounded-xl text-xs font-semibold">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-border">
              {RESELLER_STATUS_TABS.map((tab) => (
                <SelectItem key={tab.key} value={tab.key}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Tabs — visible di lg+ */}
      <div className="hidden lg:flex items-center gap-1.5">
        {RESELLER_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onStatusFilterChange(tab.key)}
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
