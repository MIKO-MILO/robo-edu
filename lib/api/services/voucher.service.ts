import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Voucher,
  VoucherUsage,
  ValidateVoucherResponseData,
  CreateVoucherRequestBody,
  UpdateVoucherRequestBody,
} from "@/types";

export const voucherService = {
  /** POST /vouchers/validate - Validasi kode voucher */
  async validateVoucher(
    code: string
  ): Promise<ApiResponse<ValidateVoucherResponseData>> {
    return http.post<ApiResponse<ValidateVoucherResponseData>>(
      "/vouchers/validate",
      { code }
    );
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** GET /admin/vouchers - List voucher */
  async getAdminVouchers(
    params?: ListQueryParams
  ): Promise<ApiCollectionResponse<Voucher>> {
    return http.get<ApiCollectionResponse<Voucher>>("/admin/vouchers", { params });
  },

  /** GET /admin/vouchers/{id} - Detail voucher */
  async getAdminVoucherById(id: string): Promise<ApiResponse<Voucher>> {
    return http.get<ApiResponse<Voucher>>(`/admin/vouchers/${id}`);
  },

  /** POST /admin/vouchers - Buat voucher baru */
  async createVoucher(
    body: CreateVoucherRequestBody
  ): Promise<ApiResponse<Voucher>> {
    return http.post<ApiResponse<Voucher>>("/admin/vouchers", body);
  },

  /** PATCH /admin/vouchers/{id} - Update voucher */
  async updateVoucher(
    id: string,
    body: UpdateVoucherRequestBody
  ): Promise<ApiResponse<Voucher>> {
    return http.patch<ApiResponse<Voucher>>(`/admin/vouchers/${id}`, body);
  },

  /** DELETE /admin/vouchers/{id} - Nonaktifkan / Hapus voucher */
  async deleteVoucher(id: string): Promise<ApiResponse<{ message: string }>> {
    return http.delete<ApiResponse<{ message: string }>>(`/admin/vouchers/${id}`);
  },

  /** PATCH /admin/vouchers/{id}/status - Toggle status aktif voucher */
  async toggleVoucherActive(
    id: string,
    is_active: boolean
  ): Promise<ApiResponse<Voucher>> {
    return http.patch<ApiResponse<Voucher>>(`/admin/vouchers/${id}`, {
      is_active,
    });
  },

  /** GET /admin/vouchers/{id}/usages - Histori pemakaian voucher */
  async getVoucherUsages(
    id: string,
    params?: ListQueryParams
  ): Promise<ApiCollectionResponse<VoucherUsage>> {
    return http.get<ApiCollectionResponse<VoucherUsage>>(
      `/admin/vouchers/${id}/usages`,
      { params }
    );
  },
};
