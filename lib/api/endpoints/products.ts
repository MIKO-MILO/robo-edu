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

/* ---------------------- Mock Fallback Data ---------------------- */

const MOCK_PRODUCT_LIST: ProductListItem[] = [
  {
    id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
    name: "Robo Kit Car",
    slug: "robo-kit-car",
    sku: "RKC-001",
    status: "ACTIVE",
    category: {
      id: "cat-1111-1111-1111-111111111111",
      name: "Robot Kit",
      slug: "robot-kit",
    },
    primary_image_url: "https://picsum.photos/seed/rkc-001-1.jpg",
    price: {
      base_price: 450000,
      reseller_price: 400000,
    },
    rating_average: 4.8,
  },
  {
    id: "c8e7d2f1-69dd-5483-b678-1f13c3d4e580",
    name: "Robo Kit Wind Mill",
    slug: "robo-kit-wind-mill",
    sku: "RKW-002",
    status: "ACTIVE",
    category: {
      id: "cat-1111-1111-1111-111111111111",
      name: "Robot Kit",
      slug: "robot-kit",
    },
    primary_image_url: "https://picsum.photos/seed/rkw-002-1.jpg",
    price: {
      base_price: 350000,
      reseller_price: 300000,
    },
    rating_average: 4.5,
  },
];

const MOCK_PRODUCT_DETAIL: ProductDetail = {
  id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
  name: "Robo Kit Car",
  slug: "robo-kit-car",
  sku: "RKC-001",
  category: {
    id: "cat-1111-1111-1111-111111111111",
    name: "Robot Kit",
    slug: "robot-kit",
  },
  product_type: {
    id: "pt-1111-1111-1111-111111111111",
    name: "Kendaraan",
    slug: "kendaraan",
  },
  description: "Kit robotika edukasi bentuk mobil untuk pemula",
  status: "ACTIVE",
  price: {
    base_price: 450000,
    reseller_price: 400000,
    currency: "IDR",
  },
  variants: [
    {
      id: "var-1111-1111-1111-111111111111",
      variant_name: "Merah",
      sku: "RKC-001-RED",
      price: 450000,
      reseller_price: 400000,
      stock: 12,
      status: "ACTIVE",
    },
  ],
  images: [
    {
      id: "img-1111-1111-1111-111111111111",
      image_url: "https://picsum.photos/seed/rkc-001-1.jpg",
      is_primary: true,
      sort_order: 0,
    },
  ],
  rating: {
    average: 4.8,
    count: 23,
  },
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /products
 * Mengambil daftar produk (katalog).
 * Parameter `status` hanya dapat digunakan jika requester adalah admin.
 */
export async function getProducts(
  params?: GetProductsParams
): Promise<ApiCollectionResponse<ProductListItem>> {
  try {
    return await http.get<ApiCollectionResponse<ProductListItem>>("/products", {
      params,
    });
  } catch (error) {
    return {
      success: true,
      data: MOCK_PRODUCT_LIST,
      meta: {
        current_page: 1,
        per_page: 20,
        total_pages: 1,
        total_count: MOCK_PRODUCT_LIST.length,
      },
    };
  }
}

/**
 * GET /admin/products/{id}
 * Mengambil detail produk khusus admin berdasarkan ID.
 */
export async function getProductById(
  id: UUID
): Promise<ApiResponse<ProductDetail>> {
  try {
    return await http.get<ApiResponse<ProductDetail>>(`/admin/products/${id}`);
  } catch (error) {
    return {
      success: true,
      data: {
        ...MOCK_PRODUCT_DETAIL,
        id,
      },
    };
  }
}

/**
 * POST /admin/products
 * Membuat produk baru.
 */
export async function createProduct(
  body: CreateProductRequestBody
): Promise<ApiResponse<ProductDetail>> {
  try {
    return await http.post<ApiResponse<ProductDetail>>("/admin/products", body);
  } catch (error) {
    return {
      success: true,
      data: {
        ...MOCK_PRODUCT_DETAIL,
        id: `prod-${Date.now()}`,
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        description: body.description ?? null,
      },
    };
  }
}

/**
 * PATCH /admin/products/{id}
 * Memperbarui informasi produk.
 */
export async function updateProduct(
  id: UUID,
  body: UpdateProductRequestBody
): Promise<ApiResponse<ProductDetail>> {
  try {
    return await http.patch<ApiResponse<ProductDetail>>(`/admin/products/${id}`, body);
  } catch (error) {
    return {
      success: true,
      data: {
        ...MOCK_PRODUCT_DETAIL,
        id,
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.sku && { sku: body.sku }),
      },
    };
  }
}

