import React from "react";
import type { Category, ProductType, ProductStatus } from "@/types";
import type { GetProductsParams } from "@/lib/api/endpoints/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, category: e.target.value || undefined, page: 1 });
  };

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, product_type: e.target.value || undefined, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value || undefined, page: 1 });
  };

  const handleReset = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.product_type || filters.status
  );

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 p-4 rounded-2xl border-2 border-[#3D2900] bg-card neo-shadow">
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
      <div className="w-full md:w-auto min-w-[160px]">
        <select
          value={filters.category || ""}
          onChange={handleCategoryChange}
          className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug || cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Product Type */}
      <div className="w-full md:w-auto min-w-[160px]">
        <select
          value={filters.product_type || ""}
          onChange={handleProductTypeChange}
          className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          {productTypes.map((pt) => (
            <option key={pt.id} value={pt.slug || pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Select Status */}
      <div className="w-full md:w-auto min-w-[150px]">
        <select
          value={filters.status || ""}
          onChange={handleStatusChange}
          className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Nonaktif</option>
          <option value="OUT_OF_STOCK">Stok Habis</option>
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          neo
          onClick={handleReset}
          className="shrink-0"
        >
          <RotateCcwIcon className="size-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
}
