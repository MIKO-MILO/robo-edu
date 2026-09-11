"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useProducts,
  useDeleteProduct,
} from "@/hooks/admin/products";
import { useCategories } from "@/hooks/admin/categories/use-categories";
import { useProductTypes } from "@/hooks/admin/product-types/use-product-types";
import { ProductFilters, ProductTable } from "@/components/admin/products";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, AlertTriangleIcon } from "lucide-react";
import type { GetProductsParams } from "@/lib/api/endpoints/products";
import type { ProductListItem, UUID } from "@/types";

function AdminProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extract query params
  const filters: GetProductsParams = {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    product_type: searchParams.get("product_type") || undefined,
    status: searchParams.get("status") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 10,
  };

  // Hooks
  const { data: productsResponse, isLoading, isError, error, refetch } = useProducts(filters);
  const { data: categoriesResponse } = useCategories();
  const { data: productTypesResponse } = useProductTypes();
  const deleteProductMutation = useDeleteProduct();

  const handleFilterChange = (newFilters: GetProductsParams) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.product_type) params.set("product_type", newFilters.product_type);
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
  };

  const handleEditProduct = (product: ProductListItem) => {
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleDeleteProduct = async (id: UUID) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const productsList = productsResponse?.data || [];
  const meta = productsResponse?.meta;
  const categoriesList = categoriesResponse?.data || [];
  const productTypesList = productTypesResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Katalog Produk
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola data produk, kuota stok, varian, dan foto produk RoboEdu.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="default"
          neo
          onClick={() => router.push("/admin/products/create")}
        >
          <PlusIcon className="size-4" />
          <span>Tambah Produk</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <ProductFilters
        filters={filters}
        categories={categoriesList}
        productTypes={productTypesList}
        onChange={handleFilterChange}
      />

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#3D2900] bg-danger-bg text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs md:text-sm font-medium">
            Gagal memuat data produk: {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        data={productsList}
        isLoading={isLoading || isPending}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
