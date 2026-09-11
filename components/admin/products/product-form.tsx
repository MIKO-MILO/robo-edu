"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormSchema,
  generateSlug,
  type ProductFormValues,
} from "@/lib/validations/product";
import type { Category, ProductType } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon, RefreshCwIcon } from "lucide-react";

export interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  categories: Category[];
  productTypes: ProductType[];
  onSubmit: (data: ProductFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({
  defaultValues,
  categories,
  productTypes,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      category_id: "",
      product_type_id: null,
      description: "",
      ...defaultValues,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug dari name jika belum di-edit manual
  useEffect(() => {
    if (nameValue && !isSlugManuallyEdited && !defaultValues?.slug) {
      setValue("slug", generateSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isSlugManuallyEdited, defaultValues?.slug, setValue]);

  const handleSlugRegenerate = () => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue), { shouldValidate: true });
      setIsSlugManuallyEdited(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border-2 border-[#3D2900] bg-card p-6 neo-shadow"
    >
      <div className="border-b border-border/60 pb-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {defaultValues?.name ? "Edit Informasi Produk" : "Tambah Produk Baru"}
        </h3>
        <p className="font-body text-xs text-muted-foreground">
          Isi detail informasi umum produk di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Nama Produk <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder="contoh: Robo Kit Car V2"
            {...register("name")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-danger font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-heading text-xs font-bold uppercase text-foreground">
              Slug URL <span className="text-danger">*</span>
            </label>
            <button
              type="button"
              onClick={handleSlugRegenerate}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-body"
              title="Generate ulang dari nama"
            >
              <RefreshCwIcon className="size-3" />
              <span>Auto-generate</span>
            </button>
          </div>
          <Input
            type="text"
            placeholder="robo-kit-car-v2"
            {...register("slug", {
              onChange: () => setIsSlugManuallyEdited(true),
            })}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug && (
            <p className="text-xs text-danger font-medium">{errors.slug.message}</p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            SKU Produk <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder="RKC-001"
            {...register("sku")}
            aria-invalid={Boolean(errors.sku)}
          />
          {errors.sku && (
            <p className="text-xs text-danger font-medium">{errors.sku.message}</p>
          )}
        </div>

        {/* Category ID */}
        <div className="space-y-1.5">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Kategori <span className="text-danger">*</span>
          </label>
          <select
            {...register("category_id")}
            aria-invalid={Boolean(errors.category_id)}
            className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-xs text-danger font-medium">
              {errors.category_id.message}
            </p>
          )}
        </div>

        {/* Product Type ID (Optional) */}
        <div className="space-y-1.5">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Tipe Produk <span className="text-muted-foreground">(Opsional)</span>
          </label>
          <select
            {...register("product_type_id")}
            className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 cursor-pointer"
          >
            <option value="">-- Tanpa Tipe Produk --</option>
            {productTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description (Optional) */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Deskripsi <span className="text-muted-foreground">(Opsional)</span>
          </label>
          <textarea
            rows={4}
            placeholder="Tuliskan deskripsi lengkap produk..."
            {...register("description")}
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="default"
          neo
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <SaveIcon className="size-4" />
              <span>Simpan Informasi Produk</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
