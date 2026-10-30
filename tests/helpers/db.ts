import mysql from "mysql2/promise";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { execSync } from "node:child_process";
import * as schema from "@/src/db/schema";
import { getTestDbParts, getTestDbUrl, loadTestEnv } from "./env";

/**
 * Test database connection pool + drizzle instance.
 *
 * This is a SEPARATE pool from the one inside `@/src/db` (which the route
 * handlers import). Both point at the same test database (env is set in
 * `tests/helpers/env.ts`), so data written through either is visible to the
 * other — assertions query the same rows the handlers wrote.
 */

let _pool: mysql.Pool | null = null;
let _db: MySql2Database<typeof schema> | null = null;

function pool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool({ uri: getTestDbUrl(), connectionLimit: 5 });
  }
  return _pool;
}

/** Drizzle instance bound to the test database. */
export function testDb(): MySql2Database<typeof schema> {
  if (!_db) _db = drizzle(pool(), { schema, mode: "default" });
  return _db;
}

/** Close the test pool so the process can exit cleanly. */
export async function closeTestPool(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}

/**
 * Ensure the test database exists and the app user can use it.
 *
 * The MySQL user from DATABASE_URL may lack CREATE DATABASE privileges (the
 * official MySQL docker image grants the user only its own DB). So we prefer a
 * root-capable connection to CREATE + GRANT, falling back to the app user.
 */
export async function ensureTestDatabase(): Promise<void> {
  loadTestEnv();
  const parts = getTestDbParts();

  // Prefer an explicit admin URL, then root via DB_ROOT_PASSWORD, then the app
  // user (works if they happen to have CREATE privileges).
  const adminUrl =
    process.env.TEST_DB_ADMIN_URL ??
    (process.env.DB_ROOT_PASSWORD
      ? `mysql://root:${encodeURIComponent(process.env.DB_ROOT_PASSWORD)}@${parts.host}:${parts.port}`
      : getTestDbUrl());

  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(adminUrl);
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${parts.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    // Best-effort grant so the app user (who runs drizzle-kit push + the app)
    // can access the test database. Tolerate failure (user may already have it
    // or the admin connection is the app user itself).
    try {
      const grantUser = parts.user.replace(/'/g, "''");
      await conn.query(
        `GRANT ALL PRIVILEGES ON \`${parts.database}\`.* TO '${grantUser}'@'%'`,
      );
      await conn.query("FLUSH PRIVILEGES");
    } catch {
      /* grants may already be in place or admin connection is the app user */
    }
    console.log(`[test-harness] database ready: ${parts.database}`);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    throw new Error(
      `[test-harness] cannot create test database "${parts.database}". ` +
        `Start MySQL (e.g. \`docker compose up -d mysql\`) and ensure DB_ROOT_PASSWORD ` +
        `is set, or create the database manually. Underlying error: ${code ?? (err as Error).message}`,
    );
  } finally {
    if (conn) await conn.end();
  }
}

/**
 * Push the current Drizzle schema onto the test database.
 *
 * Uses `drizzle-kit push --force` so the test DB schema is always derived from
 * the live schema in src/db/schema — no stale migration SQL, no drift.
 */
export function pushSchema(): void {
  const testUrl = getTestDbUrl();
  console.log("[test-harness] pushing schema...");
  execSync("npx drizzle-kit push --force", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testUrl },
  });
  console.log("[test-harness] schema pushed");
}

/**
 * Wipe all data tables and re-seed deterministic fixtures.
 *
 * Called once per `npm run test` (globalSetup) and again before each test
 * (beforeEach) for isolation. Because fixtures use fixed IDs and the tables are
 * wiped first, the test DB is in a known state with no leftover rows.
 *
 * The wipe is sent as a single multi-statement query to keep round trips low —
 * important because this runs before every test.
 */
export async function resetData(): Promise<void> {
  const parts = getTestDbParts();
  // Dedicated connection with multipleStatements enabled so the wipe goes out
  // in one round trip. Kept short-lived (closed here) — the pool is used for
  // seeding/querying.
  const conn = await mysql.createConnection({
    uri: getTestDbUrl(),
    multipleStatements: true,
  });
  try {
    const [rows] = await conn.query<{ TABLE_NAME: string }[]>(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'",
      [parts.database],
    );
    const tables = rows.map((r) => r.TABLE_NAME);
    if (tables.length === 0) {
      throw new Error(
        "[test-harness] no tables found in the test DB — did pushSchema() run?",
      );
    }
    const sql =
      "SET FOREIGN_KEY_CHECKS = 0; " +
      // DELETE FROM (not TRUNCATE): the schema uses fixed varchar(36) UUID PKs,
      // so there is no AUTO_INCREMENT to reset, and DELETE FROM is far faster
      // than the DDL-heavy TRUNCATE on this MySQL setup.
      tables.map((t) => `DELETE FROM \`${t}\`;`).join(" ") +
      " SET FOREIGN_KEY_CHECKS = 1;";
    await conn.query(sql);
  } finally {
    await conn.end();
  }

  const { seedFixtures } = await import("./fixtures");
  await seedFixtures(testDb());
}
