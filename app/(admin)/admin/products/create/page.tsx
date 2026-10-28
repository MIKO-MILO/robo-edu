"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateProduct,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useUploadProductImage,
  useDeleteProductImage,
  useReorderProductImage,
} from "@/hooks/admin/products";
import { useCategories } from "@/hooks/admin/categories/use-categories";
import { useProductTypes } from "@/hooks/admin/product-types/use-product-types";
import {
  ProductForm,
  VariantEditor,
  ProductImageManager,
  type VariantItem,
  type ImageItem,
} from "@/components/admin/products";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CheckCircle2Icon, CheckIcon } from "lucide-react";
import type {
  ProductDetail,
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
  UUID,
} from "@/types";
import type { ProductFormValues } from "@/lib/validations/product";

export default function CreateProductPage() {
  const router = useRouter();

  // Created product state after STEP 1 submit
  const [createdProduct, setCreatedProduct] = useState<ProductDetail | null>(null);

  // Local variants & images state for realtime UI update
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);

  // Hooks
  const { data: categoriesResponse } = useCategories();
  const { data: productTypesResponse } = useProductTypes();

  const createProductMutation = useCreateProduct();
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();
  const uploadImageMutation = useUploadProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const reorderImageMutation = useReorderProductImage();

  const categoriesList = categoriesResponse?.data || [];
  const productTypesList = productTypesResponse?.data || [];

  // STEP 1: Submit Form Data Produk
  const handleProductFormSubmit = async (data: ProductFormValues) => {
    const response = await createProductMutation.mutateAsync({
      category_id: data.category_id,
      product_type_id: data.product_type_id || null,
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description || null,
    });

    if (response.success && response.data) {
      setCreatedProduct(response.data);
      setVariantsList(response.data.variants || []);
      setImagesList(response.data.images || []);
    }
  };

  // STEP 2: Variant Handlers
  const handleCreateVariant = async (body: CreateVariantRequestBody) => {
    if (!createdProduct) return;
    const response = await createVariantMutation.mutateAsync({
      productId: createdProduct.id,
      body,
    });

    if (response.success && response.data) {
      setVariantsList((prev) => [...prev, response.data]);
    }
  };

  const handleUpdateVariant = async (
    variantId: UUID,
    body: UpdateVariantRequestBody
  ) => {
    if (!createdProduct) return;
    const response = await updateVariantMutation.mutateAsync({
      variantId,
      productId: createdProduct.id,
      body,
    });

    if (response.success && response.data) {
      setVariantsList((prev) =>
        prev.map((v) => (v.id === variantId ? response.data : v))
      );
    }
  };

  const handleDeleteVariant = async (variantId: UUID) => {
    if (!createdProduct) return;
    if (window.confirm("Hapus varian ini?")) {
      const response = await deleteVariantMutation.mutateAsync({
        variantId,
        productId: createdProduct.id,
      });

      if (response.success) {
        setVariantsList((prev) => prev.filter((v) => v.id !== variantId));
      }
    }
  };

  // STEP 2: Image Handlers
  const handleUploadImage = async (file: File) => {
    if (!createdProduct) return;
    const response = await uploadImageMutation.mutateAsync({
      productId: createdProduct.id,
      file,
    });

    if (response.success && response.data) {
      setImagesList((prev) => [...prev, response.data]);
    }
  };

  const handleDeleteImage = async (imageId: UUID) => {
    if (!createdProduct) return;
    if (window.confirm("Hapus gambar ini?")) {
      const response = await deleteImageMutation.mutateAsync({
        imageId,
        productId: createdProduct.id,
      });

      if (response.success) {
        setImagesList((prev) => prev.filter((img) => img.id !== imageId));
      }
    }
  };

  const handleReorderImage = async (
    imageId: UUID,
    body: { sort_order?: number; is_primary?: boolean }
  ) => {
    if (!createdProduct) return;
    const response = await reorderImageMutation.mutateAsync({
      imageId,
      productId: createdProduct.id,
      body,
    });

    if (response.success && response.data) {
      setImagesList((prev) =>
        prev.map((img) => {
          if (img.id === imageId) {
            return response.data;
          }
          if (body.is_primary) {
            return { ...img, is_primary: false };
          }
          return img;
        })
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            neo
            onClick={() => router.push("/admin/products")}
            title="Kembali ke Daftar Produk"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
              Tambah Produk Baru
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {createdProduct
                ? `Langkah 2 dari 2: Tambahkan varian & foto untuk "${createdProduct.name}"`
                : "Langkah 1 dari 2: Isi detail informasi dasar produk"}
            </p>
          </div>
        </div>

        {createdProduct && (
          <Button
            type="button"
            variant="accent-green"
            size="default"
            neo
            onClick={() => router.push("/admin/products")}
          >
            <CheckCircle2Icon className="size-4" />
            <span>Selesai & Lihat Produk</span>
          </Button>
        )}
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-2xl border-2 border-[#3D2900] bg-card neo-shadow">
        <div className={`flex items-center gap-2 text-xs font-bold font-heading px-3 py-1.5 rounded-full border-2 border-[#3D2900] ${createdProduct ? "bg-emerald-100 text-emerald-800" : "bg-accent-yellow text-[#3D2900]"}`}>
          {createdProduct ? <CheckIcon className="size-3.5" /> : <span>1</span>}
          <span>Informasi Produk</span>
        </div>
        <div className="h-0.5 flex-1 bg-border" />
        <div className={`flex items-center gap-2 text-xs font-bold font-heading px-3 py-1.5 rounded-full border-2 border-[#3D2900] ${createdProduct ? "bg-accent-yellow text-[#3D2900]" : "bg-muted text-muted-foreground opacity-60"}`}>
          <span>2</span>
          <span>Varian & Foto Produk</span>
        </div>
      </div>

      {/* Step 1 Form */}
      <ProductForm
        categories={categoriesList}
        productTypes={productTypesList}
        onSubmit={handleProductFormSubmit}
        isSubmitting={createProductMutation.isPending}
      />

      {/* Step 2 Section: Varian Editor */}
      <VariantEditor
        productId={createdProduct?.id}
        variants={variantsList}
        disabled={!createdProduct}
        onCreateVariant={handleCreateVariant}
        onUpdateVariant={handleUpdateVariant}
        onDeleteVariant={handleDeleteVariant}
        isSubmitting={
          createVariantMutation.isPending ||
          updateVariantMutation.isPending ||
          deleteVariantMutation.isPending
        }
      />

      {/* Step 2 Section: Image Manager */}
      <ProductImageManager
        productId={createdProduct?.id}
        images={imagesList}
        disabled={!createdProduct}
        onUploadImage={handleUploadImage}
        onDeleteImage={handleDeleteImage}
        onReorderImage={handleReorderImage}
        isUploading={
          uploadImageMutation.isPending ||
          deleteImageMutation.isPending ||
          reorderImageMutation.isPending
        }
      />
    </div>
  );
}
