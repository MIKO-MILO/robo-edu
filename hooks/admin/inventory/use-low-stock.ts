import { useQuery } from "@tanstack/react-query";
import { getLowStockItems } from "@/lib/api/endpoints/inventory";

export function useLowStock() {
  return useQuery({
    queryKey: ["admin", "inventory", "low-stock"],
    queryFn: () => getLowStockItems(),
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}
