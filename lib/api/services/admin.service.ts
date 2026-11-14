import { http } from "../base-client";
import type {
  ApiResponse,
  ApiCollectionResponse,
  ListQueryParams,
  AuditLog,
  EmailLog,
  AdminDashboardSummary,
  LowStockItem,
  SalesReportData,
  PaymentMethodReportData,
  OrderStatusReportData,
  CategorySalesReportData,
  EmailLogStatus,
  EmailType,
} from "@/types";

export interface SalesReportQueryParams {
  date_from?: string;
  date_to?: string;
  group_by?: "day" | "week" | "month";
}

/** Date range params for the breakdown endpoints (payment-methods, order-status, category-sales). */
export interface ReportDateRangeParams {
  start_date?: string;
  end_date?: string;
}

/** Params for the sales / top-products endpoints (which use `from` / `to`). */
export interface SalesDateRangeParams {
  from?: string;
  to?: string;
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
  ): Promise<ApiResponse<SalesReportData>> {
    // Map frontend filter names (date_from/date_to) to API params (from/to)
    const queryParams: Record<string, string> = {};
    if (params?.date_from) queryParams.from = params.date_from;
    if (params?.date_to) queryParams.to = params.date_to;
    return http.get<ApiResponse<SalesReportData>>("/admin/reports/sales", {
      params: queryParams,
    });
  },

  /** GET /admin/reports/top-products - Produk/kategori terlaris */
  async getTopProducts(
    params?: ListQueryParams & SalesDateRangeParams
  ): Promise<
    ApiResponse<{
      products: Array<{
        product_id: string;
        product_name: string;
        total_sold: number;
        total_revenue: number;
      }>;
    }>
  > {
    return http.get<
      ApiResponse<{
        products: Array<{
          product_id: string;
          product_name: string;
          total_sold: number;
          total_revenue: number;
        }>;
      }>
    >("/admin/reports/top-products", { params });
  },

  /** GET /admin/reports/payment-methods - Breakdown transaksi per metode pembayaran */
  async getPaymentMethodsReport(
    params?: ReportDateRangeParams
  ): Promise<ApiResponse<PaymentMethodReportData>> {
    return http.get<ApiResponse<PaymentMethodReportData>>(
      "/admin/reports/payment-methods",
      { params }
    );
  },

  /** GET /admin/reports/order-status - Breakdown count & amount per status order */
  async getOrderStatusReport(
    params?: ReportDateRangeParams
  ): Promise<ApiResponse<OrderStatusReportData>> {
    return http.get<ApiResponse<OrderStatusReportData>>(
      "/admin/reports/order-status",
      { params }
    );
  },

  /** GET /admin/reports/category-sales - Breakdown unit terjual & revenue per kategori */
  async getCategorySalesReport(
    params?: ReportDateRangeParams
  ): Promise<ApiResponse<CategorySalesReportData>> {
    return http.get<ApiResponse<CategorySalesReportData>>(
      "/admin/reports/category-sales",
      { params }
    );
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
