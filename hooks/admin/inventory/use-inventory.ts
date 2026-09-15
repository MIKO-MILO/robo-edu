import { useQuery } from "@tanstack/react-query";
import { getInventory } from "@/lib/api/endpoints/inventory";
import type { GetInventoryParams } from "@/lib/api/endpoints/inventory";

export function useInventory(params?: GetInventoryParams) {
  return useQuery({
    queryKey: ["admin", "inventory", params],
    queryFn: () => getInventory(params),
    staleTime: 1000 * 60 * 2, // 2 menit — stok berubah lebih sering dari kategori
  });
}
