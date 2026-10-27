import type { MembershipStatus, MembershipPurchaseStatus } from "./enums";

/**
 * membership.ts
 * ------------------------------------------------------------------
 * Kontrak TypeScript untuk entitas membership sistem baru
 * (menggantikan sistem reseller lama yang berbasis pengajuan).
 *
 * Referensi PRD:
 *   - Bab 6 (Sistem Membership), terutama 6.8 (purchase history) dan 6.9
 *   - Bab 25.1 (ERD: tabel membership_purchase dan kolom user)
 *   - FR-022, FR-023, FR-025 | US-011, US-012
 *
 * Aturan integrasi backend:
 *   1. Backend WAJIB mengembalikan field dengan nama persis seperti di sini.
 *   2. payment_method di-JOIN dari tabel `payment` ke `membership_purchase`.
 *   3. Jika ada perubahan schema DB, update file ini terlebih dulu.
 * ------------------------------------------------------------------
 */

/**
 * Satu record pembelian membership dari tabel `membership_purchase`.
 * Semua field snapshot (price, plan name, duration) disimpan saat beli
 * sehingga histori tidak berubah meski harga/paket diubah admin.
 *
 * PRD Bab 6.8 — kolom tabel purchase history di /profile/reseller.
 */
export interface MembershipPurchase {
  id: string;

  /** Format: MBR-YYYYMMDD-NNN. Dipakai sebagai referensi ke Midtrans. */
  purchase_number: string;

  /** Snapshot nama paket saat beli (mis. "Plus"). PRD Bab 6.8 kolom Paket. */
  plan_name_snapshot: string;

  /** Snapshot harga dalam Rupiah saat beli. PRD Bab 6.8 kolom Nominal. */
  price_snapshot: number;

  /** Snapshot durasi periode dalam bulan saat beli. */
  duration_months_snapshot: number;

  /** Status pembayaran pembelian ini. PRD Bab 6.8 kolom Status. */
  status: MembershipPurchaseStatus;

  /**
   * Awal masa berlaku membership dari pembelian ini.
   * ISO 8601. null jika pembayaran belum dikonfirmasi (PENDING/FAILED/EXPIRED).
   */
  starts_at: string | null;

  /**
   * Akhir masa berlaku membership dari pembelian ini.
   * ISO 8601. null jika pembayaran belum dikonfirmasi.
   */
  ends_at: string | null;

  /** Waktu pembayaran dikonfirmasi. null jika belum PAID. */
  paid_at: string | null;

  /**
   * Metode pembayaran dari tabel `payment` (JOIN).
   * null jika pembayaran belum selesai / tidak ada record payment.
   * PRD Bab 6.8 kolom Metode Pembayaran.
   */
  payment_method: string | null;

  /** Waktu record ini dibuat. PRD Bab 6.8 kolom Tanggal Pembelian. */
  created_at: string;
}

/**
 * Payload response dari GET /membership/me.
 * Menggabungkan status membership user dengan seluruh riwayat pembelian.
 *
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */
export interface MembershipStatusData {
  /**
   * Status membership saat ini dari kolom `user.membership_status`.
   * Server selalu memvalidasi ini bersama membership_expires_at.
   */
  membership_status: MembershipStatus;

  /**
   * Batas akhir masa berlaku dari kolom `user.membership_expires_at`.
   * ISO 8601. null jika user belum pernah menjadi MEMBER.
   */
  membership_expires_at: string | null;

  /**
   * Seluruh riwayat pembelian membership, diurutkan terbaru lebih dulu.
   * Array kosong untuk NOT_MEMBER yang belum pernah membeli.
   */
  purchases: MembershipPurchase[];
}
