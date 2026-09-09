import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route Guard Middleware for Robo-Edu Admin Panel
 * Checks authentication & role authorization (SUPERADMIN, ADMIN, ADMIN_SALES, ADMIN_LAPORAN)
 */

// Route access rules per role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPERADMIN: ["*"],
  ADMIN: ["*"],
  ADMIN_SALES: [
    "/admin/dashboard",
    "/admin/products",
    "/admin/categories",
    "/admin/product-types",
    "/admin/orders",
    "/admin/customers",
    "/admin/resellers",
    "/admin/vouchers",
    "/admin/reviews",
    "/admin/complaints",
  ],
  ADMIN_LAPORAN: [
    "/admin/dashboard",
    "/admin/reports",
    "/admin/orders",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect only /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Get auth token and user role from cookies or headers
  const token =
    request.cookies.get("auth_token")?.value ||
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const roleCookie = request.cookies.get("user_role")?.value?.toUpperCase();
  const userRole = roleCookie || "ADMIN"; // Default to ADMIN if token exists but role cookie is not explicit

  // 1. Unauthenticated check
  if (!token && process.env.NODE_ENV === "production") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Reject non-admin roles (e.g. CUSTOMER)
  if (userRole === "CUSTOMER") {
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // 3. Granular Role Access Check
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.ADMIN;

  if (allowedRoutes.includes("*")) {
    return NextResponse.next();
  }

  const isAllowed = allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isAllowed) {
    // Redirect to dashboard if user has partial admin role but accesses forbidden route
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    dashboardUrl.searchParams.set("error", "unauthorized_route");
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
