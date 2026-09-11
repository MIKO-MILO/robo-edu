import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO(auth): Fungsi ini mock. Ganti createMockSession dengan response asli dari POST /auth/login, dan getSession dengan validasi token ke backend (lihat api.md §2).

function parseMockTokenPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect only /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Forward current pathname to Server Components (e.g. AdminLayout)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Allow public access to /admin/login
  if (pathname === "/admin/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Read roboedu_session cookie
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

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
