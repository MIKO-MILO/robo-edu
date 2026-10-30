import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest configuration for the behavior-test harness.
 *
 * Design notes:
 *  - `environment: "node"` — route handlers + DB code are server-side; we don't
 *    need a DOM.
 *  - `@` is aliased to the workspace root (matches tsconfig `paths` `@/*` →
 *    `./*`), so `@/src/db` etc. resolve exactly as they do in the app.
 *  - `server-only` is aliased to an empty stub — the real package throws outside
 *    a Next.js server-component build, and several modules the route handlers
 *    import do `import "server-only"`.
 *  - Tests run serially in a single fork (`singleFork: true`) because they share
 *    one real test database; parallel files would race on the shared DB.
 *  - `globalSetup` creates/seedes the DB once per run; `setupFiles` sets the
 *    test env per worker and resets data before each test.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    // The app's db pool (inside @/src/db, imported by handlers) stays open in the
    // fork; forceExit makes the process leave after tests finish.
    forceExit: true,
    // Integration tests against a real DB are slower than unit tests.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
