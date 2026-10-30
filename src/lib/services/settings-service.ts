import "server-only";

import { db } from "@/src/db";
import { settings } from "@/src/db/schema";
import { sql } from "drizzle-orm";

/**
 * Nilai default untuk konfigurasi aplikasi jika belum diset di DB.
 */
export const DEFAULT_SETTINGS: Record<string, string> = {
  // Informasi Toko
  store_name: "RoboEdu Store",
  store_phone: "081234567890",
  store_email: "store@roboedu.id",
  store_address: "Jakarta, Indonesia",

  // Membership Plus
  membership_plus_price: "299000",
  membership_plus_duration_months: "12",

  // Pengiriman
  shipping_min_weight: "1000",
  shipping_cost: "20000",
  shipping_default_provider: "J&T",
};

/**
 * Mengambil semua settings dari database sebagai flat object.
 * Key yang belum pernah diset di database akan menggunakan nilai dari {@link DEFAULT_SETTINGS}.
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);

  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    result[row.key] = row.value;
  }

  return result;
}

/**
 * Mengambil nilai satu setting berdasarkan key.
 */
export async function getSetting(
  key: string,
  fallback?: string,
): Promise<string> {
  const all = await getAllSettings();
  return all[key] ?? fallback ?? DEFAULT_SETTINGS[key] ?? "";
}

/**
 * Memperbarui settings secara parsial (hanya keys yang dikirim).
 * Mendukung upsert: membuat key baru jika belum ada, atau memperbarui jika sudah ada.
 */
export async function updateSettings(
  partial: Record<string, unknown>,
): Promise<Record<string, string>> {
  const entries = Object.entries(partial);
  if (entries.length === 0) {
    return getAllSettings();
  }

  for (const [key, value] of entries) {
    if (!key || typeof key !== "string" || key.trim() === "") {
      throw new Error("Key setting tidak boleh kosong.");
    }
    if (key.length > 100) {
      throw new Error(`Key setting '${key}' melebihi batas 100 karakter.`);
    }

    if (
      value === null ||
      value === undefined ||
      typeof value === "object"
    ) {
      throw new Error(`Nilai untuk key '${key}' tidak valid.`);
    }

    const stringValue = String(value);

    // Validasi nilai spesifik untuk key penting
    if (key === "membership_plus_price") {
      const num = Number(stringValue);
      if (isNaN(num) || num < 0) {
        throw new Error("Harga membership harus berupa angka non-negatif.");
      }
    } else if (key === "membership_plus_duration_months") {
      const num = Number(stringValue);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        throw new Error("Durasi membership harus berupa bilangan bulat positif.");
      }
    } else if (key === "shipping_min_weight" || key === "shipping_cost") {
      const num = Number(stringValue);
      if (isNaN(num) || num < 0) {
        throw new Error(`Nilai ${key} harus berupa angka non-negatif.`);
      }
    }

    await db
      .insert(settings)
      .values({
        key,
        value: stringValue,
        updatedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          value: stringValue,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  return getAllSettings();
}
