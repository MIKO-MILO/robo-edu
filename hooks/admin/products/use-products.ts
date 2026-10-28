import { useQuery } from "@tanstack/react-query";
import { getProducts, type GetProductsParams } from "@/lib/api/endpoints/products";

export function useProducts(filters?: GetProductsParams) {
  return useQuery({
    queryKey: ["admin", "products", filters],
    queryFn: () => getProducts(filters),
  });
}
