import type { UUID, ISODateString } from "./common";
import type { ReviewStatus } from "./enums";

/**
 * review.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `review`. `order_item_id` bersifat UNIQUE di DB
 * — artinya satu order_item hanya boleh direview sekali (lihat error
 * CONFLICT di api.md §13).
 * ------------------------------------------------------------------
 */

export interface Review {
  id: UUID;
  order_item_id: UUID;
  user_id: UUID;
  product_id: UUID;
  rating: number; // idealnya divalidasi 1-5 di layer aplikasi, DB tidak membatasi
  comment: string | null;
  status: ReviewStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Response data — GET /products/{id}/reviews (diperkaya nama user singkat) */
export interface ReviewWithAuthor extends Review {
  author_name: string;
}

/** Body — POST /reviews (api.md §13) */
export interface CreateReviewRequestBody {
  order_item_id: UUID;
  rating: number;
  comment?: string;
}

/** Body — PATCH /reviews/{id} */
export type UpdateReviewRequestBody = Partial<Pick<CreateReviewRequestBody, "rating" | "comment">>;

/** Body — PATCH /admin/reviews/{id}/status */
export interface UpdateReviewStatusRequestBody {
  status: ReviewStatus;
}
