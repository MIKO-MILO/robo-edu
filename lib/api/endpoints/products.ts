import { http } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  UUID,
  ProductListItem,
  ProductDetail,
  ProductVariant,
  ProductImage,
  CreateProductRequestBody,
  UpdateProductRequestBody,
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
} from "@/types";

export type GetProductsParams = ListQueryParams & {
  category?: string;
  product_type?: string;
  status?: string;
};

/* ----------------------------------------------------------------
 * Semua fungsi ini menggunakan NEXT_PUBLIC_API_URL sebagai base URL
 * (lihat lib/api/base-client.ts). Set env tersebut ke
 * http://localhost:3000/api agar request masuk ke route handler
 * lokal Next.js di app/api/admin/...
 * ---------------------------------------------------------------- */

/**
 * GET /admin/products
 * Mengambil daftar produk untuk halaman admin (semua status).
 */
export async function getProducts(
  params?: GetProductsParams
): Promise<ApiCollectionResponse<ProductListItem>> {
  return http.get<ApiCollectionResponse<ProductListItem>>("/admin/products", {
    params,
  });
}

/**
 * GET /admin/products/{id}
 * Mengambil detail produk berdasarkan ID.
 */
export async function getProductById(
  id: UUID
): Promise<ApiResponse<ProductDetail>> {
  return http.get<ApiResponse<ProductDetail>>(`/admin/products/${id}`);
}

/**
 * POST /admin/products
 * Membuat produk baru.
 */
export async function createProduct(
  body: CreateProductRequestBody
): Promise<ApiResponse<ProductDetail>> {
  return http.post<ApiResponse<ProductDetail>>("/admin/products", body);
}

/**
 * PATCH /admin/products/{id}
 * Memperbarui informasi produk.
 */
export async function updateProduct(
  id: UUID,
  body: UpdateProductRequestBody
): Promise<ApiResponse<ProductDetail>> {
  return http.patch<ApiResponse<ProductDetail>>(`/admin/products/${id}`, body);
}

/**
 * DELETE /admin/products/{id}
 * Menonaktifkan produk (soft delete → status inactive).
 */
export async function deleteProduct(
  id: UUID
): Promise<ApiResponse<{ message: string }>> {
  return http.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
}

/**
 * POST /admin/products/{id}/variants
 * Menambahkan variant baru untuk produk tertentu.
 */
export async function createVariant(
  productId: UUID,
  body: CreateVariantRequestBody
): Promise<ApiResponse<ProductVariant>> {
  return http.post<ApiResponse<ProductVariant>>(
    `/admin/products/${productId}/variants`,
    body,
  );
}

/**
 * PATCH /admin/product-variants/{id}
 * Memperbarui variant produk.
 */
export async function updateVariant(
  variantId: UUID,
  body: UpdateVariantRequestBody
): Promise<ApiResponse<ProductVariant>> {
  return http.patch<ApiResponse<ProductVariant>>(
    `/admin/product-variants/${variantId}`,
    body,
  );
}

/**
 * DELETE /admin/product-variants/{id}
 * Menghapus variant produk.
 */
export async function deleteVariant(
  variantId: UUID
): Promise<ApiResponse<{ message: string }>> {
  return http.delete<ApiResponse<{ message: string }>>(
    `/admin/product-variants/${variantId}`,
  );
}

/**
 * POST /admin/products/{id}/images
 * Mengunggah gambar produk via multipart/form-data.
 */
export async function uploadProductImage(
  productId: UUID,
  file: File
): Promise<ApiResponse<ProductImage>> {
  const formData = new FormData();
  formData.append("file", file);

  return http.post<ApiResponse<ProductImage>>(
    `/admin/products/${productId}/images`,
    formData,
  );
}

/**
 * DELETE /admin/product-images/{id}
 * Menghapus gambar produk.
 */
export async function deleteProductImage(
  imageId: UUID
): Promise<ApiResponse<{ message: string }>> {
  return http.delete<ApiResponse<{ message: string }>>(
    `/admin/product-images/${imageId}`,
  );
}

/**
 * PATCH /admin/product-images/{id}/reorder
 * Mengatur ulang urutan atau status gambar utama (is_primary) produk.
 */
export async function reorderProductImage(
  imageId: UUID,
  body: { sort_order?: number; is_primary?: boolean }
): Promise<ApiResponse<ProductImage>> {
  return http.patch<ApiResponse<ProductImage>>(
    `/admin/product-images/${imageId}/reorder`,
    body,
  );
}
