"use client";

import React from "react";
import type { Category, ProductType, ProductStatus } from "@/types";
import type { GetProductsParams } from "@/lib/api/endpoints/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminSelect, type AdminSelectOption } from "@/components/admin/form/select";
import { SearchIcon, RotateCcwIcon } from "lucide-react";

export interface ProductFiltersProps {
  filters: GetProductsParams;
  categories: Category[];
  productTypes: ProductType[];
  onChange: (newFilters: GetProductsParams) => void;
}

export function ProductFilters({
  filters,
  categories,
  productTypes,
  onChange,
}: ProductFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value || undefined, page: 1 });
  };

  const handleReset = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.product_type || filters.status
  );

  const categoryOptions: AdminSelectOption[] = React.useMemo(() => [
    { value: "ALL", label: "Semua Kategori" },
    ...categories.map((cat) => ({
      value: cat.slug || cat.id,
      label: cat.name,
    })),
  ], [categories]);

  const productTypeOptions: AdminSelectOption[] = React.useMemo(() => [
    { value: "ALL", label: "Semua Tipe" },
    ...productTypes.map((pt) => ({
      value: pt.slug || pt.id,
      label: pt.name,
    })),
  ], [productTypes]);

  const statusOptions: AdminSelectOption[] = React.useMemo(() => [
    { value: "ALL", label: "Semua Status" },
    { value: "ACTIVE", label: "Aktif" },
    { value: "DRAFT", label: "Draft" },
    { value: "INACTIVE", label: "Nonaktif" },
    { value: "OUT_OF_STOCK", label: "Stok Habis" },
  ], []);

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 p-4 rounded-2xl border border-border bg-card font-body">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari produk / SKU..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Select Category */}
      <div className="w-full md:w-auto min-w-[170px]">
        <AdminSelect
          value={(filters.category as string) || "ALL"}
          onValueChange={(val) =>
            onChange({
              ...filters,
              category: !val || val === "ALL" ? undefined : val,
              page: 1,
            })
          }
          selectSize="sm"
          options={categoryOptions}
        />
      </div>

      {/* Select Product Type */}
      <div className="w-full md:w-auto min-w-[170px]">
        <AdminSelect
          value={(filters.product_type as string) || "ALL"}
          onValueChange={(val) =>
            onChange({
              ...filters,
              product_type: !val || val === "ALL" ? undefined : val,
              page: 1,
            })
          }
          selectSize="sm"
          options={productTypeOptions}
        />
      </div>

      {/* Select Status */}
      <div className="w-full md:w-auto min-w-[160px]">
        <AdminSelect
          value={(filters.status as string) || "ALL"}
          onValueChange={(val) =>
            onChange({
              ...filters,
              status: !val || val === "ALL" ? undefined : (val as ProductStatus),
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
