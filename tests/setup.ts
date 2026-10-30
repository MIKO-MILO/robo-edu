/**
 * vitest setupFiles — runs in every worker, before each test file's imports are
 * evaluated.
 *
 * This guarantees `process.env.DATABASE_URL` points at the test database BEFORE
 * any application module (which reads it at import time) is loaded — e.g. the
 * route handlers importing `@/src/db`.
 *
 * It also registers a global `beforeEach` that resets + reseeds the DB, so every
 * test starts from the deterministic fixture state (no leftover rows, full
 * isolation). Later tickets just write tests; they don't have to remember to
 * reset.
 */
import { beforeEach } from "vitest";
import { loadTestEnv } from "./helpers/env";
import { resetData } from "./helpers/db";

loadTestEnv();

beforeEach(async () => {
  await resetData();
});
