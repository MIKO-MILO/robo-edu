import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * Admin role values stored in the `users.role` column (lowercase).
 */
const ADMIN_ROLES = new Set([
  "admin",
  "superadmin",
  "admin_sales",
  "admin_laporan",
]);

/**
 * Lazy singleton DB pool for middleware.
 * Kept separate from the main app pool (1 connection) to avoid exhausting it.
 */
let _pool: mysql.Pool | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null;

function getDb() {
  if (!_db) {
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      connectionLimit: 2,
    });
    _db = drizzle(_pool);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _db;
}

/**
 * Read `maintenance_mode` from settings and optionally check the user's role.
 * Both queries are issued in parallel.
 */
async function getMaintenanceAndRole(userId: string | null): Promise<{
  isMaintenanceActive: boolean;
  isAdmin: boolean;
}> {
  const db = getDb();

  const [settingResult, userResult] = await Promise.all([
    db.execute(
      sql`SELECT value FROM settings WHERE \`key\` = 'maintenance_mode' LIMIT 1`,
    ),
    userId
      ? db.execute(
          sql`SELECT role, is_active FROM users WHERE id = ${userId} LIMIT 1`,
        )
      : Promise.resolve([[]] as unknown[][]),
  ]);

  // Drizzle execute returns [rows, fields] tuple from mysql2
  const settingRows = Array.isArray(settingResult[0]) ? settingResult[0] as { value: string }[] : [];
  const userRows = Array.isArray(userResult[0]) ? userResult[0] as { role: string; is_active: number }[] : [];

  const isMaintenanceActive =
    settingRows.length > 0 ? settingRows[0].value === "true" : false;

  const user = userRows.length > 0 ? userRows[0] : null;
  const isAdmin =
    !!user &&
    user.is_active === 1 &&
    ADMIN_ROLES.has((user.role ?? "").toLowerCase());

  return { isMaintenanceActive, isAdmin };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always let through: API routes, /maintenance itself, Next.js internals,
  // static files, and all /admin routes (the admin guard handles its own auth).
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Identify the visitor from the session cookie (may be null for guests).
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
    // If the DB is unreachable, fail open (let the request through) to avoid
    // a complete outage when maintenance mode is off.
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run only on user-facing page routes. Skip:
   *  - /api/*          — route handlers handle their own auth
   *  - /_next/*        — Next.js internal requests
   *  - /admin*         — admin section; requireAdmin() handles auth
   *  - /maintenance    — the maintenance page itself must always be accessible
   *  - static files    — anything with an extension (images, fonts, etc.)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|_vercel|admin|maintenance|favicon\\.ico|.*\\..*).*)",
  ],
};
