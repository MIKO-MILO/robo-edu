import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/src/lib/auth/session";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";

// ── Admin role check ──────────────────────────────────────────────────────────

const ADMIN_ROLES = new Set(["admin", "superadmin", "admin_sales", "admin_laporan"]);

function parseMockTokenPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ADMIN_ROLES.has(role.toLowerCase());
}

// ── Lazy DB pool — maintenance mode only ─────────────────────────────────────
// Kept minimal (2 connections) so it does not exhaust the main app pool.

let _pool: mysql.Pool | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

function getDb() {
  if (!_db) {
    _pool = mysql.createPool({ uri: process.env.DATABASE_URL!, connectionLimit: 2 });
    _db = drizzle(_pool);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _db;
}

async function getMaintenanceAndRole(userId: string | null): Promise<{
  isMaintenanceActive: boolean;
  isAdmin: boolean;
}> {
  const db = getDb();
  const [settingResult, userResult] = await Promise.all([
    db.execute(sql`SELECT value FROM settings WHERE \`key\` = 'maintenance_mode' LIMIT 1`),
    userId
      ? db.execute(sql`SELECT role, is_active FROM users WHERE id = ${userId} LIMIT 1`)
      : Promise.resolve([[]] as unknown[][]),
  ]);

  const settingRows = Array.isArray(settingResult[0])
    ? (settingResult[0] as { value: string }[])
    : [];
  const userRows = Array.isArray(userResult[0])
    ? (userResult[0] as { role: string; is_active: number }[])
    : [];

  const isMaintenanceActive = settingRows.length > 0 ? settingRows[0].value === "true" : false;
  const user = userRows.length > 0 ? userRows[0] : null;
  const isAdmin =
    !!user && user.is_active === 1 && ADMIN_ROLES.has((user.role ?? "").toLowerCase());

  return { isMaintenanceActive, isAdmin };
}

// ── Proxy (replaces middleware.ts) ────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Maintenance mode check (semua user-facing routes, skip static/api) ───
  const isPublicAsset =
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/maintenance") ||
    pathname.includes(".");

  if (!isPublicAsset) {
    try {
      const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const session = verifySessionToken(cookieValue);
      const userId = session?.userId ?? null;

      const { isMaintenanceActive, isAdmin } = await getMaintenanceAndRole(userId);

      if (isMaintenanceActive && !isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
    } catch {
      // DB unreachable → fail open (let request through) to avoid total outage
    }
  }

  // ── 2. Admin routes auth guard ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    if (pathname === "/admin/login") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const sessionToken =
      request.cookies.get("roboedu_session")?.value ||
      request.cookies.get("auth_token")?.value ||
      request.cookies.get("token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = parseMockTokenPayload(sessionToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload) {
      if (payload.exp && payload.exp < nowInSeconds) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (!isAdminRole(payload.role)) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── 3. Protected user routes (/profile, /checkout, /cart) ───────────────────
  const protectedPaths = ["/profile", "/checkout", "/cart"];
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected) {
    const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Jalankan di semua page routes. Skip:
   *  - /_next/*      — Next.js internals
   *  - /api/*        — route handlers (handle auth sendiri)
   *  - /maintenance  — harus selalu accessible
   *  - static files  — file dengan ekstensi (gambar, font, dll.)
   */
  matcher: [
    "/((?!_next/static|_next/image|_vercel|api|favicon\\.ico|.*\\..*).*)",
  ],
};

