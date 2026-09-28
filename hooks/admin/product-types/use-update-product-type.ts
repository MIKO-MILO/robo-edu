import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductType } from "@/lib/api/endpoints/product-types";
import type { UpdateProductTypeRequestBody } from "@/lib/api/endpoints/product-types";
import type { UUID } from "@/types";

export interface UpdateProductTypeVariables {
  id: UUID;
  body: UpdateProductTypeRequestBody;
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateProductTypeVariables) =>
      updateProductType(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-types"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "product-types", variables.id],
      });
      // Invalidate juga query product-types yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
    },
  });
}
