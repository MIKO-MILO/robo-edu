import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createVariant,
  updateVariant,
  deleteVariant,
} from "@/lib/api/endpoints/products";
import type {
  UUID,
  CreateVariantRequestBody,
  UpdateVariantRequestBody,
} from "@/types";

export interface CreateVariantVariables {
  productId: UUID;
  body: CreateVariantRequestBody;
}

export interface UpdateVariantVariables {
  variantId: UUID;
  productId?: UUID;
  body: UpdateVariantRequestBody;
}

export interface DeleteVariantVariables {
  variantId: UUID;
  productId?: UUID;
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, body }: CreateVariantVariables) =>
      createVariant(productId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, body }: UpdateVariantVariables) =>
      updateVariant(variantId, body),
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

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId }: DeleteVariantVariables) =>
      deleteVariant(variantId),
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
