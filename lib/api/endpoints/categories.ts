import { http } from "@/lib/api/client";
import type { ApiCollectionResponse, Category } from "@/types";

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
];

/**
 * GET /categories
 * Mengambil daftar kategori produk.
 */
export async function getCategories(): Promise<ApiCollectionResponse<Category>> {
  try {
    return await http.get<ApiCollectionResponse<Category>>("/categories");
  } catch (error) {
    // Fallback ke mock data jika backend belum tersedia
    return {
      success: true,
      data: MOCK_CATEGORIES,
      meta: {
        current_page: 1,
        per_page: 20,
        total_pages: 1,
        total_count: MOCK_CATEGORIES.length,
      },
    };
  }
}
