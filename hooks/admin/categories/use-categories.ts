import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/endpoints/categories";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 30, // 30 menit (cache lama untuk data kategorial yang jarang berubah)
  });
}
