/**
 * Test environment loader.
 *
 * Tests must run against a SEPARATE test database so the dev database is never
 * wiped. This module:
 *   1. Loads `.env` (so DATABASE_URL / DB_ROOT_PASSWORD etc. are available).
 *   2. Derives the test database URL — `TEST_DATABASE_URL` if set, otherwise the
 *      `DATABASE_URL` database name with an `_test` suffix.
 *   3. Sets `process.env.DATABASE_URL` to the TEST url BEFORE any application
 *      module (which reads `process.env.DATABASE_URL!` at import time) is loaded.
 *   4. Guarantees a `SESSION_SECRET` long enough for the session signer.
 *
 * Import this module FIRST in any test entry point (setupFiles / globalSetup)
 * so the env is in place before `@/src/db` creates its connection pool.
 */
import { config } from "dotenv";

// Load `.env` (and `.env.local` if present). Does not override already-set vars.
config();

const TEST_SESSION_SECRET = "roboedu_test_session_secret_at_least_32_chars_long!!";

/**
 * Derive the test database connection URL.
 *
 * Priority:
 *   1. `TEST_DATABASE_URL` env var (explicit override).
 *   2. `DATABASE_URL` with the database name suffixed by `_test`.
 *
 * Throws if `DATABASE_URL` is not configured — the test harness needs a real
 * MySQL server to connect to (no mocks, per the spec testing decisions).
 */
export function getTestDbUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;

  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env (or set TEST_DATABASE_URL) " +
        "so the test harness can connect to a real MySQL server.",
    );
  }

  const parsed = new URL(baseUrl);
  if (!parsed.pathname || parsed.pathname === "/") {
    throw new Error(
      `DATABASE_URL "${baseUrl.replace(parsed.password || "", "***")}" has no database name; cannot derive a test database URL.`,
    );
  }

  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  // Idempotent: if the configured db already targets the test database, use it
  // as-is. This keeps derivation correct even after loadTestEnv() overwrites
  // process.env.DATABASE_URL (and when worker processes inherit that value).
  const testName = dbName.endsWith("_test") ? dbName : `${dbName}_test`;
  parsed.pathname = `/${testName}`;
  return parsed.toString();
}

/** Parsed pieces of the test DB url, used to create/grant the database. */
export function getTestDbParts() {
  const url = new URL(getTestDbUrl());
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
}

/**
 * Make the test env the active process env.
 *
 * Idempotent — safe to call from both globalSetup and setupFiles.
 */
export function loadTestEnv(): void {
  process.env.DATABASE_URL = getTestDbUrl();
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    process.env.SESSION_SECRET = TEST_SESSION_SECRET;
  }
  if (!process.env.NODE_ENV) process.env.NODE_ENV = "test";
}
