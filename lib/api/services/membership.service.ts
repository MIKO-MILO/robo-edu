import { http } from "../base-client";
import type { ApiResponse, MembershipStatusData } from "@/types";

/**
 * membership.service.ts
 * ------------------------------------------------------------------
 * API client untuk endpoint membership customer.
 *
 * GET /membership/me   → getMembershipStatus()
 *
 * PRD Bab 6.8, 6.9 | FR-023 | US-011, US-012
 * ------------------------------------------------------------------
 */

export const membershipService = {
  /**
   * GET /membership/me
   * Ambil status membership + seluruh riwayat pembelian milik user yang login.
   *
   * Backend rules:
   *   - Wajib auth (cookie roboedu_session).
   *   - membership_status dan membership_expires_at diambil dari kolom `user`.
   *   - purchases: semua record `membership_purchase` milik user,
   *     di-JOIN ke `payment` untuk mendapatkan payment_method,
   *     diurutkan terbaru lebih dulu (ORDER BY created_at DESC).
   *   - Array purchases kosong jika user belum pernah membeli.
   */
  async getMembershipStatus(): Promise<ApiResponse<MembershipStatusData>> {
    return http.get<ApiResponse<MembershipStatusData>>("/membership/me");
  },
};
