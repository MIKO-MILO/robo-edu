import type { UUID, ISODateString, Money } from "./common";
import type { EmailLogStatus, EmailType } from "./enums";

/**
 * admin.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `audit_log`, `email_log`, ditambah beberapa DTO
 * untuk dashboard & laporan (api.md §16). `audit_log` sendiri TIDAK
 * ada di ERD PRD Bab 25 — ini diskrepansi #2 dari 3 yang tercatat di
 * memory & api.md §18 (bukan hal buruk, cuma perlu didokumentasikan
 * balik ke PRD kalau memang mau dipertahankan).
 * ------------------------------------------------------------------
 */

/** Catatan: tabel `audit_log` TIDAK punya kolom `updated_at` — log
 * memang tidak pernah diedit setelah dibuat, sengaja begitu. */
export interface AuditLog {
  id: UUID;
  actor_id: UUID;
  action: string; // mis. "APPROVE_RESELLER", "UPDATE_PRODUCT_PRICE"
  target_type: string; // mis. "product", "order", "user"
  target_id: UUID;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: ISODateString;
}

/** Catatan: `email_log` juga TIDAK punya kolom `updated_at`. */
export interface EmailLog {
  id: UUID;
  order_id: UUID | null;
  user_id: UUID | null;
  email: string;
  type: EmailType | (string & {});
  subject: string;
  status: EmailLogStatus;
  sent_at: ISODateString | null;
  created_at: ISODateString;
}

/** Response data — GET /admin/dashboard */
export interface AdminDashboardSummary {
  revenue_this_month: Money;
  total_orders: number;
  pending_orders: number;
  total_customers?: number;
  top_products: Array<{ product_id: UUID; name: string; total_sold: number }>;
  low_stock_products: Array<{ product_id: UUID; variant_id: UUID; name: string; stock: number }>;
}

/** Response item — GET /admin/inventory/low-stock */
export interface LowStockItem {
  product_id: UUID;
  product_name: string;
  variant_id: UUID;
  variant_name: string;
  stock: number;
  threshold: number;
}

/** Response item — GET /admin/reports/sales */
export interface SalesReportPoint {
  period: string; // mis. "2026-08-18" atau "2026-W33" tergantung group_by
  total_orders: number;
  total_revenue: Money;
}

/** Response item — Category Sales Breakdown */
export interface CategorySalesReportItem {
  category_id: UUID | string;
  category_name: string;
  total_sold: number;
  total_revenue: Money;
  percentage: number;
  movement_type?: "FAST_MOVING" | "SLOW_MOVING";
  profit_margin?: number; // e.g. 35 -> 35%
}

/** Response item — Top Product Report */
export interface TopProductReportItem {
  product_id: UUID | string;
  name: string;
  category_name?: string;
  total_sold: number;
  total_revenue: Money;
  average_price: Money;
  stock?: number;
  movement_type?: "FAST_MOVING" | "SLOW_MOVING";
  profit_margin?: number; // e.g. 28 -> 28%
}

/** Response item — Payment Method Distribution */
export interface PaymentMethodBreakdownItem {
  method_key: "QRIS" | "BANK_TRANSFER" | "E_WALLET" | "CREDIT_CARD";
  name: string;
  total_transactions: number;
  total_revenue: Money;
  percentage: number;
  color_class: string;
}

/** Response item — Peak Hours Activity */
export interface PeakHourDataPoint {
  hour_label: string; // e.g. "08:00", "12:00", "14:00"
  order_count: number;
  revenue: Money;
  is_peak?: boolean;
}

/** Response item — Full Order Status Breakdown */
export interface OrderStatusBreakdownItem {
  status_key: "COMPLETED" | "PROCESSING" | "PENDING" | "CANCELLED" | "REFUNDED";
  label: string;
  count: number;
  total_amount: Money;
  percentage: number;
  color: string;
}

/** Response data — Sales Metrics Overview */
export interface SalesMetricsOverview {
  total_revenue: Money;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  cancelled_orders: number;
  refunded_orders?: number;
  average_order_value: Money;
  total_items_sold: number;
  growth_percentage: number;
  repeat_customer_rate: number;
}
