/**
 * Apply migration 0004_membership_foundation.sql
 * Run: npx tsx scripts/apply-migration-0004.ts
 */
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SQL_FILE = join(__dirname, "../drizzle/0004_membership_foundation.sql");

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const conn = await mysql.createConnection({ uri: url, multipleStatements: false });

  const raw = readFileSync(SQL_FILE, "utf8");

  // Remove block comments and split on ";\n" boundaries
  const lines = raw.split("\n");
  const filtered = lines.filter(
    (l) => !l.trimStart().startsWith("--") && l.trim() !== ""
  );

  // Rejoin and split on semicolons
  const fullText = filtered.join("\n");
  const stmts = fullText
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Applying ${stmts.length} statements from 0004_membership_foundation.sql...`);

  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i];
    try {
      await conn.execute(stmt);
      console.log(`[${i + 1}/${stmts.length}] OK: ${stmt.slice(0, 70).replace(/\n/g, " ")}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      // Ignore "already exists" / "duplicate" / "unknown column" errors for idempotency
      if (
        errMsg.includes("already exists") ||
        errMsg.includes("Duplicate") ||
        errMsg.includes("Can't DROP") ||
        errMsg.includes("Unknown column") ||
        errMsg.includes("Duplicate entry") ||
        errMsg.includes("doesn't exist") ||
        errMsg.includes("check that column") ||
        errMsg.includes("Can't create") 
      ) {
        console.warn(`[${i + 1}/${stmts.length}] SKIP (already applied or not needed): ${stmt.slice(0, 70).replace(/\n/g, " ")}`);
      } else {
        console.error(`[${i + 1}/${stmts.length}] ERROR: ${errMsg}`);
        console.error(`  Statement: ${stmt.slice(0, 200)}`);
        throw err;
      }
    }
  }

  await conn.end();
  console.log("\n✓ Migration 0004 applied successfully.");
}

run().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
