import type { ResellerStatus, OrderStatus, PaymentStatus, UserRole } from "@/types/enums";
import type { UserAddress } from "@/types/user";

/**
 * AdminCustomerRow — DTO ringan untuk baris di tabel daftar pelanggan admin.
 * Memuat informasi penting pelanggan, tipe/status reseller, total belanja (LTV),
 * dan transaksi terakhir.
 */
export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url?: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  last_order_status?: OrderStatus | null;
  created_at: string;
}

/**
 * Ringkasan statistik pelanggan untuk 4 KPI Cards di atas halaman list.
 */
export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  approved_resellers: number;
  pending_resellers: number;
}

/**
 * Filter tab opsi tipe pelanggan / reseller untuk toolbar.
 */
export const CUSTOMER_RESELLER_TABS = [
  { key: "ALL", label: "Semua Pelanggan" },
  { key: "CUSTOMER", label: "Pelanggan Reguler" },
  { key: "APPROVED", label: "Reseller Aktif" },
  { key: "PENDING", label: "Pengajuan Reseller" },
  { key: "REJECTED", label: "Reseller Ditolak" },
] as const;

/**
 * Baris item riwayat pesanan pelanggan untuk tabel di halaman detail customer.
 */
export interface CustomerOrderHistoryRow {
  id: string;
  order_number: string;
  created_at: string;
  item_count: number;
  first_item_name: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  shipping_courier?: string | null;
  tracking_number?: string | null;
}

/**
 * Ringkasan komplain / klaim garansi pelanggan di halaman detail.
 */
export interface CustomerComplaintRow {
  id: string;
  order_id: string;
  order_number: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  created_at: string;
}

/**
 * Ringkasan ulasan produk yang diberikan pelanggan.
 */
export interface CustomerReviewRow {
  id: string;
  product_name: string;
  rating: number;
  comment: string;
  status: "PUBLISHED" | "HIDDEN";
  created_at: string;
}

/**
 * DTO lengkap untuk halaman Detail Customer (/admin/customers/[id]).
 */
export interface AdminCustomerDetailData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  tax_id?: string | null;
  tax_country?: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  reseller_approved_at: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;

  // Finansial & Metrik
  metrics: {
    total_spent: number; // LTV
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    average_order_value: number; // AOV
    last_order_at: string | null;
  };

  // Alamat pengiriman
  addresses: UserAddress[];

  // Riwayat pesanan
  orders: CustomerOrderHistoryRow[];

  // Riwayat komplain
  complaints: CustomerComplaintRow[];

  // Riwayat ulasan
  reviews: CustomerReviewRow[];
}
