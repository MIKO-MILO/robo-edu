import { useQuery } from "@tanstack/react-query";
import { getProductTypeById } from "@/lib/api/endpoints/product-types";
import type { UUID } from "@/types";

export function useProductType(id: UUID) {
  return useQuery({
    queryKey: ["admin", "product-types", id],
    queryFn: () => getProductTypeById(id),
    enabled: Boolean(id),
  });
}
