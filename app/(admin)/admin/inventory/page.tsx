"use client";

import React, { Suspense, useTransition, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useInventory,
  useLowStock,
  useAdjustStock,
} from "@/hooks/admin/inventory";
import {
  InventoryTable,
  InventoryFilters,
  LowStockBanner,
  StockAdjustDialog,
  type AdjustTargetVariant,
} from "@/components/admin/inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import type { InventoryVariantRow, UUID } from "@/types";
import type { ProductStatus } from "@/types/enums";
import type { GetInventoryParams } from "@/lib/api/endpoints/inventory";

function AdminInventoryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Modal adjust state
  const [adjustTarget, setAdjustTarget] = useState<AdjustTargetVariant | null>(
    null
  );

  // Extract filter dari URL
  const filters: GetInventoryParams = {
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as ProductStatus) || undefined,
    low_stock: searchParams.get("low_stock") === "1" || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 15,
  };

  // Data hooks
  const {
    data: inventoryResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useInventory(filters);

  const { data: lowStockResponse, isLoading: isLowStockLoading } =
    useLowStock();

  const adjustStock = useAdjustStock();

  // ── Filter handlers (ubah URL params) ──
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset ke halaman 1 saat filter berubah
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    updateParams({ search: value || undefined });
  };

  const handleStatusChange = (value: ProductStatus | "") => {
    updateParams({ status: value || undefined });
  };

  const handleLowStockToggle = (value: boolean) => {
    updateParams({ low_stock: value ? "1" : undefined });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // ── Adjust handlers ──
  const handleOpenAdjust = (row: InventoryVariantRow) => {
    setAdjustTarget({
      id: row.variant_id,
      variant_name: row.variant_name,
      variant_sku: row.variant_sku,
      stock: row.stock,
      product_name: row.product_name,
      product_id: row.product_id,
    });
  };

  const handleConfirmAdjust = async (
    variantId: UUID,
    newStock: number,
    productId?: UUID
  ) => {
    await adjustStock.mutateAsync({ variantId, newStock, productId });
    setAdjustTarget(null);
  };

  const inventoryList = inventoryResponse?.data || [];
  const meta = inventoryResponse?.meta;
  const lowStockItems = lowStockResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Monitoring Stok
          </h1>
          <p className="mt-0.5 font-body text-xs text-muted-foreground md:text-sm">
            Pantau dan sesuaikan kuota/kapasitas produksi per varian produk.
          </p>
        </div>

        {/* Summary stat */}
        {!isLowStockLoading && lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-400/60 bg-amber-50 px-4 py-2 dark:border-amber-500/40 dark:bg-amber-950/20 shrink-0">
            <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
            <span className="font-heading text-sm font-bold text-amber-800 dark:text-amber-300">
              {lowStockItems.length} varian stok menipis
            </span>
          </div>
        )}
      </div>

      {/* Low Stock Banner */}
      <LowStockBanner items={lowStockItems} isLoading={isLowStockLoading} />

      {/* Filters */}
      <InventoryFilters
        search={filters.search}
        status={filters.status || ""}
        lowStockOnly={filters.low_stock ?? false}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onLowStockToggle={handleLowStockToggle}
      />

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#3D2900] bg-danger-bg p-4 text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs font-medium md:text-sm">
            Gagal memuat data stok:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => refetch()}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable
        data={inventoryList}
        isLoading={isLoading || isPending}
        meta={meta}
        onPageChange={handlePageChange}
        onAdjust={handleOpenAdjust}
        isAdjustingId={
          adjustStock.isPending
            ? (adjustStock.variables?.variantId as UUID)
            : null
        }
      />

      {/* Adjust Stock Dialog */}
      <StockAdjustDialog
        open={Boolean(adjustTarget)}
        onOpenChange={(open) => {
          if (!open) setAdjustTarget(null);
        }}
        variant={adjustTarget}
        onConfirm={handleConfirmAdjust}
        isLoading={adjustStock.isPending}
      />
    </div>
  );
}

export default function AdminInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminInventoryContent />
    </Suspense>
  );
}
