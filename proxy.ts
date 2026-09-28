import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/src/lib/auth/session";

// ── Helpers for admin JWT parsing (mock, to be replaced with real auth) ───────

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
  const norm = role.toUpperCase();
  return (
    norm === "ADMIN" ||
    norm === "SUPERADMIN" ||
    norm === "ADMIN_SALES" ||
    norm === "ADMIN_LAPORAN"
  );
}

// ── Proxy (replaces middleware.ts) ────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);

    // /admin/login is always public
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

  // ── Protected user routes (/profile, /checkout) ─────────────────────────────
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile",
    "/profile/:path*",
    "/checkout",
    "/checkout/:path*",
    "/cart",
  ],
};
