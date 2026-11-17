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
  /** Jika true, hanya tampilkan variant dengan stok di bawah threshold. */
  low_stock?: boolean;
};

/** Batas stok yang dianggap "menipis" — dipakai untuk pewarnaan dan filter UI. */
export const LOW_STOCK_THRESHOLD = 10;

/* ---------------------- Endpoint Functions ---------------------- */

/**
 * GET /admin/inventory
 * Mengambil semua variant produk beserta info stok (flat join product + category).
 */
export async function getInventory(
  params?: GetInventoryParams
): Promise<ApiCollectionResponse<InventoryVariantRow>> {
  return http.get<ApiCollectionResponse<InventoryVariantRow>>(
    "/admin/inventory",
    { params }
  );
}

/**
 * GET /admin/inventory/low-stock
 * Mengambil variant dengan stok di bawah ambang batas per-variant.
 */
export async function getLowStockItems(): Promise<
  ApiCollectionResponse<LowStockItem>
> {
  return http.get<ApiCollectionResponse<LowStockItem>>(
    "/admin/inventory/low-stock"
  );
}
