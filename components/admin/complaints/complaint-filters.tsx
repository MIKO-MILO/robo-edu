"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { AdminInput } from "@/components/admin/form/input";
import { AdminSelect } from "@/components/admin/form/select";
import { COMPLAINT_STATUS_TABS } from "./complaint-list-types";

export interface ComplaintFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (status: string) => void;
}

/**
 * Molecule — toolbar pencarian & filter status untuk daftar klaim.
 */
export function ComplaintFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: ComplaintFiltersProps) {
  const statusOptions = COMPLAINT_STATUS_TABS.map((t) => ({
    value: t.key,
    label: t.label,
  }));

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-xs">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <AdminInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Cari subjek klaim atau nama customer..."
          inputSize="sm"
          leftIcon={<Search className="size-4" />}
          rightIcon={
            searchQuery ? (
              <button
                type="button"
                onClick={() =>
                  onSearchChange({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="hover:text-foreground text-muted-foreground p-0.5"
              >
                <X className="size-3.5" />
              </button>
            ) : null
          }
        />
      </div>

      {/* Status Filter */}
      <div className="min-w-[180px]">
        <AdminSelect
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          selectSize="sm"
          placeholder="Filter Status"
          options={statusOptions}
        />
      </div>
    </div>
  );
}
