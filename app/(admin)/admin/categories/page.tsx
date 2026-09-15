"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCategories,
  useDeleteCategory,
} from "@/hooks/admin/categories";
import { CategoryTable } from "@/components/admin/categories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PlusIcon, AlertTriangleIcon, SearchIcon } from "lucide-react";
import type { Category, UUID } from "@/types";
import type { GetCategoriesParams } from "@/lib/api/endpoints/categories";

function AdminCategoriesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extract query params
  const filters: GetCategoriesParams = {
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 10,
  };

  // Hooks
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories(filters);

  const deleteCategory = useDeleteCategory();

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

  const handleEditCategory = (category: Category) => {
    router.push(`/admin/categories/${category.id}/edit`);
  };

  const handleDeleteCategory = async (id: UUID) => {
    await deleteCategory.mutateAsync(id);
  };

  const categoriesList = categoriesResponse?.data || [];
  const meta = categoriesResponse?.meta;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Manajemen Kategori
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Atur kategori produk yang tersedia di toko.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="default"
          neo
          onClick={() => router.push("/admin/categories/create")}
        >
          <PlusIcon className="size-4" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cari nama kategori..."
          defaultValue={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#3D2900] bg-danger-bg text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs md:text-sm font-medium">
            Gagal memuat data kategori:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Category Table */}
      <CategoryTable
        data={categoriesList}
        isLoading={isLoading || isPending}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        isDeletingId={deleteCategory.isPending ? (deleteCategory.variables as UUID) : null}
      />
    </div>
  );
}

export default function AdminCategoriesPage() {
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
      <AdminCategoriesContent />
    </Suspense>
  );
}
