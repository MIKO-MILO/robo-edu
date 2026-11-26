import type { UUID, ISODateString, Money } from "./common";
import type { DiscountType } from "./enums";

/**
 * voucher.ts
 * ------------------------------------------------------------------
 * Mencerminkan tabel `voucher` & `voucher_usage`.
 * ------------------------------------------------------------------
 */

export interface Voucher {
  id: UUID;
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number; // persen (kalau PERCENTAGE) atau nominal (kalau FIXED_AMOUNT)
  minimum_purchase: Money | null;
  maximum_discount: Money | null; // relevan kalau discount_type = PERCENTAGE
  usage_limit: number | null;
  used_count: number;
  start_at: ISODateString | null;
  end_at: ISODateString | null;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Catatan: tabel `voucher_usage` TIDAK punya kolom `updated_at`
 * (beda dari kebanyakan tabel lain) — histori pemakaian memang tidak
 * pernah diedit, jadi ini bukan bug/typo di schema, melainkan disengaja. */
export interface VoucherUsage {
  id: UUID;
  voucher_id: UUID;
  user_id: UUID;
  order_id: UUID;
  discount_amount: Money;
  created_at: ISODateString;
}

/** Body — POST /vouchers/validate (api.md §9) */
export interface ValidateVoucherRequestBody {
  code: string;
}

/** Response data — POST /vouchers/validate ("200") */
export interface ValidateVoucherResponseData {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  estimated_discount: Money;
  is_valid: boolean;
}

/** Body — POST /admin/vouchers */
export type CreateVoucherRequestBody = Omit<
  Voucher,
  "id" | "used_count" | "created_at" | "updated_at"
>;

export type UpdateVoucherRequestBody = Partial<CreateVoucherRequestBody>;

/**
 * ------------------------------------------------------------------
 * Promo Banner / Card Component Types (Landing Page & Frontend)
 * ------------------------------------------------------------------
 */

export type VoucherThemeKey = "blue" | "yellow" | "purple" | "pink" | "green";

export interface VoucherPromoItem {
  id: string | number;
  kode?: string;
  nama: string;
  tipeDiskon: string;
  nilaiDiskon: string;
  minPembelian?: string | null;
  maxDiskon?: string | null;
  tanggalBerakhir?: string | null;
  imgUrl?: string;
  secondaryImgUrl?: string;
  themeKey?: VoucherThemeKey;
}

export interface MultiVoucherTheme {
  name: VoucherThemeKey;
  fillStart: string;
  fillEnd: string;
  stroke: string;
  innerDash: string;
  innerDashOpacity: number;
  eyebrowClass: string;
  titleClass: string;
  metaPrimaryClass: string;
  metaSecondaryClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  btnBg: string;
  btnHover: string;
  btnText: string;
  btnBorder: string;
}

/**
 * Pola 3 warna tema berulang untuk Voucher Multi Card:
 * Diskon ke-1 (index 0): Biru (#80A4E8)
 * Diskon ke-2 (index 1): Kuning (#FCDF7E)
 * Diskon ke-3 (index 2): Ungu (#BFB8FF)
 * Diskon ke-4 dst.: Berulang dari awal (Biru, Kuning, Ungu...)
 * Warna diambil langsung dari CSS variables di app/globals.css
 */
export const MULTI_THEMES: MultiVoucherTheme[] = [
  // 1. Biru (index 0) - Diskon ke-1
  // Badge: bg putih, teks biru menyesuaikan card
  // Button: bg biru menyesuaikan card, teks putih
  {
    name: "blue",
    fillStart: "var(--color-voucher-blue, #80A4E8)",
    fillEnd: "var(--color-voucher-blue-end, #6D95DF)",
    stroke: "var(--color-voucher-blue-stroke, #5C86D9)",
    innerDash: "#FFFFFF",
    innerDashOpacity: 0.55,
    eyebrowClass: "text-voucher-blue-eyebrow",
    titleClass: "text-voucher-blue-title",
    metaPrimaryClass: "text-voucher-blue-title font-bold",
    metaSecondaryClass: "text-voucher-blue-title/80",
    badgeBg: "bg-white",
    badgeText: "text-voucher-blue-text",
    badgeBorder: "border-white",
    btnBg: "bg-voucher-blue-btn",
    btnHover: "hover:bg-voucher-blue-btn-hover",
    btnText: "text-voucher-blue-btn-text",
    btnBorder: "border-voucher-blue-btn-border",
  },
  // 2. Kuning (index 1) - Diskon ke-2
  // Badge: bg putih, teks kuning menyesuaikan card (kontras terbaca)
  // Button: khusus card kuning, bg putih dan teks coklat (text-secondary)
  {
    name: "yellow",
    fillStart: "var(--color-voucher-yellow, #FCDF7E)",
    fillEnd: "var(--color-voucher-yellow-end, #F8D261)",
    stroke: "var(--color-voucher-yellow-stroke, #E5BA45)",
    innerDash: "#FFFFFF",
    innerDashOpacity: 0.7,
    eyebrowClass: "text-voucher-yellow-eyebrow",
    titleClass: "text-voucher-yellow-title",
    metaPrimaryClass: "text-voucher-yellow-title font-bold",
    metaSecondaryClass: "text-voucher-yellow-title/80",
    badgeBg: "bg-white",
    badgeText: "text-voucher-yellow-text",
    badgeBorder: "border-white",
    btnBg: "bg-voucher-yellow-btn",
    btnHover: "hover:bg-voucher-yellow-btn-hover",
    btnText: "text-voucher-yellow-btn-text",
    btnBorder: "border-voucher-yellow-btn-border",
  },
  // 3. Ungu (index 2) - Diskon ke-3
  // Badge: bg putih, teks ungu menyesuaikan card
  // Button: bg ungu menyesuaikan card, teks putih
  {
    name: "purple",
    fillStart: "var(--color-voucher-purple, #BFB8FF)",
    fillEnd: "var(--color-voucher-purple-end, #ABA2F5)",
    stroke: "var(--color-voucher-purple-stroke, #968DE0)",
    innerDash: "#FFFFFF",
    innerDashOpacity: 0.55,
    eyebrowClass: "text-voucher-purple-eyebrow",
    titleClass: "text-voucher-purple-title",
    metaPrimaryClass: "text-voucher-purple-title font-bold",
    metaSecondaryClass: "text-voucher-purple-title/80",
    badgeBg: "bg-white",
    badgeText: "text-voucher-purple-text",
    badgeBorder: "border-white",
    btnBg: "bg-voucher-purple-btn",
    btnHover: "hover:bg-voucher-purple-btn-hover",
    btnText: "text-voucher-purple-btn-text",
    btnBorder: "border-voucher-purple-btn-border",
  },
];

/**
 * Helper untuk memetakan Voucher dari Admin/Database ke VoucherPromoItem
 * yang digunakan oleh komponen frontend (VoucherCardMulti / VoucherTicketSingle).
 */
export function mapVoucherToPromoItem(
  voucher: Partial<Voucher> & { id?: string | number },
  index = 0
): VoucherPromoItem {
  // Format nilai diskon
  let nilaiDiskon = "Diskon";
  if (voucher.discount_type === "PERCENTAGE") {
    nilaiDiskon = `Diskon ${voucher.discount_value ?? 0}%`;
  } else if (voucher.discount_type === "FIXED_AMOUNT") {
    const val = Number(voucher.discount_value ?? 0);
    if (val >= 1000) {
      nilaiDiskon = `Potongan Rp ${(val / 1000).toLocaleString("id-ID")}rb`;
    } else {
      nilaiDiskon = `Potongan Rp ${val.toLocaleString("id-ID")}`;
    }
  } else if (voucher.discount_value) {
    nilaiDiskon = `Diskon ${voucher.discount_value}%`;
  }

  // Format min pembelian
  let minPembelian: string | null = null;
  if (voucher.minimum_purchase) {
    const minVal = Number(voucher.minimum_purchase);
    if (minVal >= 1000) {
      minPembelian = `Min. Rp ${(minVal / 1000).toLocaleString("id-ID")}rb`;
    } else {
      minPembelian = `Min. Rp ${minVal.toLocaleString("id-ID")}`;
    }
  }

  // Format max diskon
  let maxDiskon: string | null = null;
  if (voucher.maximum_discount && voucher.discount_type === "PERCENTAGE") {
    const maxVal = Number(voucher.maximum_discount);
    if (maxVal >= 1000) {
      maxDiskon = `Maks. Rp ${(maxVal / 1000).toLocaleString("id-ID")}rb`;
    } else {
      maxDiskon = `Maks. Rp ${maxVal.toLocaleString("id-ID")}`;
    }
  }

  // Format tanggal berakhir
  let tanggalBerakhir: string | null = null;
  if (voucher.end_at) {
    try {
      const d = new Date(voucher.end_at);
      if (!isNaN(d.getTime())) {
        tanggalBerakhir = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      tanggalBerakhir = null;
    }
  }

  // Tipe label diskon: jika ada kode -> PROMO TERBATAS, jika tanpa kode -> DISKON OTOMATIS
  const tipeDiskon = voucher.code ? "PROMO TERBATAS" : "DISKON OTOMATIS";

  // Gambar default bergantian
  const imgUrl = index % 2 === 0 ? "/images/product.webp" : "/images/product2.webp";

  return {
    id: voucher.id ?? `voucher-${index}`,
    kode: voucher.code || undefined,
    nama: voucher.name || "Nama Voucher",
    tipeDiskon,
    nilaiDiskon,
    minPembelian,
    maxDiskon,
    tanggalBerakhir,
    imgUrl,
  };
}

/**
 * Helper untuk mengambil tema warna:
 * Mendukung override opsional themeKey dari backend,
 * namun tetap fallback ke pola berulang (index % MULTI_THEMES.length) jika themeKey kosong/tidak cocok.
 */
export function getMultiVoucherTheme(
  index: number,
  themeKey?: VoucherThemeKey
): MultiVoucherTheme {
  if (themeKey) {
    const matched = MULTI_THEMES.find((t) => t.name === themeKey);
    if (matched) return matched;
  }
  return MULTI_THEMES[Math.abs(index) % MULTI_THEMES.length];
}

// Alias backward compatibility jika ada komponen lama yang memanggil getVoucherTheme
export const getVoucherTheme = getMultiVoucherTheme;
export const VOUCHER_COLOR_THEMES = MULTI_THEMES;
