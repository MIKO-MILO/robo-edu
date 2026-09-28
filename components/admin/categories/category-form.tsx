"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categoryFormSchema,
  generateCategorySlug,
  type CategoryFormValues,
} from "@/lib/validations/category";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon, RefreshCwIcon } from "lucide-react";

export interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      is_active: true,
      ...defaultValues,
    },
  });

  const nameValue = watch("name");
  const isActiveValue = watch("is_active");

  // Auto-generate slug dari name jika belum di-edit manual
  useEffect(() => {
    if (nameValue && !isSlugManuallyEdited && !defaultValues?.slug) {
      setValue("slug", generateCategorySlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, isSlugManuallyEdited, defaultValues?.slug, setValue]);

  const handleSlugRegenerate = () => {
    if (nameValue) {
      setValue("slug", generateCategorySlug(nameValue), { shouldValidate: true });
      setIsSlugManuallyEdited(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 font-body"
    >
      {/* Section Header */}
      <div className="border-b border-border/60 pb-3">
        <h3 className="font-heading text-lg font-bold text-foreground">
          {defaultValues?.name ? "Edit Kategori" : "Tambah Kategori Baru"}
        </h3>
        <p className="font-body text-xs text-muted-foreground">
          Isi detail informasi kategori produk di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Nama Kategori <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder="contoh: Robot Kit"
            {...register("name")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs text-danger font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5 md:col-span-2">
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
            placeholder="robot-kit"
            {...register("slug", {
              onChange: () => setIsSlugManuallyEdited(true),
            })}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug && (
            <p className="text-xs text-danger font-medium">{errors.slug.message}</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Digunakan sebagai URL. Contoh: /product?category=robot-kit
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Deskripsi{" "}
            <span className="text-muted-foreground font-normal normal-case">(Opsional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan deskripsi singkat kategori ini..."
            {...register("description")}
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 placeholder:text-muted-foreground resize-none"
          />
          {errors.description && (
            <p className="text-xs text-danger font-medium">{errors.description.message}</p>
          )}
        </div>

        {/* Status Toggle */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Status Kategori
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isActiveValue}
            onClick={() => setValue("is_active", !isActiveValue, { shouldValidate: true })}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 w-full text-left transition-colors cursor-pointer ${
              isActiveValue
                ? "border-success bg-success-bg"
                : "border-border bg-muted/40"
            }`}
          >
            {/* Toggle pill */}
            <div
              className={`relative flex-shrink-0 w-10 h-5 rounded-full border-2 transition-colors ${
                isActiveValue ? "bg-success border-success" : "bg-muted border-border"
              }`}
            >
              <div
                className={`absolute top-0.5 size-3.5 rounded-full bg-white shadow transition-transform ${
                  isActiveValue ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">
                {isActiveValue ? "Aktif" : "Nonaktif"}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {isActiveValue
                  ? "Kategori ini tampil di halaman produk"
                  : "Kategori ini disembunyikan dari halaman produk"}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="default"
          neo={false}
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
              <span>{defaultValues?.name ? "Simpan Perubahan" : "Simpan Kategori"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
