import { http } from "../base-client";
import type { ApiResponse, MembershipStatusData } from "@/types";

/**
 * membership.service.ts
 * ------------------------------------------------------------------
 * API client untuk endpoint membership customer.
 *
 * Endpoint yang akan tersedia saat backend siap:
 *   GET /membership/me → getMembershipStatus()
 *
 * STATUS SAAT INI: Frontend-only phase.
 * Hook (use-reseller-status.ts) masih fetch ke mock API route.
 *
 * TODO(backend): Ketika endpoint GET /membership/me tersedia:
 *   1. Update hook untuk memanggil `membershipService.getMembershipStatus()`
 *      sebagai pengganti fetch ke "/api/mock-membership-me".
 *   2. Hapus app/api/mock-membership-me/route.ts.
 *   3. Tidak ada perubahan yang diperlukan di komponen atau page.tsx.
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
