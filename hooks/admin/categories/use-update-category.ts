import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "@/lib/api/endpoints/categories";
import type { UpdateCategoryRequestBody } from "@/lib/api/endpoints/categories";
import type { UUID } from "@/types";

export interface UpdateCategoryVariables {
  id: UUID;
  body: UpdateCategoryRequestBody;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateCategoryVariables) => updateCategory(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories", variables.id] });
      // Invalidate juga query categories yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
