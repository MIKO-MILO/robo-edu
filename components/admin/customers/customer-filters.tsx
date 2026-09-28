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
import { CUSTOMER_RESELLER_TABS } from "./customer-list-types";

export interface CustomerFiltersProps {
  searchQuery: string;
  resellerFilter: string;
  statusFilter: string; // "ALL" | "ACTIVE" | "INACTIVE"
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResellerFilterChange: (key: string) => void;
  onStatusFilterChange: (status: string) => void;
  className?: string;
}

/**
 * Molecule — toolbar pencarian + tab filter tipe pelanggan & dropdown status akun.
 */
export function CustomerFilters({
  searchQuery,
  resellerFilter,
  statusFilter,
  onSearchChange,
  onResellerFilterChange,
  onStatusFilterChange,
  className,
}: CustomerFiltersProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-2xl border-2 border-border shadow-xs",
        className
      )}
    >
      {/* Search Input & Status Dropdown */}
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

        {/* Status Akun Filter */}
        <div className="w-36 shrink-0">
          <Select
            value={statusFilter}
            onValueChange={(val) => onStatusFilterChange(val ?? "ALL")}
          >
            <SelectTrigger className="h-10 rounded-xl text-xs font-semibold">
              <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status Akun" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-border">
              <SelectItem value="ALL">Semua Akun</SelectItem>
              <SelectItem value="ACTIVE">Hanya Aktif</SelectItem>
              <SelectItem value="INACTIVE">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reseller Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
        {CUSTOMER_RESELLER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onResellerFilterChange(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer",
              resellerFilter === tab.key
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
