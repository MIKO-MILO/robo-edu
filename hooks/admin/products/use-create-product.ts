import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/api/endpoints/products";
import type { CreateProductRequestBody } from "@/types";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductRequestBody) => createProduct(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
