import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadProductImage,
  deleteProductImage,
  reorderProductImage,
} from "@/lib/api/endpoints/products";
import type { UUID } from "@/types";

export interface UploadProductImageVariables {
  productId: UUID;
  file: File;
}

export interface DeleteProductImageVariables {
  imageId: UUID;
  productId?: UUID;
}

export interface ReorderProductImageVariables {
  imageId: UUID;
  productId?: UUID;
  body: {
    sort_order?: number;
    is_primary?: boolean;
  };
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: UploadProductImageVariables) =>
      uploadProductImage(productId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId }: DeleteProductImageVariables) =>
      deleteProductImage(imageId),
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "products", variables.productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useReorderProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageId, body }: ReorderProductImageVariables) =>
      reorderProductImage(imageId, body),
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({
          queryKey: ["admin", "products", variables.productId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
