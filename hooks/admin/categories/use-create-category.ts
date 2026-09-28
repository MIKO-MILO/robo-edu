import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/api/endpoints/categories";
import type { CreateCategoryRequestBody } from "@/lib/api/endpoints/categories";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryRequestBody) => createCategory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      // Invalidate juga query categories yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
