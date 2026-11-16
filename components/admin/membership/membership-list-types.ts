import type { ResellerStatus, OrderStatus } from "@/types/enums";
import type { UserRole } from "@/types/enums";

/**
 * membership-list-types.ts
 * ------------------------------------------------------------------
 * DTO & konstanta untuk modul Admin Membership (halaman /admin/membership).
 *
 * Konteks domain (PRD Bab 6):
 *   - Member BUKAN role terpisah — tetap `customer` role, dibedakan
 *     via `membership_status` (NOT_MEMBER / MEMBER).
 *   - Halaman ini menampilkan daftar user dengan status MEMBER.
 * ------------------------------------------------------------------
 */

/**
 * AdminMemberRow — DTO untuk baris di tabel daftar member (dari API nyata).
 * Ini adalah shape yang dikembalikan oleh GET /api/admin/resellers.
 */
export interface AdminMemberRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  membership_status: string;
  membership_expires_at: string | null;
  is_active: boolean;
  purchase_count: number;
  created_at: string;
}

/**
 * AdminMemberStats — KPI ringkasan untuk 4 KPI Cards di atas halaman list.
 * Dihitung dari meta + filter API, bukan array lokal.
 */
export interface AdminMemberStats {
  total_members: number;      // total_count dari meta API
  active_members: number;     // is_active = true (dari data yang diload)
  expiring_soon: number;      // expires dalam 30 hari ke depan
  expired_members: number;    // membership_expires_at sudah lewat
}

/**
 * @deprecated Gunakan AdminMemberRow untuk fitur baru.
 * Dipertahankan karena masih dipakai oleh komponen lama (mock-data, tabel lama).
 */
export interface AdminResellerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  reseller_status: ResellerStatus;
  reseller_applied_at: string | null;
  reseller_approved_at: string | null;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  last_order_status?: OrderStatus | null;
  created_at: string;
  rejection_reason?: string | null;
}

/**
 * Ringkasan statistik pengajuan reseller untuk 4 KPI Cards di atas halaman list.
 * @deprecated Gunakan AdminMemberStats untuk fitur baru.
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
 *
 * Field legalitas (affiliation_name, ktp_nik, npwp_number, primary_address)
 * akan diisi dari API backend Phase 2. Saat ini disimulasikan via mock.
 */
export interface AdminResellerDetailData extends AdminResellerRow {
  /** Riwayat pesanan singkat untuk referensi admin saat review */
  recent_orders: ResellerOrderSummary[];
  /** Catatan admin (untuk keperluan internal) */
  admin_note?: string | null;
  /** Nama instansi/komunitas afiliasi pemohon (dari formulir pengajuan) */
  affiliation_name?: string | null;
  /** NIK KTP pemohon — disensor sebagian untuk tampilan (mis. 3174**********01) */
  ktp_nik?: string | null;
  /** Nomor NPWP pemohon — disensor sebagian */
  npwp_number?: string | null;
  /** Alamat pengiriman utama pemohon (dari user_address WHERE is_primary = true) */
  primary_address?: string | null;
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
