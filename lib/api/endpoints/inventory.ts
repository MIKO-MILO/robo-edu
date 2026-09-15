import { http } from "@/lib/api/client";
import type {
  ApiCollectionResponse,
  ListQueryParams,
  LowStockItem,
  InventoryVariantRow,
} from "@/types";
import type { ProductStatus } from "@/types/enums";

export type GetInventoryParams = ListQueryParams & {
  /** Filter berdasarkan status variant: ACTIVE, INACTIVE, OUT_OF_STOCK, dll. */
  status?: ProductStatus;
  /** Jika true, hanya tampilkan variant dengan stok <= LOW_STOCK_THRESHOLD. */
  low_stock?: boolean;
};

/** Batas stok yang dianggap "menipis" — dipakai untuk pewarnaan dan filter. */
export const LOW_STOCK_THRESHOLD = 10;

/* ---------------------- Mock Fallback Data ---------------------- */

const MOCK_INVENTORY: InventoryVariantRow[] = [
  {
    variant_id: "var-1111-1111-1111-111111111111",
    variant_name: "Merah",
    variant_sku: "RKC-001-RED",
    stock: 12,
    status: "ACTIVE",
    product_id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
    product_name: "Robo Kit Car",
    product_sku: "RKC-001",
    category_name: "Robot Kit",
    price: 450000,
    updated_at: "2026-08-10T08:00:00Z",
  },
  {
    variant_id: "var-1112-1112-1112-111211121112",
    variant_name: "Biru",
    variant_sku: "RKC-001-BLUE",
    stock: 3,
    status: "ACTIVE",
    product_id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
    product_name: "Robo Kit Car",
    product_sku: "RKC-001",
    category_name: "Robot Kit",
    price: 450000,
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    variant_id: "var-2222-2222-2222-222222222222",
    variant_name: "Standard",
    variant_sku: "RKW-002-STD",
    stock: 25,
    status: "ACTIVE",
    product_id: "c8e7d2f1-69dd-5483-b678-1f13c3d4e580",
    product_name: "Robo Kit Wind Mill",
    product_sku: "RKW-002",
    category_name: "Robot Kit",
    price: 350000,
    updated_at: "2026-08-20T14:00:00Z",
  },
  {
    variant_id: "var-2223-2223-2223-222322232223",
    variant_name: "Deluxe",
    variant_sku: "RKW-002-DLX",
    stock: 0,
    status: "OUT_OF_STOCK",
    product_id: "c8e7d2f1-69dd-5483-b678-1f13c3d4e580",
    product_name: "Robo Kit Wind Mill",
    product_sku: "RKW-002",
    category_name: "Robot Kit",
    price: 420000,
    updated_at: "2026-09-05T09:30:00Z",
  },
  {
    variant_id: "var-3333-3333-3333-333333333333",
    variant_name: "Basic",
    variant_sku: "RKA-003-BSC",
    stock: 8,
    status: "ACTIVE",
    product_id: "d9f8e3a2-70ee-6594-c789-2024d4e5f691",
    product_name: "Robo Kit Animal",
    product_sku: "RKA-003",
    category_name: "Robot Kit",
    price: 280000,
    updated_at: "2026-09-10T16:00:00Z",
  },
  {
    variant_id: "var-4444-4444-4444-444444444444",
    variant_name: "Pro",
    variant_sku: "RKA-003-PRO",
    stock: 0,
    status: "INACTIVE",
    product_id: "d9f8e3a2-70ee-6594-c789-2024d4e5f691",
    product_name: "Robo Kit Animal",
    product_sku: "RKA-003",
    category_name: "Robot Kit",
    price: 390000,
    updated_at: "2026-07-15T11:00:00Z",
  },
];

const MOCK_LOW_STOCK: LowStockItem[] = [
  {
    product_id: "b7e6c1f0-58cc-4372-a567-0e02b2c3d479",
    product_name: "Robo Kit Car",
    variant_id: "var-1112-1112-1112-111211121112",
    variant_name: "Biru",
    stock: 3,
    threshold: LOW_STOCK_THRESHOLD,
  },
  {
    product_id: "d9f8e3a2-70ee-6594-c789-2024d4e5f691",
    product_name: "Robo Kit Animal",
    variant_id: "var-3333-3333-3333-333333333333",
    variant_name: "Basic",
    stock: 8,
    threshold: LOW_STOCK_THRESHOLD,
  },
  {
    product_id: "c8e7d2f1-69dd-5483-b678-1f13c3d4e580",
    product_name: "Robo Kit Wind Mill",
    variant_id: "var-2223-2223-2223-222322232223",
    variant_name: "Deluxe",
    stock: 0,
    threshold: LOW_STOCK_THRESHOLD,
  },
];

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /admin/inventory
 * Mengambil semua variant produk beserta info stok (flat join).
 */
export async function getInventory(
  params?: GetInventoryParams
): Promise<ApiCollectionResponse<InventoryVariantRow>> {
  try {
    return await http.get<ApiCollectionResponse<InventoryVariantRow>>(
      "/admin/inventory",
      { params }
    );
  } catch (error) {
    // Filter mock data sesuai params
    let data = [...MOCK_INVENTORY];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (row) =>
          row.product_name.toLowerCase().includes(q) ||
          row.variant_name.toLowerCase().includes(q) ||
          row.variant_sku.toLowerCase().includes(q) ||
          row.product_sku.toLowerCase().includes(q)
      );
    }

    if (params?.status) {
      data = data.filter((row) => row.status === params.status);
    }

    if (params?.low_stock) {
      data = data.filter((row) => row.stock <= LOW_STOCK_THRESHOLD);
    }

    const total = data.length;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 15;
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
 * GET /admin/inventory/low-stock
 * Mengambil variant dengan stok di bawah ambang batas (api.md §16).
 */
export async function getLowStockItems(): Promise<
  ApiCollectionResponse<LowStockItem>
> {
  try {
    return await http.get<ApiCollectionResponse<LowStockItem>>(
      "/admin/inventory/low-stock"
    );
  } catch (error) {
    return {
      success: true,
      data: MOCK_LOW_STOCK,
      meta: {
        current_page: 1,
        per_page: 50,
        total_pages: 1,
        total_count: MOCK_LOW_STOCK.length,
      },
    };
  }
}
