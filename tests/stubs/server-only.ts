/**
 * Stub for the `server-only` package.
 *
 * The real `server-only` throws when imported outside of a Next.js server
 * component build. Route handlers import modules that do `import "server-only"`,
 * so during tests we alias `server-only` to this empty module.
 *
 * The alias is configured in vitest.config.ts.
 */
export {};
