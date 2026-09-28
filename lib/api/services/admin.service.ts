import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  AuditLog,
  EmailLog,
  AdminDashboardSummary,
  LowStockItem,
  SalesReportPoint,
  EmailLogStatus,
  EmailType,
} from "@/types";

export interface SalesReportQueryParams {
  date_from?: string;
  date_to?: string;
  group_by?: "day" | "week" | "month";
}

export interface AuditLogQueryParams extends ListQueryParams {
  actor_id?: string;
  target_type?: string;
}

export interface EmailLogQueryParams extends ListQueryParams {
  status?: EmailLogStatus;
  type?: EmailType;
}

export const adminService = {
  /** GET /admin/dashboard - Ringkasan revenue, order pending, produk terlaris, stok menipis */
  async getDashboardSummary(): Promise<ApiResponse<AdminDashboardSummary>> {
    return http.get<ApiResponse<AdminDashboardSummary>>("/admin/dashboard");
  },

  /** GET /admin/reports/sales - Laporan penjualan (filter rentang tanggal, group_by) */
  async getSalesReport(
    params?: SalesReportQueryParams
  ): Promise<ApiCollectionResponse<SalesReportPoint>> {
    return http.get<ApiCollectionResponse<SalesReportPoint>>("/admin/reports/sales", {
      params,
    });
  },

  /** GET /admin/reports/top-products - Produk/kategori terlaris */
  async getTopProducts(
    params?: ListQueryParams
  ): Promise<
    ApiCollectionResponse<{
      product_id: string;
      name: string;
      total_sold: number;
    }>
  > {
    return http.get<
      ApiCollectionResponse<{
        product_id: string;
        name: string;
        total_sold: number;
      }>
    >("/admin/reports/top-products", { params });
  },

  /** GET /admin/inventory/low-stock - Produk/variant dengan stok di bawah ambang batas */
  async getLowStockInventory(
    params?: ListQueryParams
  ): Promise<ApiCollectionResponse<LowStockItem>> {
    return http.get<ApiCollectionResponse<LowStockItem>>(
      "/admin/inventory/low-stock",
      { params }
    );
  },

  /** GET /admin/audit-log - Log aktivitas admin */
  async getAuditLogs(
    params?: AuditLogQueryParams
  ): Promise<ApiCollectionResponse<AuditLog>> {
    return http.get<ApiCollectionResponse<AuditLog>>("/admin/audit-log", { params });
  },

  /** GET /admin/email-log - Status pengiriman email */
  async getEmailLogs(
    params?: EmailLogQueryParams
  ): Promise<ApiCollectionResponse<EmailLog>> {
    return http.get<ApiCollectionResponse<EmailLog>>("/admin/email-log", { params });
  },

  /** GET /admin/settings - Pengaturan toko/payment/shipping */
  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return http.get<ApiResponse<Record<string, any>>>("/admin/settings");
  },

  /** PATCH /admin/settings - Update pengaturan toko */
  async updateSettings(
    body: Record<string, any>
  ): Promise<ApiResponse<Record<string, any>>> {
    return http.patch<ApiResponse<Record<string, any>>>("/admin/settings", body);
  },
};
