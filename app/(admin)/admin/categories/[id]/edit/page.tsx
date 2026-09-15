"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useCategory, useUpdateCategory } from "@/hooks/admin/categories";
import { CategoryForm } from "@/components/admin/categories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import type { CategoryFormValues } from "@/lib/validations/category";

export default function EditCategoryPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const categoryId = params.id;
  const router = useRouter();

  const {
    data: categoryResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategory(categoryId);

  const updateCategory = useUpdateCategory();
  const categoryDetail = categoryResponse?.data;

  const handleSubmit = async (data: CategoryFormValues) => {
    await updateCategory.mutateAsync({
      id: categoryId,
      body: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        is_active: data.is_active,
      },
    });
    // Tetap di halaman setelah simpan — user bisa kembali manual
  };

  /* ── Loading State ── */
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  /* ── Error State ── */
  if (isError || !categoryDetail) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border-2 border-[#3D2900] bg-danger-bg text-danger text-center space-y-4 neo-shadow">
        <AlertTriangleIcon className="size-12 mx-auto" />
        <h3 className="font-heading text-lg font-bold">Kategori Tidak Ditemukan</h3>
        <p className="font-body text-xs md:text-sm">
          {error instanceof Error ? error.message : "Gagal memuat data kategori."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/categories")}
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => refetch()}
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            neo
            onClick={() => router.push("/admin/categories")}
            title="Kembali ke Daftar Kategori"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
              Edit Kategori: {categoryDetail.name}
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Ubah detail informasi kategori di bawah ini.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="accent-green"
          size="default"
          neo
          onClick={() => router.push("/admin/categories")}
        >
          <CheckCircle2Icon className="size-4" />
          <span>Selesai Edit</span>
        </Button>
      </div>

      {/* Success Feedback */}
      {updateCategory.isSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-success-bg border border-success/20 text-success text-sm font-medium">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span>Kategori berhasil diperbarui.</span>
        </div>
      )}

      {/* Form */}
      <CategoryForm
        defaultValues={{
          name: categoryDetail.name,
          slug: categoryDetail.slug,
          description: categoryDetail.description || "",
          is_active: categoryDetail.is_active,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateCategory.isPending}
      />
    </div>
  );
}
