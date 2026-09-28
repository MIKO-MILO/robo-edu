import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/lib/api/endpoints/categories";
import type { UUID } from "@/types";

export function useCategory(id: UUID) {
  return useQuery({
    queryKey: ["admin", "categories", id],
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
}
