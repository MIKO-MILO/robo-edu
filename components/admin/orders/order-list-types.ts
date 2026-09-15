import type { OrderStatus, PaymentStatus } from "@/types/enums";

/**
 * AdminOrderRow — DTO ringan untuk baris di tabel pesanan admin.
 * Dibuat terpisah dari `OrderListItem` (user-facing) karena admin
 * butuh kolom tambahan (customer_email, payment_method, payment_status).
 * Saat backend siap, ganti mock data di page dengan API call dan
 * petakan response ke interface ini.
 */
export interface AdminOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  item_count: number;
  first_item_name: string;
  created_at: string;
}

/**
 * Statistik ringkas pesanan untuk KPI cards.
 * Dihitung dari list pesanan (bisa juga dari dedicated stats endpoint).
 */
export interface OrderStats {
  total: number;
  pending: number;
  processing_shipped: number;
  completed: number;
}

/** Opsi filter status untuk toolbar. */
export const ORDER_STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu" },
  { key: "PROCESSING", label: "Diproses" },
  { key: "SHIPPED", label: "Dikirim" },
  { key: "DELIVERED", label: "Terkirim" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
] as const;
