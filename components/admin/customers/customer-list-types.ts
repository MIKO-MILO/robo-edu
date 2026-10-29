import type {
  MembershipStatus,
  OrderStatus,
  PaymentStatus,
  UserRole,
} from "@/types/enums";
import type { User, UserAddress, OrderListItem } from "@/types";
import type { Complaint, Review } from "@/types";

/**
 * AdminCustomerRow — DTO ringan untuk baris di tabel daftar pelanggan admin.
 * Memuat informasi penting pelanggan, status membership, total belanja (LTV),
 * dan transaksi terakhir.
 */
export interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url?: string | null;
  role: UserRole;
  membership_status: MembershipStatus;
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
 * Filter tab opsi tipe pelanggan untuk toolbar.
 */
export const CUSTOMER_RESELLER_TABS = [
  { key: "ALL", label: "Semua Pelanggan" },
  { key: "MEMBER", label: "Member Plus" },
  { key: "NOT_MEMBER", label: "Pelanggan Standar" },
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
  membership_status: MembershipStatus;
  membership_expires_at: string | null;
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

export function normalizeResellerStatus(
  value: string | null | undefined,
): MembershipStatus {
  if (!value) return "NOT_MEMBER";
  const v = value.toUpperCase();
  if (v === "MEMBER" || v === "APPROVED") return "MEMBER";
  return "NOT_MEMBER";
}

export interface UserOrderSummary {
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  last_order_status?: OrderStatus | null;
}

export function mapUserToCustomerRow(
  user: User,
  summary?: UserOrderSummary,
): AdminCustomerRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatar_url ?? null,
    role: user.role,
    membership_status: normalizeResellerStatus(user.membership_status),
    is_active: user.is_active,
    total_orders: summary?.total_orders ?? 0,
    total_spent: summary?.total_spent ?? 0,
    last_order_at: summary?.last_order_at ?? null,
    last_order_status: summary?.last_order_status ?? null,
    created_at: user.created_at,
  };
}

function mapOrderToHistoryRow(order: OrderListItem): CustomerOrderHistoryRow {
  return {
    id: order.id,
    order_number: order.order_number,
    created_at: order.created_at,
    item_count: order.item_count,
    first_item_name: order.first_item?.product_name_snapshot ?? "-",
    total: order.total,
    subtotal: (order as unknown as { subtotal?: number }).subtotal ?? order.total,
    shipping_cost: (order as unknown as { shipping_cost?: number }).shipping_cost ?? 0,
    discount_amount: (order as unknown as { discount_amount?: number }).discount_amount ?? 0,
    status: order.status,
    payment_status: ((order as unknown as { payment_status?: string }).payment_status ?? "PENDING") as PaymentStatus,
    payment_method: (order as unknown as { payment_method?: string }).payment_method ?? "-",
    shipping_courier: null,
    tracking_number: null,
  };
}

function mapComplaintToRow(c: Complaint): CustomerComplaintRow {
  return {
    id: c.id,
    order_id: c.order_item_id,
    order_number: c.order_item_id,
    title: c.subject,
    description: c.description,
    status: c.status,
    created_at: c.created_at,
  };
}

function mapReviewToRow(
  r: Review & { product_name?: string },
): CustomerReviewRow {
  return {
    id: r.id,
    product_name: r.product_name ?? "-",
    rating: r.rating,
    comment: r.comment ?? "",
    status: r.status === "PUBLISHED" ? "PUBLISHED" : "HIDDEN",
    created_at: r.created_at,
  };
}

export function mapUserAndRelationsToCustomerDetail(
  user: User,
  addresses: UserAddress[],
  orders: OrderListItem[],
  complaints: Array<Complaint & { order_id?: string; order_number?: string }>,
  reviews: Array<Review & { product_name?: string }>,
): AdminCustomerDetailData {
  const total_spent = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const total_orders = orders.length;
  const completed_orders = orders.filter((o) =>
    ["COMPLETED", "DELIVERED"].includes(o.status),
  ).length;
  const cancelled_orders = orders.filter((o) =>
    ["CANCELLED", "REFUNDED"].includes(o.status),
  ).length;
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const last_order_at = sortedOrders[0]?.created_at ?? null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatar_url ?? null,
    gender: user.gender ?? null,
    tax_id: user.tax_id ?? null,
    tax_country: user.tax_country ?? null,
    role: user.role,
    membership_status: normalizeResellerStatus(user.membership_status),
    membership_expires_at: user.membership_expires_at,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    metrics: {
      total_spent,
      total_orders,
      completed_orders,
      cancelled_orders,
      average_order_value:
        total_orders > 0 ? Math.round(total_spent / total_orders) : 0,
      last_order_at,
    },
    addresses: addresses ?? [],
    orders: orders.map(mapOrderToHistoryRow),
    complaints: complaints.map((c) => ({
      ...mapComplaintToRow(c),
      order_id: c.order_id ?? c.order_item_id,
      order_number: c.order_number ?? c.order_item_id,
    })),
    reviews: reviews.map(mapReviewToRow),
  };
}
