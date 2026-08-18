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