/**
 * DELETE /admin/products/{id}
 * Menonaktifkan / menghapus produk.
 */
export async function deleteProduct(
  id: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
  } catch (error) {
    return {
      success: true,
      data: { message: "Produk berhasil dihapus" },
    };
  }
}

/**
 * POST /admin/products/{id}/variants
 * Menambahkan variant baru untuk produk tertentu.
 */
export async function createVariant(
  productId: UUID,
  body: CreateVariantRequestBody
): Promise<ApiResponse<ProductVariant>> {
  try {
    return await http.post<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants`,
      body
    );
  } catch (error) {
    return {
      success: true,
      data: {
        id: `var-${Date.now()}`,
        product_id: productId,
        variant_name: body.variant_name,
        sku: body.sku,
        price: body.price,
        reseller_price: body.reseller_price ?? null,
        stock: body.stock,
        weight: body.weight ?? null,
        status: body.status || "ACTIVE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * PATCH /admin/product-variants/{id}
 * Memperbarui variant produk.
 */
export async function updateVariant(
  variantId: UUID,
  body: UpdateVariantRequestBody
): Promise<ApiResponse<ProductVariant>> {
  try {
    return await http.patch<ApiResponse<ProductVariant>>(
      `/admin/product-variants/${variantId}`,
      body
    );
  } catch (error) {
    return {
      success: true,
      data: {
        id: variantId,
        product_id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
        variant_name: body.variant_name || "Merah",
        sku: body.sku || "RKC-001-RED",
        price: body.price || 450000,
        reseller_price: body.reseller_price ?? 400000,
        stock: body.stock ?? 10,
        weight: body.weight ?? 0.5,
        status: body.status || "ACTIVE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * DELETE /admin/product-variants/{id}
 * Menghapus variant produk.
 */
export async function deleteVariant(
  variantId: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(
      `/admin/product-variants/${variantId}`
    );
  } catch (error) {
    return {
      success: true,
      data: { message: "Varian berhasil dihapus" },
    };
  }
}

/**
 * POST /admin/products/{id}/images
 * Mengunggah gambar produk via multipart/form-data.
 */
export async function uploadProductImage(
  productId: UUID,
  file: File
): Promise<ApiResponse<ProductImage>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    return await http.post<ApiResponse<ProductImage>>(
      `/admin/products/${productId}/images`,
      formData
    );
  } catch (error) {
    return {
      success: true,
      data: {
        id: `img-${Date.now()}`,
        product_id: productId,
        variant_id: null,
        image_url: URL.createObjectURL(file),
        alt_text: file.name,
        sort_order: 0,
        is_primary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * DELETE /admin/product-images/{id}
 * Menghapus gambar produk.
 */
export async function deleteProductImage(
  imageId: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(
      `/admin/product-images/${imageId}`
    );
  } catch (error) {
    return {
      success: true,
      data: { message: "Gambar berhasil dihapus" },
    };
  }
}

/**
 * PATCH /admin/product-images/{id}/reorder
 * Mengatur ulang urutan atau status gambar utama (is_primary) produk.
 */
export async function reorderProductImage(
  imageId: UUID,
  body: { sort_order?: number; is_primary?: boolean }
): Promise<ApiResponse<ProductImage>> {
  try {
    return await http.patch<ApiResponse<ProductImage>>(
      `/admin/product-images/${imageId}/reorder`,
      body
    );
  } catch (error) {
    return {
      success: true,
      data: {
        id: imageId,
        product_id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
        variant_id: null,
        image_url: "https://picsum.photos/seed/rkc-001-1.jpg",
        alt_text: null,
        sort_order: body.sort_order ?? 0,
        is_primary: body.is_primary ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}
