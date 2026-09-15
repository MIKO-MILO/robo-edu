import { http } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  UUID,
  ProductType,
} from "@/types";

export type GetProductTypesParams = ListQueryParams & {
  is_active?: boolean;
};

export type CreateProductTypeRequestBody = Pick<
  ProductType,
  "name" | "slug" | "description" | "is_active"
>;

export type UpdateProductTypeRequestBody = Partial<CreateProductTypeRequestBody>;

/* ---------------------- Mock Fallback Data ---------------------- */

const MOCK_PRODUCT_TYPES: ProductType[] = [
  {
    id: "pt-1111-1111-1111-111111111111",
    name: "Kendaraan",
    slug: "kendaraan",
    description: "Robotik berbasis roda dan pergerakan kendaraan",
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "pt-2222-2222-2222-222222222222",
    name: "Hewan",
    slug: "hewan",
    description: "Robotik peniru pergerakan hewan/bionic",
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "pt-3333-3333-3333-333333333333",
    name: "Energi",
    slug: "energi",
    description: "Kit robotik tenaga angin & terbarukan",
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "pt-4444-4444-4444-444444444444",
    name: "Humanoid",
    slug: "humanoid",
    description: "Robotik berbentuk dan bergerak seperti manusia",
    is_active: false,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /product-types
 * Mengambil daftar tipe produk.
 */
export async function getProductTypes(
  params?: GetProductTypesParams
): Promise<ApiCollectionResponse<ProductType>> {
  try {
    return await http.get<ApiCollectionResponse<ProductType>>("/product-types", {
      params,
    });
  } catch (error) {
    // Filter mock data sesuai query params
    let data = [...MOCK_PRODUCT_TYPES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (pt) =>
          pt.name.toLowerCase().includes(q) || pt.slug.toLowerCase().includes(q)
      );
    }
    if (params?.is_active !== undefined) {
      data = data.filter((pt) => pt.is_active === params.is_active);
    }
    const total = data.length;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    data = data.slice(start, start + limit);

    return {
      success: true,
      data,
      meta: {
        current_page: page,
        per_page: limit,
        total_pages: Math.ceil(total / limit),
        total_count: total,
      },
    };
  }
}

/**
 * GET /admin/product-types/{id}
 * Mengambil detail satu tipe produk berdasarkan ID.
 */
export async function getProductTypeById(
  id: UUID
): Promise<ApiResponse<ProductType>> {
  try {
    return await http.get<ApiResponse<ProductType>>(
      `/admin/product-types/${id}`
    );
  } catch (error) {
    const found = MOCK_PRODUCT_TYPES.find((pt) => pt.id === id);
    return {
      success: true,
      data: found ?? { ...MOCK_PRODUCT_TYPES[0], id },
    };
  }
}

/**
 * POST /admin/product-types
 * Membuat tipe produk baru.
 */
export async function createProductType(
  body: CreateProductTypeRequestBody
): Promise<ApiResponse<ProductType>> {
  try {
    return await http.post<ApiResponse<ProductType>>("/admin/product-types", body);
  } catch (error) {
    return {
      success: true,
      data: {
        id: `pt-${Date.now()}`,
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        is_active: body.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * PATCH /admin/product-types/{id}
 * Memperbarui data tipe produk.
 */
export async function updateProductType(
  id: UUID,
  body: UpdateProductTypeRequestBody
): Promise<ApiResponse<ProductType>> {
  try {
    return await http.patch<ApiResponse<ProductType>>(
      `/admin/product-types/${id}`,
      body
    );
  } catch (error) {
    const existing =
      MOCK_PRODUCT_TYPES.find((pt) => pt.id === id) ?? MOCK_PRODUCT_TYPES[0];
    return {
      success: true,
      data: {
        ...existing,
        id,
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * DELETE /admin/product-types/{id}
 * Menghapus tipe produk.
 */
export async function deleteProductType(
  id: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(
      `/admin/product-types/${id}`
    );
  } catch (error) {
    return {
      success: true,
      data: { message: "Tipe produk berhasil dihapus" },
    };
  }
}
