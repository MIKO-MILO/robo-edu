/**
 * vitest globalSetup — runs once at the start of `npm run test`, in the main
 * process, before any test file is loaded.
 *
 * Responsibilities:
 *   1. Make sure the test env is active (DATABASE_URL points at the test DB).
 *   2. Create the test database if it doesn't exist (+ grant the app user).
 *   3. Push the live Drizzle schema onto the test database.
 *   4. Truncate + seed deterministic fixtures (clean start, no leftover state).
 *
 * Returns a teardown that closes the helper pool so the process exits cleanly.
 */
import { closeTestPool, ensureTestDatabase, pushSchema, resetData } from "./helpers/db";

export default async function globalSetup(): Promise<() => Promise<void>> {
  await ensureTestDatabase();
  pushSchema();
  await resetData();

  return async () => {
    await closeTestPool();
  };
}
