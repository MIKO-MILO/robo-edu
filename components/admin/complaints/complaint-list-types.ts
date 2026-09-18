import type { ComplaintStatus } from "@/types/enums";

/**
 * complaint-list-types.ts
 * ------------------------------------------------------------------
 * DTO & tipe lokal untuk halaman Complaints Admin.
 * Sengaja dipisah dari types/complaint.ts (yang merepresentasikan
 * tabel DB) agar presentasi data UI bisa berkembang independen
 * tanpa menyentuh kontrak tipe BE.
 * ------------------------------------------------------------------
 */

/**
 * AdminComplaintRow — baris ringkasan untuk tabel daftar klaim.
 * Sudah di-join dari sisi BE sehingga FE langsung mendapat nama produk,
 * nama customer, dll. tanpa perlu join lagi di client.
 */
export interface AdminComplaintRow {
  id: string;
  subject: string;
  /** Nama lengkap customer yang mengajukan klaim */
  customer_name: string;
  customer_email: string;
  /** Nomor WA customer (untuk tindak lanjut manual) */
  customer_phone: string | null;
  /** Nama produk dari order_item (sudah di-join) */
  product_name: string;
  /** Nomor order dari order_item (sudah di-join) */
  order_number: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
}

/**
 * AdminComplaintDetail — detail lengkap satu klaim.
 * Berisi data gabungan dari tabel complaints + complaint_attachments
 * + order_item (nama produk, nomor order, price_snapshot).
 */
export interface AdminComplaintDetail extends AdminComplaintRow {
  description: string;
  resolution: string | null;
  resolved_at: string | null;
  /** Harga produk saat order dibuat (dari price_snapshot di order_item) */
  price_snapshot: number | null;
  attachments: AdminComplaintAttachment[];
}

/**
 * Lampiran klaim — representasi FE dari tabel complaint_attachments.
 * Tipe file dibagi menjadi PHOTO / VIDEO untuk keperluan galeri viewer.
 */
export interface AdminComplaintAttachment {
  id: string;
  file_url: string;
  file_name: string;
  /** Null jika backend tidak menyertakan MIME type */
  file_type: string | null;
  /** Derived helper: "PHOTO" | "VIDEO" | "OTHER" */
  media_type: "PHOTO" | "VIDEO" | "OTHER";
  created_at: string;
}

/**
 * KPI statistics untuk 4 kartu di atas halaman daftar klaim.
 */
export interface ComplaintStats {
  total: number;
  open: number;
  in_review: number;
  resolved: number;
}

/**
 * Tab filter status untuk toolbar halaman daftar.
 */
export const COMPLAINT_STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "OPEN", label: "Terbuka" },
  { key: "IN_REVIEW", label: "Ditinjau" },
  { key: "RESOLVED", label: "Terselesaikan" },
  { key: "REJECTED", label: "Ditolak" },
] as const;
