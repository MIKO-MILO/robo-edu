"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateCategory } from "@/hooks/admin/categories";
import { CategoryForm } from "@/components/admin/categories";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import type { CategoryFormValues } from "@/lib/validations/category";

export default function CreateCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const handleSubmit = async (data: CategoryFormValues) => {
    const response = await createCategory.mutateAsync({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      is_active: data.is_active,
    });

    if (response.success) {
      router.push("/admin/categories");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
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
            Tambah Kategori Baru
          </h1>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Isi detail informasi kategori produk di bawah ini.
          </p>
        </div>
      </div>

      {/* Form */}
      <CategoryForm
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending}
      />
    </div>
  );
}
