import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReviewStatus } from "@/types/enums";

export interface GetAdminReviewsParams {
  search?: string;
  status?: ReviewStatus | "ALL";
  rating?: number | "ALL";
  sortBy?: "created_at" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function useAdminReviews(params?: GetAdminReviewsParams) {
  return useQuery({
    queryKey: ["admin", "reviews", params],
    queryFn: async () => {
      // Placeholder React Query fn yang siap dikoneksikan ke endpoint Backend API
      return [];
    },
    enabled: false, // Disabled sementara sampai API Backend siap
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: ReviewStatus }) => {
      // Placeholder mutation fn PATCH /admin/reviews/{id}/status
      return { reviewId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      // Placeholder mutation fn DELETE /admin/reviews/{id}
      return { reviewId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
}
