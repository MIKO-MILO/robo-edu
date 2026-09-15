"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useProductTypes,
  useDeleteProductType,
} from "@/hooks/admin/product-types";
import { ProductTypeTable } from "@/components/admin/product-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PlusIcon, AlertTriangleIcon, SearchIcon } from "lucide-react";
import type { ProductType, UUID } from "@/types";
import type { GetProductTypesParams } from "@/lib/api/endpoints/product-types";

function AdminProductTypesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extract query params
  const filters: GetProductTypesParams = {
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 10,
  };

  // Hooks
  const {
    data: productTypesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductTypes(filters);

  const deleteProductType = useDeleteProductType();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams();
    if (e.target.value) params.set("search", e.target.value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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

  const handleEditProductType = (productType: ProductType) => {
    router.push(`/admin/product-types/${productType.id}/edit`);
  };

  const handleDeleteProductType = async (id: UUID) => {
    await deleteProductType.mutateAsync(id);
  };

  const productTypesList = productTypesResponse?.data || [];
  const meta = productTypesResponse?.meta;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Manajemen Tipe Produk
          </h1>
          <p className="mt-0.5 font-body text-xs text-muted-foreground md:text-sm">
            Atur tipe produk yang digunakan sebagai klasifikasi.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="default"
          neo
          onClick={() => router.push("/admin/product-types/create")}
        >
          <PlusIcon className="size-4" />
          <span>Tambah Tipe Produk</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari nama tipe produk..."
          defaultValue={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#3D2900] bg-danger-bg p-4 text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs font-medium md:text-sm">
            Gagal memuat data tipe produk:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Product Type Table */}
      <ProductTypeTable
        data={productTypesList}
        isLoading={isLoading || isPending}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEditProductType}
        onDelete={handleDeleteProductType}
        isDeletingId={
          deleteProductType.isPending
            ? (deleteProductType.variables as UUID)
            : null
        }
      />
    </div>
  );
}

export default function AdminProductTypesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminProductTypesContent />
    </Suspense>
  );
}
