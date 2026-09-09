"use client";

import * as React from "react";
import {
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminInput } from "@/components/admin/form/input";
import { AdminSelect } from "@/components/admin/form/select";

export interface ColumnDef<TData> {
  key: string;
  header: React.ReactNode;
  cell?: (row: TData, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilter {
  id: string;
  label: string;
  options: DataTableFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  totalItems?: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  
  // Search
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filter
  filters?: DataTableFilter[];

  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc" | null;
  onSortChange?: (columnKey: string) => void;

  // States
  isLoading?: boolean;
  emptyMessage?: string;

  // Toolbar Actions
  toolbarActions?: React.ReactNode;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  totalItems = data.length,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  searchable = true,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Cari data...",
  filters = [],
  sortColumn,
  sortDirection,
  onSortChange,
  isLoading = false,
  emptyMessage = "Tidak ada data yang ditemukan.",
  toolbarActions,
  className,
}: DataTableProps<TData>) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const activeFiltersCount = filters.filter((f) => f.value && f.value !== "ALL" && f.value !== "").length;

  return (
    <div className={cn("w-full space-y-4 font-body", className)}>
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-3xl bg-card border-2 border-border neo-shadow">
        {/* Left: Search & Filter */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {searchable && onSearchChange && (
            <div className="relative min-w-[240px] max-w-md">
              <AdminInput
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                inputSize="sm"
                leftIcon={<Search className="size-4" />}
                rightIcon={
                  searchValue ? (
                    <button
                      type="button"
                      onClick={() => onSearchChange("")}
                      className="hover:text-foreground text-muted-foreground p-0.5"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : null
                }
              />
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <div key={filter.id} className="min-w-[140px]">
                  <AdminSelect
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    selectSize="sm"
                    placeholder={`Filter ${filter.label}`}
                    options={[
                      { value: "ALL", label: `Semua ${filter.label}` },
                      ...filter.options,
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Custom Toolbar Actions (e.g. Add Button) */}
        {toolbarActions && (
          <div className="flex items-center gap-2 shrink-0">{toolbarActions}</div>
        )}
      </div>

      {/* Filter Active Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center flex-wrap gap-2 px-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
            <Filter className="size-3.5" /> Filter Aktif:
          </span>
          {filters
            .filter((f) => f.value && f.value !== "ALL" && f.value !== "")
            .map((f) => {
              const matchedOpt = f.options.find((o) => o.value === f.value);
              return (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-900 border border-primary-300"
                >
                  <span>
                    {f.label}: {matchedOpt?.label || f.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => f.onChange("ALL")}
                    className="hover:text-danger p-0.5 rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
        </div>
      )}

      {/* Main Table Container */}
      <div className="w-full overflow-hidden rounded-3xl border-2 border-border bg-card neo-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50 text-foreground font-heading text-xs font-bold uppercase tracking-wider">
                {columns.map((col) => {
                  const isSorted = sortColumn === col.key;
                  return (
                    <th
                      key={col.key}
                      className={cn("px-4 py-3.5", col.headerClassName)}
                    >
                      {col.sortable && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(col.key)}
                          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-bold uppercase"
                        >
                          <span>{col.header}</span>
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="size-3.5 text-primary" />
                            ) : (
                              <ArrowDown className="size-3.5 text-primary" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground opacity-60" />
                          )}
                        </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="bg-card">
                    {columns.map((col, cIdx) => (
                      <td key={`sk-${rIdx}-${cIdx}`} className="px-4 py-4">
                        <Skeleton className="h-5 w-full max-w-[120px] rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground neo-shadow-icon">
                        <Inbox className="size-8 stroke-[1.5]" />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{emptyMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        Coba ubah kata kunci pencarian atau filter yang diterapkan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr
                    key={((row as { id?: string }).id) || `row-${rIdx}`}
                    className="bg-card hover:bg-muted/40 transition-colors"
                  >
                    {columns.map((col) => {
                      const cellValue = (row as Record<string, unknown>)[col.key];
                      return (
                        <td key={col.key} className={cn("px-4 py-3.5 font-body", col.className)}>
                          {col.cell ? col.cell(row, rIdx) : (cellValue as React.ReactNode)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t-2 border-border bg-muted/30">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-3">
            <span>
              Menampilkan <strong className="text-foreground">{startItem}</strong> -{" "}
              <strong className="text-foreground">{endItem}</strong> dari{" "}
              <strong className="text-foreground">{totalItems}</strong> data
            </span>

            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 ml-2">
                <span>Per halaman:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-xl border border-border bg-card px-2 py-1 text-xs text-foreground font-bold outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}
