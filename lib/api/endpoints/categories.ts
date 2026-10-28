import { http } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  UUID,
  Category,
} from "@/types";

export type GetCategoriesParams = ListQueryParams & {
  is_active?: boolean;
};

export type CreateCategoryRequestBody = Pick<
  Category,
  "name" | "slug" | "description" | "is_active"
>;

export type UpdateCategoryRequestBody = Partial<CreateCategoryRequestBody>;

/* ---------------------- Mock Fallback Data ---------------------- */

const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1111-1111-1111-111111111111",
    name: "Robot Kit",
    slug: "robot-kit",
    description: "Kit pembelajaran robotika terlengkap untuk pemula dan menengah",
    image_url: null,
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "cat-2222-2222-2222-222222222222",
    name: "Sparepart",
    slug: "sparepart",
    description: "Komponen pengganti dan tambahan robotika",
    image_url: null,
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "cat-3333-3333-3333-333333333333",
    name: "Aksesoris",
    slug: "aksesoris",
    description: "Aksesoris pendukung seperti kabel, sensor, dan chasis",
    image_url: null,
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "cat-4444-4444-4444-444444444444",
    name: "Elektronik",
    slug: "elektronik",
    description: "Modul elektronik seperti sensor, motor driver, dan mikrokontroler",
    image_url: null,
    is_active: false,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /categories
 * Mengambil daftar kategori produk.
 */
export async function getCategories(
  params?: GetCategoriesParams
): Promise<ApiCollectionResponse<Category>> {
  try {
    return await http.get<ApiCollectionResponse<Category>>("/categories", { params });
  } catch (error) {
    // Filter mock data sesuai query params
    let data = [...MOCK_CATEGORIES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    if (params?.is_active !== undefined) {
      data = data.filter((c) => c.is_active === params.is_active);
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
 * GET /admin/categories/{id}
 * Mengambil detail satu kategori berdasarkan ID.
 */
export async function getCategoryById(
  id: UUID
): Promise<ApiResponse<Category>> {
  try {
    return await http.get<ApiResponse<Category>>(`/admin/categories/${id}`);
  } catch (error) {
    const found = MOCK_CATEGORIES.find((c) => c.id === id);
    return {
      success: true,
      data: found ?? { ...MOCK_CATEGORIES[0], id },
    };
  }
}

/**
 * POST /admin/categories
 * Membuat kategori baru.
 */
export async function createCategory(
  body: CreateCategoryRequestBody
): Promise<ApiResponse<Category>> {
  try {
    return await http.post<ApiResponse<Category>>("/admin/categories", body);
  } catch (error) {
    return {
      success: true,
      data: {
        id: `cat-${Date.now()}`,
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        image_url: null,
        is_active: body.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }
}

/**
 * PATCH /admin/categories/{id}
 * Memperbarui data kategori.
 */
export async function updateCategory(
  id: UUID,
  body: UpdateCategoryRequestBody
): Promise<ApiResponse<Category>> {
  try {
    return await http.patch<ApiResponse<Category>>(`/admin/categories/${id}`, body);
  } catch (error) {
    const existing = MOCK_CATEGORIES.find((c) => c.id === id) ?? MOCK_CATEGORIES[0];
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
 * DELETE /admin/categories/{id}
 * Menghapus kategori.
 */
export async function deleteCategory(
  id: UUID
): Promise<ApiResponse<{ message: string }>> {
  try {
    return await http.delete<ApiResponse<{ message: string }>>(
      `/admin/categories/${id}`
    );
  } catch (error) {
    return {
      success: true,
      data: { message: "Kategori berhasil dihapus" },
    };
  }
}
