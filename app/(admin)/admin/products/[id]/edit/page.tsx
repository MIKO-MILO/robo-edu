"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useProduct,
  useUpdateProduct,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import type {
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
  UUID,
} from "@/types";
import type { ProductFormValues } from "@/lib/validations/product";

export default function EditProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const productId = params.id;
  const router = useRouter();

  // Fetch product detail
  const {
    data: productResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(productId);

  const { data: categoriesResponse } = useCategories();
  const { data: productTypesResponse } = useProductTypes();

  // Mutations
  const updateProductMutation = useUpdateProduct();
  const createVariantMutation = useCreateVariant();
  const updateVariantMutation = useUpdateVariant();
  const deleteVariantMutation = useDeleteVariant();
  const uploadImageMutation = useUploadProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const reorderImageMutation = useReorderProductImage();

  const productDetail = productResponse?.data;
  const categoriesList = categoriesResponse?.data || [];
  const productTypesList = productTypesResponse?.data || [];

  // Local state for variants and images
  const [variantsList, setVariantsList] = useState<VariantItem[]>([]);
  const [imagesList, setImagesList] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (productDetail) {
      setVariantsList(productDetail.variants || []);
      setImagesList(productDetail.images || []);
    }
  }, [productDetail]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !productDetail) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl border-2 border-[#3D2900] bg-danger-bg text-danger text-center space-y-4 neo-shadow">
        <AlertTriangleIcon className="size-12 mx-auto text-danger" />
        <h3 className="font-heading text-lg font-bold">Produk Tidak Ditemukan</h3>
        <p className="font-body text-xs md:text-sm">
          {error instanceof Error ? error.message : "Gagal memuat data produk."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push("/admin/products")}>
            Kembali
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  // Update Main Product Form
  const handleProductFormSubmit = async (data: ProductFormValues) => {
    await updateProductMutation.mutateAsync({
      id: productId,
      body: {
        category_id: data.category_id,
        product_type_id: data.product_type_id || null,
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description || null,
      },
    });
  };

  // Variant Handlers
  const handleCreateVariant = async (body: CreateVariantRequestBody) => {
    const response = await createVariantMutation.mutateAsync({
      productId,
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
    const response = await updateVariantMutation.mutateAsync({
      variantId,
      productId,
      body,
    });

    if (response.success && response.data) {
      setVariantsList((prev) =>
        prev.map((v) => (v.id === variantId ? response.data : v))
      );
    }
  };

  const handleDeleteVariant = async (variantId: UUID) => {
    if (window.confirm("Hapus varian ini?")) {
      const response = await deleteVariantMutation.mutateAsync({
        variantId,
        productId,
      });

      if (response.success) {
        setVariantsList((prev) => prev.filter((v) => v.id !== variantId));
      }
    }
  };

  // Image Handlers
  const handleUploadImage = async (file: File) => {
    const response = await uploadImageMutation.mutateAsync({
      productId,
      file,
    });

    if (response.success && response.data) {
      setImagesList((prev) => [...prev, response.data]);
    }
  };

  const handleDeleteImage = async (imageId: UUID) => {
    if (window.confirm("Hapus gambar ini?")) {
      const response = await deleteImageMutation.mutateAsync({
        imageId,
        productId,
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
    const response = await reorderImageMutation.mutateAsync({
      imageId,
      productId,
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
            neo={false}
            onClick={() => router.push("/admin/products")}
            title="Kembali ke Daftar Produk"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
              Edit Produk: {productDetail.name}
            </h1>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Ubah detail produk, atur varian harga & stok kuota, atau kelola foto produk.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="accent-green"
          size="default"
          neo
          onClick={() => router.push("/admin/products")}
        >
          <CheckCircle2Icon className="size-4" />
          <span>Selesai Edit</span>
        </Button>
      </div>

      {/* Main Product Form */}
      <ProductForm
        defaultValues={{
          name: productDetail.name,
          slug: productDetail.slug,
          sku: productDetail.sku,
          category_id: productDetail.category?.id || "",
          product_type_id: productDetail.product_type?.id || null,
          description: productDetail.description || "",
        }}
        categories={categoriesList}
        productTypes={productTypesList}
        onSubmit={handleProductFormSubmit}
        isSubmitting={updateProductMutation.isPending}
      />

      {/* Varian Editor */}
      <VariantEditor
        productId={productId}
        variants={variantsList}
        onCreateVariant={handleCreateVariant}
        onUpdateVariant={handleUpdateVariant}
        onDeleteVariant={handleDeleteVariant}
        isSubmitting={
          createVariantMutation.isPending ||
          updateVariantMutation.isPending ||
          deleteVariantMutation.isPending
        }
      />

      {/* Image Manager */}
      <ProductImageManager
        productId={productId}
        images={imagesList}
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
