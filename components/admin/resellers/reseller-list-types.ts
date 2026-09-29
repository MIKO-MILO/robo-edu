import type { ResellerStatus, OrderStatus } from "@/types/enums";
import type { UserRole } from "@/types/enums";

/**
 * reseller-list-types.ts
 * ------------------------------------------------------------------
 * DTO & konstanta untuk modul Admin Resellers.
 *
 * Konteks domain (PRD Bab 6):
 *   - Reseller BUKAN role terpisah — tetap `customer` role, dibedakan
 *     via `reseller_status` (NOT_RESELLER / PENDING / APPROVED / REJECTED).
 *   - Halaman ini fokus pada pengajuan (PENDING) dan manajemen reseller.
 * ------------------------------------------------------------------
 */

/**
 * AdminResellerRow — DTO ringan untuk baris di tabel daftar pengajuan reseller.
 * Halaman /admin/resellers menampilkan customer yang berstatus PENDING, APPROVED, atau REJECTED.
 */
export interface AdminResellerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  reseller_applied_at: string | null; // waktu pengajuan (proxy dari updated_at saat PENDING)
  reseller_approved_at: string | null;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  last_order_status?: OrderStatus | null;
  created_at: string;
  /** Catatan penolakan admin (optional, hanya ada jika REJECTED) */
  rejection_reason?: string | null;
}

/**
 * Ringkasan statistik pengajuan reseller untuk 4 KPI Cards di atas halaman list.
 */
export interface ResellerStats {
  total_resellers: number;    // APPROVED
  pending_requests: number;   // PENDING
  rejected_requests: number;  // REJECTED
  total_applicants: number;   // PENDING + APPROVED + REJECTED
}

/**
 * DTO lengkap untuk halaman Detail Reseller (/admin/resellers/[id]).
 * Extends data row dengan informasi tambahan untuk konteks review.
 */
export interface AdminResellerDetailData extends AdminResellerRow {
  /** Riwayat pesanan singkat untuk referensi admin saat review */
  recent_orders: ResellerOrderSummary[];
  /** Catatan admin (untuk keperluan internal) */
  admin_note?: string | null;
}

/**
 * Ringkasan pesanan reseller untuk ditampilkan di halaman detail.
 */
export interface ResellerOrderSummary {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: OrderStatus;
  item_count: number;
  first_item_name: string;
}

/**
 * Tab filter status reseller untuk toolbar.
 */
export const RESELLER_STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu Review" },
  { key: "APPROVED", label: "Disetujui" },
  { key: "REJECTED", label: "Ditolak" },
] as const;

export type ResellerStatusTabKey = typeof RESELLER_STATUS_TABS[number]["key"];
