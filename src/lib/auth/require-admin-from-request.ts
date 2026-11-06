import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";

/**
 * Admin roles — same set as require-admin.ts.
 * Kept in sync manually; consider extracting to a shared constant if it grows.
 */
const ADMIN_ROLES = new Set([
  "admin",
  "superadmin",
  "admin_sales",
  "admin_laporan",
]);

function isAdminRole(role: string | null | undefined): boolean {
  return !!role && ADMIN_ROLES.has(role.toLowerCase());
}

export type RequireAdminResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Testable admin guard that reads the session token from the raw `Request`
 * Cookie header via {@link getUserIdFromRequest} (no Next.js async context
 * required — works in plain-Node vitest tests).
 *
 * Use this in route handlers that already receive a `Request` / `NextRequest`
 * argument and want to be exercised by the test harness without mocking.
 *
 * For routes that don't receive a request argument, keep using
 * {@link requireAdmin} from `require-admin.ts`.
 */
export async function requireAdminFromRequest(
  request: Request,
): Promise<RequireAdminResult> {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      ),
    };
  }

  const [user] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.isActive) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 },
      ),
    };
  }

  if (!isAdminRole(user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Anda tidak memiliki izin akses admin." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, userId };
}
