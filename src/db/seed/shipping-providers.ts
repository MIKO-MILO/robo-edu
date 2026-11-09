import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import { shippingProviders } from "../schema/shipping-provider";

/**
 * Seed data for shipping providers.
 *
 * These are the major Indonesian couriers supported by RoboEdu.
 * IDs are stable UUIDs so they can be referenced in other seed files.
 *
 * Run standalone: npm run db:seed:shipping
 */

export const SHIPPING_PROVIDERS_SEED = [
  {
    id: "provider-jne-001",
    name: "JNE",
    isActive: true,
  },
  {
    id: "provider-jnt-001",
    name: "J&T Express",
    isActive: true,
  },
  {
    id: "provider-sicepat-001",
    name: "SiCepat",
    isActive: true,
  },
  {
    id: "provider-anteraja-001",
    name: "AnterAja",
    isActive: true,
  },
  {
    id: "provider-pos-001",
    name: "Pos Indonesia",
    isActive: true,
  },
] as const;

export async function seedShippingProviders(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
): Promise<void> {
  let inserted = 0;
  let skipped = 0;

  for (const provider of SHIPPING_PROVIDERS_SEED) {
    try {
      await db
        .insert(shippingProviders)
        .values(provider)
        .onDuplicateKeyUpdate({ set: { name: provider.name, isActive: provider.isActive } });
      inserted++;
    } catch {
      skipped++;
    }
  }

  console.log(
    `✅ Shipping providers: ${inserted} inserted/updated, ${skipped} skipped`,
  );
  for (const p of SHIPPING_PROVIDERS_SEED) {
    console.log(`   • ${p.name} (id: ${p.id})`);
  }
}

// ── Standalone runner ─────────────────────────────────────────────────────────
// Only runs when this file is executed directly (not when imported by index.ts)
if (process.argv[1]?.endsWith("shipping-providers.ts") || process.argv[1]?.endsWith("shipping-providers.js")) {
  async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);
    await seedShippingProviders(db);
    await connection.end();
  }

  main().catch((err) => {
    console.error("❌ Seed shipping-providers gagal:", err.message);
    process.exit(1);
  });
}
