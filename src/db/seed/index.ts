/**
 * Master seed runner — runs all seeders in dependency order.
 *
 * Usage:
 *   npm run db:seed          ← runs everything
 *   npm run db:seed:shipping ← shipping providers only
 *   npm run db:seed:settings ← settings only
 *   npm run db:seed:products ← products/categories only
 *   npm run db:seed:admin    ← admin user only
 *
 * Dependency order:
 *   1. settings         — no foreign keys
 *   2. shipping         — no foreign keys
 *   3. products/catalog — depends on categories + product_types
 *   4. admin            — depends on users table
 *
 * All individual seeders are idempotent (skip duplicates), so running
 * this more than once is safe.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { seedSettings } from "./settings";
import { seedShippingProviders } from "./shipping-providers";

// Products and admin are not yet refactored to export a function — they're
// standalone scripts that call process.exit(). We run them as child processes
// to keep the master runner clean.
import { execSync } from "node:child_process";

async function main() {
  console.log("🌱 Starting full database seed...\n");

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  // ── 1. Settings ────────────────────────────────────────────────────────
  console.log("--- [1/4] Settings ---");
  await seedSettings(db);
  console.log();

  // ── 2. Shipping providers ──────────────────────────────────────────────
  console.log("--- [2/4] Shipping Providers ---");
  await seedShippingProviders(db);
  console.log();

  await connection.end();

  // ── 3. Products / catalog ──────────────────────────────────────────────
  // Runs as a child process because products.ts calls process.exit() internally.
  console.log("--- [3/4] Products & Catalog ---");
  try {
    execSync("npx tsx src/db/seed/products.ts", {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    // products seed exits with 0 on success — non-zero means real failure
    console.error("❌ Products seed failed.");
    process.exit(1);
  }
  console.log();

  // ── 4. Admin user ──────────────────────────────────────────────────────
  console.log("--- [4/4] Admin User ---");
  try {
    execSync("npx tsx src/db/seed/admin.ts", {
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    console.error("❌ Admin seed failed.");
    process.exit(1);
  }

  console.log("\n✅ All seeds completed successfully.");
}

main().catch((err) => {
  console.error("❌ Master seed runner failed:", err.message);
  process.exit(1);
});
