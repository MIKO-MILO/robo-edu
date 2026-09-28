import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVariant } from "@/lib/api/endpoints/products";
import type { UUID } from "@/types";

export interface AdjustStockVariables {
  variantId: UUID;
  /** ID produk induk — dipakai untuk invalidate cache detail produk. */
  productId?: UUID;
  /** Nilai stok baru (sudah dihitung di layer UI, bukan delta). */
  newStock: number;
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, newStock }: AdjustStockVariables) =>
      updateVariant(variantId, { stock: newStock }),
    onSuccess: (_, variables) => {
      // Invalidate halaman inventory
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      // Invalidate list & detail produk (stok juga tampil di sana)
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "products", variables.productId],
        });
      }
    },
  });
}
