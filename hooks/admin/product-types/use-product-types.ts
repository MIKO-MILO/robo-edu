import { useQuery } from "@tanstack/react-query";
import { getProductTypes } from "@/lib/api/endpoints/product-types";
import type { GetProductTypesParams } from "@/lib/api/endpoints/product-types";

export function useProductTypes(params?: GetProductTypesParams) {
  return useQuery({
    queryKey: ["admin", "product-types", params],
    queryFn: () => getProductTypes(params),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}
