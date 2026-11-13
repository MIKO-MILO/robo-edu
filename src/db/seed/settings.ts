import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { settings } from "../schema/settings";

/**
 * Seed data for the app-level settings table.
 *
 * Six mandatory keys from ticket 01:
 *   - membership_plus_price          — membership price in Rupiah
 *   - membership_plus_duration_months — membership duration in months
 *   - store_name                     — store display name
 *   - store_phone                    — store contact phone
 *   - store_email                    — store contact email
 *   - store_address                  — store physical address
 *
 * Strategy: insert the default if the key doesn't exist yet. If the key
 * already exists (e.g. admin set a custom value), keep the existing value
 * untouched so admin edits survive a re-seed.
 *
 * Run standalone: npm run db:seed:settings
 */

export const SETTINGS_SEED = [
  { key: "membership_plus_price",           value: "299000" },
  { key: "membership_plus_duration_months", value: "12" },
  { key: "store_name",                      value: "RoboEdu" },
  { key: "store_phone",                     value: "08119999999" },
  { key: "store_email",                     value: "hello@roboedu.id" },
  { key: "store_address",                   value: "Jakarta, Indonesia" },
  { key: "order_expires_hours",              value: "24" },
  {
    key: "payment_methods_config",
    value: JSON.stringify({
      bca_va: true,
      bni_va: true,
      bri_va: true,
      mandiri_va: true,
      permata_va: true,
      cimb_va: true,
      credit_card: true,
      gopay: true,
      shopeepay: true,
      qris: true,
      dana: true,
      ovo: true,
      alfamart: true,
      indomaret: true,
    }),
  },
] as const;

export async function seedSettings(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): Promise<void> {
  // Fetch all existing keys in one query.
  const existing = await db
    .select({ key: settings.key })
    .from(settings);
  const existingKeys = new Set(existing.map((r: { key: string }) => r.key));

  let inserted = 0;
  let kept = 0;

  for (const row of SETTINGS_SEED) {
    if (existingKeys.has(row.key)) {
      kept++;
    } else {
      await db.insert(settings).values({ key: row.key, value: row.value });
      inserted++;
    }
  }

  console.log(
    `✅ Settings: ${inserted} inserted (default), ${kept} already exist (kept as-is)`,
  );
  for (const s of SETTINGS_SEED) {
    const status = existingKeys.has(s.key) ? "kept" : "inserted";
    console.log(`   • ${s.key} — ${status}`);
  }
}

// ── Standalone runner ─────────────────────────────────────────────────────────
// Only runs when this file is executed directly (not when imported by index.ts)
if (process.argv[1]?.endsWith("settings.ts") || process.argv[1]?.endsWith("settings.js")) {
  async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);
    await seedSettings(db);
    await connection.end();
  }

  main().catch((err) => {
    console.error("❌ Seed settings gagal:", err.message);
    process.exit(1);
  });
}
