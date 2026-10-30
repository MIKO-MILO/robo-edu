import "server-only";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { getSession as getMockSession } from "@/lib/auth/session";

export const runtime = "nodejs";

/**
 * Admin roles (kolom `user.role`). Granular sesuai PRD: superadmin, admin,
 * admin_sales, admin_laporan. Case-insensitive karena DB menyimpan lowercase.
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

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: "Silakan login terlebih dahulu." },
    { status: 401 },
  );
}

function forbiddenResponse() {
  return NextResponse.json(
    { success: false, message: "Anda tidak memiliki izin akses admin." },
    { status: 403 },
  );
}

/**
 * Hasil dari {@link requireAdmin}.
 *
 * - `ok: true`  → caller boleh lanjut; `userId` adalah id user yang login
 *   (UUID asli dari session cookie). `null` bila auth lewat mock token
 *   (tidak ada row user asli di DB).
 * - `ok: false` → caller HARUS langsung return `response` (401/403).
 */
export type RequireAdminResult =
  | { ok: true; userId: string | null }
  | { ok: false; response: NextResponse };

/**
 * Helper shared untuk guard route admin.
 *
 * Urutan pengecekan auth:
 *  1. **Session cookie** (`roboedu_session`, HMAC-signed via
 *     `src/lib/auth/session.ts`) → cari row `user`, cek `isActive` + role admin.
 *  2. **Mock token** (backward compat, JWT dummy via `lib/auth/session.ts`)
 *     → role admin ada langsung di payload; tidak ada lookup DB.
 *
 * Token kedua format berbeda (2-part vs 3-part) sehingga parser saling
 * menolak — aman dijalankan berurutan tanpa ambiguitas.
 *
 * @example
 * ```ts
 * const auth = await requireAdmin();
 * if (!auth.ok) return auth.response;
 * // auth.userId tersedia bila perlu
 * ```
 */
export async function requireAdmin(request?: Request): Promise<RequireAdminResult> {
  // ── 1. Real signed session cookie ───────────────────────────────────────
  const realUserId = await getSessionUserId(request);
  if (realUserId) {
    const [user] = await db
      .select({ role: users.role, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, realUserId))
      .limit(1);

    if (!user || !user.isActive || !isAdminRole(user.role)) {
      return { ok: false, response: forbiddenResponse() };
    }
    return { ok: true, userId: realUserId };
  }

  // ── 2. Mock token (backward compat) ────────────────────────────────────
  const mockSession = await getMockSession(request);
  if (mockSession) {
    if (!isAdminRole(mockSession.role)) {
      return { ok: false, response: forbiddenResponse() };
    }
    return { ok: true, userId: null };
  }

  // ── 3. Tidak ada sesi sama sekali ──────────────────────────────────────
  return { ok: false, response: unauthorizedResponse() };
}
