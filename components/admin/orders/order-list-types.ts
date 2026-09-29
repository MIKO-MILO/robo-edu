import type { OrderStatus, PaymentStatus } from "@/types/enums";

/**
 * AdminOrderRow — DTO ringan untuk baris di tabel daftar pesanan admin.
 * Saat backend siap, petakan response GET /admin/orders ke interface ini.
 */
export interface AdminOrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  item_count: number;
  first_item_name: string;
  created_at: string;
  /** Kode voucher yang dipakai (snapshot) — null jika tidak ada */
  voucher_code: string | null;
}

/**
 * Statistik ringkas pesanan untuk KPI cards.
 */
export interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  processing_shipped: number;
  completed: number;
}

/**
 * Snapshot alamat pengiriman per PRD Bab 13.3.
 * Disimpan langsung di tabel `order` — tidak berubah meski customer edit profil.
 */
export interface OrderShippingSnapshot {
  courier: string;
  service: string;
  tracking_number: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_village: string;
  shipping_postal_code: string;
}

/**
 * DTO lengkap untuk halaman Detail Pesanan (/admin/orders/[id]).
 * Semua field berbasis snapshot sesuai PRD Bab 13.3.
 */
export interface AdminOrderDetailData {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  shipping: OrderShippingSnapshot;
  payment: {
    status: PaymentStatus;
    method: string;
    transaction_id: string | null;
  };
  items: OrderLineItem[];
  pricing: OrderPricingSummary;
}

/**
 * Satu baris item pesanan — menggunakan harga snapshot (`price_snapshot`).
 */
export interface OrderLineItem {
  id: string;
  name: string;
  variant: string | null;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Ringkasan harga order.
 */
export interface OrderPricingSummary {
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  /** Kode voucher yang digunakan (snapshot) — null jika tidak ada voucher */
  voucher_code: string | null;
}

/**
 * Tab filter status pesanan untuk toolbar.
 * Mencakup semua status valid dari siklus PRD Bab 13.1.
 */
export const ORDER_STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu Bayar" },
  { key: "PAID", label: "Dibayar" },
  { key: "PROCESSING", label: "Diproses" },
  { key: "SHIPPED", label: "Dikirim" },
  { key: "DELIVERED", label: "Terkirim" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
] as const;

export type OrderStatusTabKey = typeof ORDER_STATUS_TABS[number]["key"];

/**
 * Transisi status valid per status saat ini — sesuai siklus PRD Bab 13.1.
 *   PENDING → PAID (konfirmasi manual), CANCELLED
 *   PAID → PROCESSING, REFUNDED, CANCELLED
 *   PROCESSING → SHIPPED (+ input resi), CANCELLED
 *   SHIPPED → DELIVERED
 *   DELIVERED → COMPLETED
 *   COMPLETED, CANCELLED, REFUNDED → terminal
 */
export const ORDER_STATUS_TRANSITIONS: Partial<
  Record<OrderStatus, { to: OrderStatus; label: string; variant: "primary" | "danger" | "warning" }[]>
> = {
  PENDING: [
    { to: "PAID", label: "Konfirmasi Pembayaran", variant: "primary" },
    { to: "CANCELLED", label: "Batalkan Pesanan", variant: "danger" },
  ],
  PAID: [
    { to: "PROCESSING", label: "Mulai Proses", variant: "primary" },
    { to: "REFUNDED", label: "Refund", variant: "warning" },
    { to: "CANCELLED", label: "Batalkan Pesanan", variant: "danger" },
  ],
  PROCESSING: [
    { to: "SHIPPED", label: "Tandai Sudah Dikirim", variant: "primary" },
    { to: "CANCELLED", label: "Batalkan Pesanan", variant: "danger" },
  ],
  SHIPPED: [
    { to: "DELIVERED", label: "Tandai Sudah Diterima", variant: "primary" },
  ],
  DELIVERED: [
    { to: "COMPLETED", label: "Selesaikan Pesanan", variant: "primary" },
  ],
};

