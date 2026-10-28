"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productTypeFormSchema,
  generateProductTypeSlug,
  type ProductTypeFormValues,
} from "@/lib/validations/product-type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon, RefreshCwIcon } from "lucide-react";

export interface ProductTypeFormProps {
  defaultValues?: Partial<ProductTypeFormValues>;
  onSubmit: (data: ProductTypeFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function ProductTypeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProductTypeFormProps) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeFormSchema),
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
      setValue("slug", generateProductTypeSlug(nameValue), {
        shouldValidate: true,
      });
    }
  }, [nameValue, isSlugManuallyEdited, defaultValues?.slug, setValue]);

  const handleSlugRegenerate = () => {
    if (nameValue) {
      setValue("slug", generateProductTypeSlug(nameValue), {
        shouldValidate: true,
      });
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
          {defaultValues?.name ? "Edit Tipe Produk" : "Tambah Tipe Produk Baru"}
        </h3>
        <p className="font-body text-xs text-muted-foreground">
          Isi detail informasi tipe produk di bawah ini.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Nama Tipe Produk <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder="contoh: Kendaraan"
            {...register("name")}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs font-medium text-danger">
              {errors.name.message}
            </p>
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
              className="flex items-center gap-1 font-body text-xs text-primary hover:underline"
              title="Generate ulang dari nama"
            >
              <RefreshCwIcon className="size-3" />
              <span>Auto-generate</span>
            </button>
          </div>
          <Input
            type="text"
            placeholder="kendaraan"
            {...register("slug", {
              onChange: () => setIsSlugManuallyEdited(true),
            })}
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug && (
            <p className="text-xs font-medium text-danger">
              {errors.slug.message}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Digunakan sebagai URL. Contoh: /product?type=kendaraan
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Deskripsi{" "}
            <span className="font-normal normal-case text-muted-foreground">
              (Opsional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan deskripsi singkat tipe produk ini..."
            {...register("description")}
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 font-body text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          {errors.description && (
            <p className="text-xs font-medium text-danger">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status Toggle */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="font-heading text-xs font-bold uppercase text-foreground">
            Status Tipe Produk
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isActiveValue}
            onClick={() =>
              setValue("is_active", !isActiveValue, { shouldValidate: true })
            }
            className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${
              isActiveValue
                ? "border-success bg-success-bg"
                : "border-border bg-muted/40"
            }`}
          >
            {/* Toggle pill */}
            <div
              className={`relative h-5 w-10 flex-shrink-0 rounded-full border-2 transition-colors ${
                isActiveValue ? "border-success bg-success" : "border-border bg-muted"
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
                  ? "Tipe produk ini tampil sebagai pilihan di form produk"
                  : "Tipe produk ini disembunyikan dari pilihan form produk"}
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
              <span>
                {defaultValues?.name ? "Simpan Perubahan" : "Simpan Tipe Produk"}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
