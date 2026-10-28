import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "@/lib/api/endpoints/categories";
import type { UUID } from "@/types";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      // Invalidate juga query categories yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
