"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SearchIcon, AlertTriangleIcon } from "lucide-react";
import type { ProductStatus } from "@/types";

export interface InventoryFiltersProps {
  search?: string;
  status?: ProductStatus | "";
  lowStockOnly?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProductStatus | "") => void;
  onLowStockToggle: (value: boolean) => void;
}

export function InventoryFilters({
  search = "",
  status = "",
  lowStockOnly = false,
  onSearchChange,
  onStatusChange,
  onLowStockToggle,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari produk, varian, atau SKU..."
          defaultValue={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status filter */}
      <Select
        value={status || "all"}
        onValueChange={(val) =>
          onStatusChange(val === "all" ? "" : (val as ProductStatus))
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="ACTIVE">Aktif</SelectItem>
          <SelectItem value="INACTIVE">Nonaktif</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="OUT_OF_STOCK">Stok Habis</SelectItem>
        </SelectContent>
      </Select>

      {/* Low stock toggle */}
      <Button
        type="button"
        variant={lowStockOnly ? "primary" : "outline"}
        size="default"
        neo={false}
        onClick={() => onLowStockToggle(!lowStockOnly)}
        className="shrink-0 gap-2"
        title={lowStockOnly ? "Tampilkan semua" : "Filter stok menipis saja"}
      >
        <AlertTriangleIcon className="size-4" />
        <span className="text-sm">
          {lowStockOnly ? "Stok Menipis ✓" : "Stok Menipis"}
        </span>
      </Button>
    </div>
  );
}
