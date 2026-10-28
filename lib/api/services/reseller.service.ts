import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  User,
  ResellerStatus,
} from "@/types";

export interface ResellerStatusResponse {
  reseller_status: ResellerStatus;
  reseller_approved_at: string | null;
}

export const resellerService = {
  /** POST /reseller/apply - Ajukan status reseller (status -> PENDING) */
  async applyReseller(): Promise<ApiResponse<ResellerStatusResponse>> {
    return http.post<ApiResponse<ResellerStatusResponse>>("/reseller/apply");
  },

  /** GET /reseller/status - Cek status pengajuan reseller sendiri */
  async getResellerStatus(): Promise<ApiResponse<ResellerStatusResponse>> {
    return http.get<ApiResponse<ResellerStatusResponse>>("/reseller/status");
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** GET /admin/reseller-applications - List user dengan status reseller PENDING */
  async getResellerApplications(
    params?: ListQueryParams
  ): Promise<ApiCollectionResponse<User>> {
    return http.get<ApiCollectionResponse<User>>("/admin/reseller-applications", {
      params,
    });
  },

  /** PATCH /admin/users/{id}/reseller-status - Setujui / tolak pengajuan reseller */
  async updateResellerStatus(
    userId: string,
    reseller_status: ResellerStatus
  ): Promise<ApiResponse<User>> {
    return http.patch<ApiResponse<User>>(`/admin/users/${userId}/reseller-status`, {
      reseller_status,
    });
  },
};
