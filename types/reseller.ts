import type { UUID, ISODateString, ListQueryParams } from "./common";
import type { ResellerStatus } from "./enums";

/**
 * reseller.ts
 * ------------------------------------------------------------------
 * Kontrak TypeScript untuk entitas `reseller_application` dan semua
 * DTO terkait alur pengajuan reseller (PRD-FINAL Bab 6 & 25.1).
 *
 * FILE INI ADALAH KONTRAK ANTARA FRONTEND DAN BACKEND.
 * Setiap field, tipe, dan enum di sini mencerminkan secara langsung:
 *   - Kolom tabel `reseller_application` (PRD Bab 25.1)
 *   - Field form pengajuan (PRD Bab 6.5)
 *   - Endpoint API (PRD Bab 6.4, reseller_todo.md §1.2–1.3)
 *
 * Aturan saat backend mulai diimplementasikan:
 *   1. Backend WAJIB mengembalikan field dengan nama persis seperti di sini.
 *   2. Jika ada perubahan field di schema DB, update file ini terlebih dulu,
 *      lalu sesuaikan frontend & backend secara bersamaan.
 *   3. `agree_to_terms` TIDAK dikirim ke server — hanya validasi client-side.
 *   4. Upload file dokumen dikirim via FormData terpisah (lihat reseller.service.ts).
 * ------------------------------------------------------------------
 */

/* ================================================================
 * ENUM / UNION TYPES
 * Nilai ini harus konsisten antara frontend, backend, dan DB schema.
 * ================================================================ */

/**
 * Tipe pemohon reseller.
 * Kolom `applicant_type` di tabel `reseller_application` (ENUM di DB).
 * PRD Bab 6.5: "Radio: Individu / Usaha / Institusi (sekolah, komunitas)"
 */
export type ApplicantType = "INDIVIDUAL" | "BUSINESS" | "INSTITUTION";

/**
 * Kanal penjualan yang dipilih pemohon (multi-select).
 * Kolom `sales_channels` di tabel `reseller_application` (JSON array di DB).
 * PRD Bab 6.5: "Multi-select: Toko offline / Marketplace / Media sosial /
 *               Sekolah-lembaga / Lainnya"
 */
export type SalesChannel =
  | "OFFLINE_STORE"       // Toko offline
  | "MARKETPLACE"         // Marketplace (Tokopedia, Shopee, dll.)
  | "SOCIAL_MEDIA"        // Media sosial (Instagram, TikTok, dll.)
  | "SCHOOL_INSTITUTION"  // Sekolah / lembaga pendidikan
  | "OTHER";              // Lainnya

/**
 * Perkiraan volume pembelian per bulan (dalam unit produk).
 * Kolom `estimated_monthly_volume` di tabel `reseller_application` (VARCHAR di DB).
 * PRD Bab 6.5: "Select rentang: kurang dari 10, 10–50, 50–100, lebih dari 100 unit"
 *
 * Catatan backend: Disimpan sebagai varchar, bukan integer — ini rentang
 * pilihan, bukan angka eksak.
 */
export type EstimatedMonthlyVolume =
  | "LESS_THAN_10"   // Kurang dari 10 unit
  | "10_TO_50"       // 10–50 unit
  | "50_TO_100"      // 50–100 unit
  | "MORE_THAN_100"; // Lebih dari 100 unit

/**
 * Status internal record di tabel `reseller_application`.
 *
 * PENTING — BERBEDA dengan `user.reseller_status` (ResellerStatus dari enums.ts):
 *   - `reseller_application.status`  → 3 nilai (status record pengajuan itu sendiri)
 *   - `user.reseller_status`         → 4 nilai (termasuk NOT_RESELLER)
 *
 * Sumber kebenaran untuk logika harga reseller adalah `user.reseller_status`,
 * bukan field ini. Backend memperbarui `user.reseller_status` saat admin approve/reject.
 */
export type ResellerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

/* ================================================================
 * LABEL MAPS — hanya untuk rendering UI, tidak dikirim ke backend
 * ================================================================ */

/** Label tampilan untuk ApplicantType (form radio & admin detail) */
export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  INDIVIDUAL: "Individu / Penjual Perorangan",
  BUSINESS: "Usaha / Bisnis",
  INSTITUTION: "Institusi / Sekolah / Komunitas",
};

/** Label tampilan untuk SalesChannel (form multi-select) */
export const SALES_CHANNEL_LABELS: Record<SalesChannel, string> = {
  OFFLINE_STORE: "Toko Offline",
  MARKETPLACE: "Marketplace (Tokopedia, Shopee, dll.)",
  SOCIAL_MEDIA: "Media Sosial (Instagram, TikTok, dll.)",
  SCHOOL_INSTITUTION: "Sekolah / Lembaga Pendidikan",
  OTHER: "Lainnya",
};

/** Label tampilan untuk EstimatedMonthlyVolume (form select) */
export const ESTIMATED_VOLUME_LABELS: Record<EstimatedMonthlyVolume, string> = {
  LESS_THAN_10: "Kurang dari 10 unit/bulan",
  "10_TO_50": "10–50 unit/bulan",
  "50_TO_100": "50–100 unit/bulan",
  MORE_THAN_100: "Lebih dari 100 unit/bulan",
};

