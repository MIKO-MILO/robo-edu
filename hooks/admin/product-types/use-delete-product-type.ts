import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductType } from "@/lib/api/endpoints/product-types";
import type { UUID } from "@/types";

export function useDeleteProductType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => deleteProductType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-types"] });
      // Invalidate juga query product-types yang dipakai di form produk
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
    },
  });
}
