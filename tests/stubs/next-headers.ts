/**
 * Test stub for `next/headers`.
 *
 * The real `next/headers` `cookies()`/`headers()` read from Next.js's
 * request-scoped AsyncLocalStorage, which only exists while the Next.js server
 * is processing a request. Route handlers we call directly in vitest have no
 * such context, so the real implementation throws:
 *
 *   "`cookies` was called outside a request scope."
 *
 * Several auth helpers our route handlers depend on — `getSessionUserId()`
 * and the mock `getSession()` — call `cookies()` to read the session cookie.
 * Admin routes guard with `requireAdmin()`, which calls both. To exercise those
 * guards end-to-end in tests we stub `cookies()` with a plain in-memory cookie
 * store that tests can seed via `setSessionCookie()`.
 *
 * The alias `next/headers` → this file is configured in vitest.config.ts, so it
 * applies to every module imported during a test run (including the real
 * `src/lib/auth/session.ts` and the mock `lib/auth/session.ts`).
 *
 * The store is reset before every test by `tests/setup.ts` (`__clearCookies()`).
 */

/** A minimal cookie shape matching Next.js `RequestCookie`. */
type Cookie = { name: string; value: string };

const _cookies = new Map<string, string>();

/** Seed a cookie (typically the session cookie) before invoking a handler. */
export function setSessionCookie(name: string, value: string): void {
  _cookies.set(name, value);
}

/** Wipe the in-memory cookie store; called from the global beforeEach. */
export function __clearCookies(): void {
  _cookies.clear();
}

function cookieStore() {
  return {
    get(name: string): Cookie | undefined {
      return _cookies.has(name)
        ? { name, value: _cookies.get(name)! }
        : undefined;
    },
    getAll(): Cookie[] {
      return [..._cookies.entries()].map(([name, value]) => ({ name, value }));
    },
    has(name: string): boolean {
      return _cookies.has(name);
    },
    set(name: string, value: string): void {
      _cookies.set(name, value);
    },
    delete(name: string): void {
      _cookies.delete(name);
    },
    clear(): void {
      _cookies.clear();
    },
  };
}

function headerStore() {
  const _headers = new Map<string, string>();
  return {
    get(name: string): string | undefined {
      // Header lookups in Next.js are case-insensitive.
      const lower = name.toLowerCase();
      for (const [k, v] of _headers) if (k.toLowerCase() === lower) return v;
      return undefined;
    },
    getAll(): Array<{ key: string; value?: string }> {
      return [..._headers.entries()].map(([key, value]) => ({ key, value }));
    },
    set(name: string, value: string): void {
      _headers.set(name, value);
    },
    has(name: string): boolean {
      const lower = name.toLowerCase();
      for (const k of _headers.keys()) if (k.toLowerCase() === lower) return true;
      return false;
    },
    append(name: string, value: string): void {
      _headers.set(name, value);
    },
    delete(name: string): void {
      _headers.delete(name);
    },
    clear(): void {
      _headers.clear();
    },
  };
}

/** Stub of `cookies()` from `next/headers`. */
export async function cookies() {
  return cookieStore();
}

/** Stub of `headers()` from `next/headers` (not used by app code today, but
 *  provided so any transitive import resolves instead of throwing). */
export async function headers() {
  return headerStore();
}
