import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/endpoints/categories";
import type { GetCategoriesParams } from "@/lib/api/endpoints/categories";

export function useCategories(params?: GetCategoriesParams) {
  return useQuery({
    queryKey: ["admin", "categories", params],
    queryFn: () => getCategories(params),
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}
