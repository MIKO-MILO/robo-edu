"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useProductType, useUpdateProductType } from "@/hooks/admin/product-types";
import { ProductTypeForm } from "@/components/admin/product-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import type { ProductTypeFormValues } from "@/lib/validations/product-type";

export default function EditProductTypePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const productTypeId = params.id;
  const router = useRouter();

  const {
    data: productTypeResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductType(productTypeId);

  const updateProductType = useUpdateProductType();
  const productTypeDetail = productTypeResponse?.data;

  const handleSubmit = async (data: ProductTypeFormValues) => {
    await updateProductType.mutateAsync({
      id: productTypeId,
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
      <div className="mx-auto max-w-2xl space-y-6">
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
  if (isError || !productTypeDetail) {
    return (
      <div className="mx-auto my-12 max-w-md space-y-4 rounded-2xl border-2 border-[#3D2900] bg-danger-bg p-6 text-center text-danger neo-shadow">
        <AlertTriangleIcon className="mx-auto size-12" />
        <h3 className="font-heading text-lg font-bold">
          Tipe Produk Tidak Ditemukan
        </h3>
        <p className="font-body text-xs md:text-sm">
          {error instanceof Error
            ? error.message
            : "Gagal memuat data tipe produk."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/product-types")}
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
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            neo
            onClick={() => router.push("/admin/product-types")}
            title="Kembali ke Daftar Tipe Produk"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Edit Tipe Produk: {productTypeDetail.name}
            </h1>
            <p className="mt-0.5 font-body text-xs text-muted-foreground">
              Perubahan berlaku setelah disimpan.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="accent-green"
          size="default"
          neo
          onClick={() => router.push("/admin/product-types")}
        >
          <CheckCircle2Icon className="size-4" />
          <span>Selesai Edit</span>
        </Button>
      </div>

      {/* Success Feedback */}
      {updateProductType.isSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-success/20 bg-success-bg p-3.5 text-sm font-medium text-success">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span>Tipe produk berhasil diperbarui.</span>
        </div>
      )}

      {/* Form */}
      <ProductTypeForm
        defaultValues={{
          name: productTypeDetail.name,
          slug: productTypeDetail.slug,
          description: productTypeDetail.description || "",
          is_active: productTypeDetail.is_active,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateProductType.isPending}
      />
    </div>
  );
}
