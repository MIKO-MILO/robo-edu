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
   */
  async getMembershipStatus(): Promise<ApiResponse<MembershipStatusData>> {
    return http.get<ApiResponse<MembershipStatusData>>("/membership/me");
  },

  /**
   * POST /checkout/membership
   * Buat transaksi pembelian membership Paket Plus.
   * Mengembalikan purchaseId + snapToken + redirectUrl + total.
   */
  async createCheckout(): Promise<
    ApiResponse<{
      purchaseId: string;
      purchaseNumber: string;
      snapToken: string;
      redirectUrl: string;
      total: number;
    }>
  > {
    return http.post("/checkout/membership", { package: "PLUS" });
  },
};
