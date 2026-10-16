import { z } from "zod";

/**
 * reseller.ts (validations)
 * ------------------------------------------------------------------
 * Zod schema untuk validasi form pengajuan reseller (PRD-FINAL Bab 6.5).
 *
 * Menggunakan sintaks Zod v4 (sesuai package.json: "zod": "^4.x").
 * Pola konsisten dengan lib/validations/product.ts.
 *
 * Dipakai oleh:
 *   - Halaman /reseller/apply (react-hook-form + zodResolver)
 *   - Komponen field individual untuk error message
 *
 * Catatan:
 *   - `agree_to_terms` ada di sini (client-only) tapi TIDAK ada di
 *     ApplyResellerRequestBody yang dikirim ke server.
 *   - Validasi server adalah sumber kebenaran; schema ini hanya untuk UX.
 * ------------------------------------------------------------------
 */

/* ================================================================
 * KONSTANTA PILIHAN FORM
 * Single source of truth untuk enum values yang dipakai di z.enum()
 * sekaligus untuk merender <option>/<checkbox> di komponen UI.
 * ================================================================ */

export const APPLICANT_TYPE_VALUES = [
  "INDIVIDUAL",
  "BUSINESS",
  "INSTITUTION",
] as const;

export const SALES_CHANNEL_VALUES = [
  "OFFLINE_STORE",
  "MARKETPLACE",
  "SOCIAL_MEDIA",
  "SCHOOL_INSTITUTION",
  "OTHER",
] as const;

export const ESTIMATED_VOLUME_VALUES = [
  "LESS_THAN_10",
  "10_TO_50",
  "50_TO_100",
  "MORE_THAN_100",
] as const;

/* ================================================================
 * REGEX
 * ================================================================ */

/**
 * Regex nomor WhatsApp Indonesia.
 * Menerima format: 08xx, 628xx, +628xx
 * Panjang digit: 10–15 angka.
 */
const INDONESIAN_PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

/* ================================================================
 * SCHEMA UTAMA — Form Pengajuan Reseller
 * ================================================================ */

/**
 * Zod schema untuk form /reseller/apply.
 * Sesuai field di PRD-FINAL Bab 6.5.
 */
export const applyResellerSchema = z.object({
  /* ---- Seksi 2: Data Usaha ---- */

  applicant_type: z.enum(APPLICANT_TYPE_VALUES, "Tipe pemohon wajib dipilih"),

  business_name: z
    .string()
    .min(1, "Nama usaha / institusi wajib diisi")
    .max(255, "Nama usaha / institusi maksimal 255 karakter"),

  whatsapp_number: z
    .string()
    .min(1, "Nomor WhatsApp wajib diisi")
    .regex(
      INDONESIAN_PHONE_REGEX,
      "Format nomor tidak valid. Contoh: 08123456789"
    ),

  business_address: z
    .string()
    .min(1, "Alamat usaha wajib diisi"),

  province: z
    .string()
    .min(1, "Provinsi wajib dipilih"),

  city: z
    .string()
    .min(1, "Kota/Kabupaten wajib dipilih"),

  district: z
    .string()
    .min(1, "Kecamatan wajib dipilih"),

  sales_channels: z
    .array(z.enum(SALES_CHANNEL_VALUES))
    .min(1, "Pilih minimal 1 kanal penjualan"),

  /**
   * store_url: opsional, harus valid URL jika diisi.
   * String kosong ("") dinormalisasi menjadi null.
   */
  store_url: z
    .string()
    .url("Format URL tidak valid. Contoh: https://tokopedia.com/toko-anda")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),

  estimated_monthly_volume: z.enum(
    ESTIMATED_VOLUME_VALUES,
    "Perkiraan volume pembelian wajib dipilih"
  ),

  reason: z
    .string()
    .min(20, "Alasan minimal 20 karakter")
    .max(1000, "Alasan maksimal 1000 karakter"),

  /* ---- Seksi 3: Dokumen & Persetujuan ---- */

  /**
   * `agree_to_terms`: hanya validasi client-side.
   * TIDAK dikirim ke server (dibuang sebelum request via Omit).
   * PRD Bab 6.5: "Tombol kirim nonaktif sampai dicentang."
   */
  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, {
      message: "Anda wajib menyetujui syarat & ketentuan program reseller",
    }),
});

/** Tipe form values yang di-infer dari schema (termasuk agree_to_terms). */
export type ApplyResellerFormValues = z.infer<typeof applyResellerSchema>;

/**
 * Tipe data yang dikirim ke server setelah `agree_to_terms` dibuang.
 * Gunakan ini saat memanggil resellerService.applyReseller().
 */
export type ApplyResellerPayload = Omit<ApplyResellerFormValues, "agree_to_terms">;

/* ================================================================
 * SCHEMA ADMIN — Penolakan Pengajuan
 * ================================================================ */

/**
 * Schema untuk form penolakan pengajuan oleh admin.
 * Dipakai di modal reject di halaman /admin/resellers/[id].
 * PRD Bab 6.7: alasan penolakan wajib diisi.
 */
export const rejectResellerSchema = z.object({
  rejection_reason: z
    .string()
    .min(1, "Alasan penolakan wajib diisi")
    .max(1000, "Alasan penolakan maksimal 1000 karakter"),
});

export type RejectResellerFormValues = z.infer<typeof rejectResellerSchema>;
