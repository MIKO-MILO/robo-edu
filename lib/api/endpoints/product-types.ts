import { http } from "@/lib/api/client";
import type { ApiCollectionResponse, ProductType } from "@/types";

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
];

/**
 * GET /product-types
 * Mengambil daftar tipe produk.
 */
export async function getProductTypes(): Promise<
  ApiCollectionResponse<ProductType>
> {
  try {
    return await http.get<ApiCollectionResponse<ProductType>>("/product-types");
  } catch (error) {
    // Fallback ke mock data jika backend belum tersedia
    return {
      success: true,
      data: MOCK_PRODUCT_TYPES,
      meta: {
        current_page: 1,
        per_page: 20,
        total_pages: 1,
        total_count: MOCK_PRODUCT_TYPES.length,
      },
    };
  }
}
