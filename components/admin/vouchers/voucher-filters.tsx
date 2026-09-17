"use client";

import React from "react";
import type { GetVouchersParams } from "@/lib/api/endpoints/vouchers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminSelect, type AdminSelectOption } from "@/components/admin/form/select";
import { SearchIcon, RotateCcwIcon } from "lucide-react";

export interface VoucherFiltersProps {
  filters: GetVouchersParams;
  onChange: (newFilters: GetVouchersParams) => void;
}

export function VoucherFilters({ filters, onChange }: VoucherFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value || undefined, page: 1 });
  };

  const handleReset = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(filters.search || filters.is_active);

  const statusOptions: AdminSelectOption[] = React.useMemo(() => [
    { value: "ALL", label: "Semua Status" },
    { value: "true", label: "Aktif" },
    { value: "false", label: "Nonaktif" },
  ], []);

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 p-4 rounded-2xl border border-border bg-card font-body">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari kode atau nama voucher..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Select Status */}
      <div className="w-full md:w-auto min-w-[160px]">
        <AdminSelect
          value={(filters.is_active as string) || "ALL"}
          onValueChange={(val) =>
            onChange({
              ...filters,
              is_active: !val || val === "ALL" ? undefined : val,
              page: 1,
            })
          }
          selectSize="sm"
          options={statusOptions}
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          neo={false}
          onClick={handleReset}
          className="shrink-0"
          title="Reset Filter"
        >
          <RotateCcwIcon className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
