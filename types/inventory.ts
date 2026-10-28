/**
 * inventory.ts
 * ------------------------------------------------------------------
 * Tipe-tipe khusus untuk fitur manajemen stok/inventory di admin.
 * InventoryVariantRow (DTO tampilan) ada di catalog.ts karena masih
 * erat dengan domain produk.
 * ------------------------------------------------------------------
 */

/** Mode penyesuaian stok di dialog adjust. */
export type AdjustMode = "set" | "delta";

/** Nilai form dialog adjust stok. */
export interface StockAdjustFormValues {
  /** "set" = overwrite langsung, "delta" = tambah/kurangi dari nilai sekarang. */
  mode: AdjustMode;
  /** Nilai baru stok (mode=set) atau selisih +/- (mode=delta). */
  value: number;
  /** Catatan perubahan — hanya untuk UX admin, tidak dikirim ke API. */
  note: string;
}
