"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateProductType } from "@/hooks/admin/product-types";
import { ProductTypeForm } from "@/components/admin/product-types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import type { ProductTypeFormValues } from "@/lib/validations/product-type";

export default function CreateProductTypePage() {
  const router = useRouter();
  const createProductType = useCreateProductType();

  const handleSubmit = async (data: ProductTypeFormValues) => {
    const response = await createProductType.mutateAsync({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      is_active: data.is_active,
    });

    if (response.success) {
      router.push("/admin/product-types");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
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
            Tambah Tipe Produk Baru
          </h1>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">
            Slug akan digunakan sebagai URL publik tipe produk.
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductTypeForm
        onSubmit={handleSubmit}
        isSubmitting={createProductType.isPending}
      />
    </div>
  );
}
