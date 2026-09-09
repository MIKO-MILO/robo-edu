import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Review,
  ReviewWithAuthor,
  CreateReviewRequestBody,
  UpdateReviewRequestBody,
  ReviewStatus,
} from "@/types";

export interface ReviewListQueryParams extends ListQueryParams {
  status?: ReviewStatus;
}

export const reviewService = {
  /** GET /products/{id}/reviews - List review terpublikasi untuk produk */
  async getProductReviews(
    productId: string,
    params?: ListQueryParams
  ): Promise<ApiCollectionResponse<ReviewWithAuthor>> {
    return http.get<ApiCollectionResponse<ReviewWithAuthor>>(
      `/products/${productId}/reviews`,
      { params }
    );
  },

  /** POST /reviews - Buat review baru (Customer) */
  async createReview(
    body: CreateReviewRequestBody
  ): Promise<ApiResponse<Review>> {
    return http.post<ApiResponse<Review>>("/reviews", body);
  },

  /** PATCH /reviews/{id} - Edit rating / komentar milik sendiri (Customer) */
  async updateReview(
    id: string,
    body: UpdateReviewRequestBody
  ): Promise<ApiResponse<Review>> {
    return http.patch<ApiResponse<Review>>(`/reviews/${id}`, body);
  },

  /** DELETE /reviews/{id} - Hapus review sendiri (Customer) */
  async deleteReview(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`);
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** GET /admin/reviews - List semua review (Admin) */
  async getAdminReviews(
    params?: ReviewListQueryParams
  ): Promise<ApiCollectionResponse<ReviewWithAuthor>> {
    return http.get<ApiCollectionResponse<ReviewWithAuthor>>("/admin/reviews", {
      params,
    });
  },

  /** PATCH /admin/reviews/{id}/status - Moderasi status review (Admin: PUBLISHED/HIDDEN) */
  async moderateReview(
    id: string,
    status: ReviewStatus
  ): Promise<ApiResponse<Review>> {
    return http.patch<ApiResponse<Review>>(`/admin/reviews/${id}/status`, {
      status,
    });
  },
};
