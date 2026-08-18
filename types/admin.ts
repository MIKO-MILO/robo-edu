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
