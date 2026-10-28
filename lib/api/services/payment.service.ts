import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  Payment,
  PaymentStatus,
} from "@/types";

export interface PaymentListQueryParams extends ListQueryParams {
  status?: PaymentStatus;
}

export const paymentService = {
  /** GET /orders/{id}/payment - Cek status pembayaran order milik user */
  async getOrderPaymentStatus(orderId: string): Promise<ApiResponse<Payment>> {
    return http.get<ApiResponse<Payment>>(`/orders/${orderId}/payment`);
  },

  /* ---------------------- Admin Endpoints ---------------------- */

  /** GET /admin/payments - List semua transaksi pembayaran */
  async getAdminPayments(
    params?: PaymentListQueryParams
  ): Promise<ApiCollectionResponse<Payment>> {
    return http.get<ApiCollectionResponse<Payment>>("/admin/payments", { params });
  },

  /** GET /admin/payments/{id} - Detail transaksi termasuk raw_response Midtrans */
  async getAdminPaymentById(id: string): Promise<ApiResponse<Payment>> {
    return http.get<ApiResponse<Payment>>(`/admin/payments/${id}`);
  },
};
