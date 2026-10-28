import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/api/endpoints/products";
import type { UUID } from "@/types";

export function useProduct(id: UUID) {
  return useQuery({
    queryKey: ["admin", "products", id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  });
}
