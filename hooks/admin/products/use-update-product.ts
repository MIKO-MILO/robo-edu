import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "@/lib/api/endpoints/products";
import type { UUID, UpdateProductRequestBody } from "@/types";

export interface UpdateProductVariables {
  id: UUID;
  body: UpdateProductRequestBody;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateProductVariables) => updateProduct(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.id] });
    },
  });
}