/* ================================================================
 * ENTITAS DATABASE
 * Mencerminkan secara 1:1 kolom tabel `reseller_application` (PRD 25.1).
 * ================================================================ */

/**
 * Entitas utama pengajuan reseller.
 * Mencerminkan tabel `reseller_application` (PRD-FINAL Bab 25.1).
 *
 * Penting: `user.reseller_status` adalah sumber kebenaran untuk
 * logika harga — bukan `reseller_application.status`. Tabel ini
 * menyimpan data formulir & riwayat pengajuan.
 */
export interface ResellerApplication {
  id: UUID;
  user_id: UUID;
  applicant_type: ApplicantType;
  /** Nama usaha/institusi. Untuk INDIVIDUAL, boleh diisi nama diri/toko. */
  business_name: string;
  whatsapp_number: string;
  business_address: string;
  province: string;
  city: string;
  district: string;
  /** Array kanal penjualan. Disimpan sebagai JSON di DB. */
  sales_channels: SalesChannel[];
  /** URL toko/medsos. Nullable — field opsional di form. */
  store_url: string | null;
  estimated_monthly_volume: EstimatedMonthlyVolume;
  /** Alasan/rencana penjualan. 20–1000 karakter. */
  reason: string;
  /**
   * URL file dokumen (NPWP/legalitas) yang disimpan di MinIO.
   * Nullable — upload dokumen opsional.
   * KEAMANAN: URL ini HANYA boleh diakses admin via MinIO policy.
   * Backend DILARANG mengembalikan URL ini ke endpoint customer.
   */
  document_url: string | null;
  status: ResellerApplicationStatus;
  /** Wajib diisi admin jika status = REJECTED (PRD Bab 6.7). */
  rejection_reason: string | null;
  /** ID admin yang mereview. Null = belum direview. */
  reviewed_by: UUID | null;
  reviewed_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/**
 * ResellerApplication + data pemohon (untuk halaman admin detail).
 * Response dari GET /admin/reseller-applications/[id].
 *
 * Backend: JOIN ke tabel `user`, hanya field yang aman diekspos
 * (tanpa password_hash, tanpa token apapun).
 */
export interface ResellerApplicationDetail extends ResellerApplication {
  applicant: {
    id: UUID;
    name: string;
    email: string;
    phone: string | null;
    /** Tanggal akun dibuat — konteks durasi akun. */
    created_at: ISODateString;
  };
}

/* ================================================================
 * RESPONSE TYPES
 * ================================================================ */

/**
 * Response dari GET /reseller/status.
 * Endpoint ringan — hanya status & tanggal approved.
 * Data form lengkap diambil via GET /reseller/application.
 */
export interface ResellerStatusResponse {
  /** Dari kolom `user.reseller_status` */
  reseller_status: ResellerStatus;
  /** Dari kolom `user.reseller_approved_at` */
  reseller_approved_at: ISODateString | null;
}

/* ================================================================
 * REQUEST BODY / DTO
 * ================================================================ */

/**
 * Body untuk POST /reseller/apply.
 *
 * Catatan implementasi penting:
 *   - `agree_to_terms` TIDAK ada di sini — hanya validasi client-side.
 *   - File dokumen (NPWP) dikirim via FormData dengan field name "document".
 *     Backend menerima multipart/form-data. Jika tidak ada file, kirim JSON biasa.
 *   - Header `Idempotency-Key` WAJIB — di-handle oleh resellerService, bukan komponen.
 *   - 1 user hanya boleh punya 1 pengajuan PENDING — backend return 409 jika duplikasi.
 *   - User dengan `is_active = false` → backend return 403 FORBIDDEN.
 */
export interface ApplyResellerRequestBody {
  applicant_type: ApplicantType;
  business_name: string;           // maks. 255 karakter
  whatsapp_number: string;         // format nomor Indonesia
  business_address: string;        // alamat lengkap (textarea)
  province: string;
  city: string;
  district: string;
  sales_channels: SalesChannel[];  // min. 1 pilihan
  store_url?: string | null;       // opsional, harus valid URL jika diisi
  estimated_monthly_volume: EstimatedMonthlyVolume;
  reason: string;                  // 20–1000 karakter
  // File "document" dikirim terpisah via FormData (opsional)
}

/**
 * Body untuk PATCH /admin/reseller-applications/[id]/reject.
 * `rejection_reason` wajib diisi (PRD Bab 6.7).
 * Backend WAJIB validasi bahwa field ini tidak kosong/whitespace.
 */
export interface RejectResellerRequestBody {
  rejection_reason: string;
}

/* ================================================================
 * QUERY PARAMETER TYPES
 * ================================================================ */

/**
 * Query params untuk GET /admin/reseller-applications.
 * Extends ListQueryParams standar (page, limit, sort, search).
 */
export interface ResellerApplicationListQuery extends ListQueryParams {
  /**
   * Filter berdasarkan status pengajuan.
   * Default backend: PENDING (PRD Bab 6.7: "filter status, default PENDING").
   */
  status?: ResellerApplicationStatus;
}
