import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductType } from "@/lib/api/endpoints/product-types";
import type { CreateProductTypeRequestBody } from "@/lib/api/endpoints/product-types";

export function useCreateProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductTypeRequestBody) => createProductType(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-types"] });
      // Invalidate juga query product-types yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
    },
  });
}
