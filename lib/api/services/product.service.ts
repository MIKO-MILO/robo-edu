import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Category,
  ProductType,
  ProductDetail,
  ProductListItem,
  ProductVariant,
  ProductImage,
  CreateProductRequestBody,
  UpdateProductRequestBody,
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
  ProductStatus,
} from "@/types";

export interface ProductListQueryParams extends ListQueryParams {
  category?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  rating_min?: number;
}

export const productService = {
  /** GET /products - List katalog produk */
  async getProducts(
    params?: ProductListQueryParams
  ): Promise<ApiCollectionResponse<ProductListItem>> {
    return http.get<ApiCollectionResponse<ProductListItem>>("/products", { params });
  },

  /** GET /products/{slug} - Detail produk */
  async getProductBySlug(slug: string): Promise<ApiResponse<ProductDetail>> {
    return http.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
  },

  /** GET /categories - List kategori aktif */
  async getCategories(): Promise<ApiCollectionResponse<Category>> {
    return http.get<ApiCollectionResponse<Category>>("/categories");
  },

  /** GET /categories/{slug} - Detail kategori */
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return http.get<ApiResponse<Category>>(`/categories/${slug}`);
  },

  /** GET /product-types - List tipe produk aktif */
  async getProductTypes(): Promise<ApiCollectionResponse<ProductType>> {
    return http.get<ApiCollectionResponse<ProductType>>("/product-types");
  },

  /** GET /product-types/{slug} - Detail tipe produk */
  async getProductTypeBySlug(slug: string): Promise<ApiResponse<ProductType>> {
    return http.get<ApiResponse<ProductType>>(`/product-types/${slug}`);
  },

  /** GET /products/{id}/variants - List variant produk */
  async getProductVariants(
    productId: string
  ): Promise<ApiCollectionResponse<ProductVariant>> {
    return http.get<ApiCollectionResponse<ProductVariant>>(
      `/products/${productId}/variants`
    );
  },

  /** GET /products/{id}/images - List gambar produk */
  async getProductImages(
    productId: string
  ): Promise<ApiCollectionResponse<ProductImage>> {
    return http.get<ApiCollectionResponse<ProductImage>>(
      `/products/${productId}/images`
    );
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** POST /admin/products - Buat produk baru */
  async createProduct(
    body: CreateProductRequestBody
  ): Promise<ApiResponse<ProductDetail>> {
    return http.post<ApiResponse<ProductDetail>>("/admin/products", body);
  },

  /** PATCH /admin/products/{id} - Update produk */
  async updateProduct(
    id: string,
    body: UpdateProductRequestBody
  ): Promise<ApiResponse<ProductDetail>> {
    return http.patch<ApiResponse<ProductDetail>>(`/admin/products/${id}`, body);
  },

  /** DELETE /admin/products/{id} - Nonaktifkan produk */
  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
  },

  /** PATCH /admin/products/{id}/status - Ubah status produk */
  async updateProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<ApiResponse<ProductDetail>> {
    return http.patch<ApiResponse<ProductDetail>>(`/admin/products/${id}/status`, {
      status,
    });
  },

  /** POST /admin/products/{id}/variants - Tambah variant */
  async createVariant(
    productId: string,
    body: CreateVariantRequestBody
  ): Promise<ApiResponse<ProductVariant>> {
    return http.post<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants`,
      body
    );
  },

  /** PATCH /admin/product-variants/{id} - Update variant */
  async updateVariant(
    variantId: string,
    body: UpdateVariantRequestBody
  ): Promise<ApiResponse<ProductVariant>> {
    return http.patch<ApiResponse<ProductVariant>>(
      `/admin/product-variants/${variantId}`,
      body
    );
  },

  /** DELETE /admin/product-variants/{id} - Hapus variant */
  async deleteVariant(variantId: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(
      `/admin/product-variants/${variantId}`
    );
  },

  /** POST /admin/products/{id}/images - Upload gambar */
  async uploadImage(
    productId: string,
    formData: FormData
  ): Promise<ApiResponse<ProductImage>> {
    return http.post<ApiResponse<ProductImage>>(
      `/admin/products/${productId}/images`,
      formData
    );
  },

  /** DELETE /admin/product-images/{id} - Hapus gambar */
  async deleteImage(imageId: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(
      `/admin/product-images/${imageId}`
    );
  },

  /** PATCH /admin/product-images/{id}/reorder - Ubah urutan/primary */
  async reorderImage(
    imageId: string,
    body: { sort_order?: number; is_primary?: boolean }
  ): Promise<ApiResponse<ProductImage>> {
    return http.patch<ApiResponse<ProductImage>>(
      `/admin/product-images/${imageId}/reorder`,
      body
    );
  },
};
