"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  variantFormSchema,
  type VariantFormValues,
} from "@/lib/validations/product";
import type {
  UUID,
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
} from "@/types";
import { VariantRow, type VariantItem } from "./variant-row";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PlusIcon, SaveIcon, XIcon, AlertCircleIcon, LayersIcon } from "lucide-react";

export interface VariantEditorProps {
  productId?: UUID;
  variants: VariantItem[];
  disabled?: boolean; // True jika produk belum disimpan
  onCreateVariant?: (body: CreateVariantRequestBody) => void | Promise<void>;
  onUpdateVariant?: (
    variantId: UUID,
    body: UpdateVariantRequestBody
  ) => void | Promise<void>;
  onDeleteVariant?: (variantId: UUID) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function VariantEditor({
  productId,
  variants = [],
  disabled,
  onCreateVariant,
  onUpdateVariant,
  onDeleteVariant,
  isSubmitting,
}: VariantEditorProps) {
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      variant_name: "",
      sku: "",
      price: 0,
      reseller_price: null,
      stock: 0,
      weight: null,
      status: "ACTIVE",
    },
  });

  const handleOpenAddForm = () => {
    setEditingVariant(null);
    reset({
      variant_name: "",
      sku: "",
      price: 0,
      reseller_price: null,
      stock: 0,
      weight: null,
      status: "ACTIVE",
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (variant: VariantItem) => {
    setEditingVariant(variant);
    reset({
      variant_name: variant.variant_name,
      sku: variant.sku,
      price: variant.price,
      reseller_price: variant.reseller_price ?? null,
      stock: variant.stock,
      weight: variant.weight ?? null,
      status: variant.status,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVariant(null);
  };

  const handleFormSubmit = async (data: VariantFormValues) => {
    const payload: CreateVariantRequestBody = {
      variant_name: data.variant_name,
      sku: data.sku,
      price: data.price,
      reseller_price: Number.isNaN(data.reseller_price) ? null : (data.reseller_price ?? null),
      stock: data.stock,
      weight: Number.isNaN(data.weight) ? null : (data.weight ?? null),
      status: data.status,
    };

    if (editingVariant) {
      if (onUpdateVariant) {
        await onUpdateVariant(editingVariant.id, payload);
      }
    } else {
      if (onCreateVariant) {
        await onCreateVariant(payload);
      }
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-[#3D2900] bg-card p-6 neo-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
            <LayersIcon className="size-5 text-primary" />
            <span>Varian Produk & Stok (Kuota)</span>
          </h3>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            Setiap produk WAJIB memiliki minimal 1 varian untuk menentukan harga & kuota stok.
          </p>
        </div>

        {!disabled && !isFormOpen && (
          <Button
            type="button"
            variant="accent-yellow"
            size="sm"
            neo
            onClick={handleOpenAddForm}
          >
            <PlusIcon className="size-4" />
            <span>Tambah Varian</span>
          </Button>
        )}
      </div>

      {/* Disabled Notice if product not saved */}
      {disabled && (
        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#3D2900] bg-accent-yellow/20 text-[#3D2900]">
          <AlertCircleIcon className="size-5 shrink-0" />
          <p className="font-body text-xs font-semibold">
            Simpan data produk terlebih dahulu di atas sebelum dapat menambahkan varian, harga, dan stok kuota.
          </p>
        </div>
      )}

      {/* Warning if no variants exist yet */}
      {!disabled && variants.length === 0 && !isFormOpen && (
        <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border-2 border-dashed border-border bg-muted/30">
          <AlertCircleIcon className="size-8 text-amber-600 mb-2" />
          <h4 className="font-heading font-bold text-sm text-foreground">
            Produk Ini Belum Memiliki Varian!
          </h4>
          <p className="font-body text-xs text-muted-foreground max-w-sm mt-1 mb-3">
            Tabel produk tidak menyimpan harga langsung. Tambahkan minimal 1 varian agar produk ini memiliki harga dan kuota stok yang dapat dibeli.
          </p>
          <Button
            type="button"
            variant="accent-yellow"
            size="sm"
            neo
            onClick={handleOpenAddForm}
          >
            <PlusIcon className="size-4" />
            <span>Tambah Varian Pertama</span>
          </Button>
        </div>
      )}

      {/* Existing Variants List */}
      {!disabled && variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((v) => (
            <VariantRow
              key={v.id}
              variant={v}
              disabled={disabled || isSubmitting}
              onEdit={handleOpenEditForm}
              onDelete={onDeleteVariant}
            />
          ))}
        </div>
      )}

      {/* Form Tambah / Edit Variant */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 p-4 rounded-xl border-2 border-[#3D2900] bg-accent-soft-blue/20 neo-shadow"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h4 className="font-heading font-bold text-sm text-foreground">
              {editingVariant ? `Edit Varian: ${editingVariant.variant_name}` : "Tambah Varian Baru"}
            </h4>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Variant Name */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Nama Varian <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="mis. Merah / Basic"
                {...register("variant_name")}
                aria-invalid={Boolean(errors.variant_name)}
              />
              {errors.variant_name && (
                <p className="text-xs text-danger font-medium">{errors.variant_name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                SKU Varian <span className="text-danger">*</span>
              </label>
              <Input
                type="text"
                placeholder="RKC-001-RED"
                {...register("sku")}
                aria-invalid={Boolean(errors.sku)}
              />
              {errors.sku && (
                <p className="text-xs text-danger font-medium">{errors.sku.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Harga Normal (IDR) <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                placeholder="450000"
                {...register("price", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.price)}
              />
              {errors.price && (
                <p className="text-xs text-danger font-medium">{errors.price.message}</p>
              )}
            </div>

            {/* Reseller Price */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Harga Reseller (IDR) <span className="text-muted-foreground">(Opsional)</span>
              </label>
              <Input
                type="number"
                placeholder="400000"
                {...register("reseller_price", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.reseller_price)}
              />
              {errors.reseller_price && (
                <p className="text-xs text-danger font-medium">{errors.reseller_price.message}</p>
              )}
            </div>

            {/* Stock (Kuota) */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Stok / Kuota Produksi <span className="text-danger">*</span>
              </label>
              <Input
                type="number"
                placeholder="10"
                {...register("stock", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.stock)}
              />
              {errors.stock && (
                <p className="text-xs text-danger font-medium">{errors.stock.message}</p>
              )}
            </div>

            {/* Weight (Optional) */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Berat (kg) <span className="text-muted-foreground">(Opsional)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.5"
                {...register("weight", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.weight)}
              />
              {errors.weight && (
                <p className="text-xs text-danger font-medium">{errors.weight.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-heading text-xs font-bold uppercase text-foreground">
                Status Varian
              </label>
              <select
                {...register("status")}
                className="h-10 w-full rounded-full border border-border bg-background px-4 text-sm font-body outline-none focus-visible:border-ring focus-visible:ring-2 cursor-pointer"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Nonaktif</option>
                <option value="OUT_OF_STOCK">Stok Habis</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              neo
              onClick={handleCloseForm}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
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
                  <span>{editingVariant ? "Update Varian" : "Simpan Varian"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
