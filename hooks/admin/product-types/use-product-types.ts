import { useQuery } from "@tanstack/react-query";
import { getProductTypes } from "@/lib/api/endpoints/product-types";

export function useProductTypes() {
  return useQuery({
    queryKey: ["product-types"],
    queryFn: () => getProductTypes(),
    staleTime: 1000 * 60 * 30, // 30 menit (cache lama untuk data tipe produk)
  });
}
