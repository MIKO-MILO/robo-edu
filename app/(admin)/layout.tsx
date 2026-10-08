import * as React from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/top-bar";
import { Toaster } from "@/components/admin/toast";

/**
 * Utility untuk mengecek apakah role user termasuk role admin.
 * Role valid: "superadmin" | "admin_sales" | "admin_laporan" | "admin"
 */
function isAdminRole(role: string): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase();
  return (
    normalized === "superadmin" ||
    normalized === "admin_sales" ||
    normalized === "admin_laporan" ||
    normalized === "admin"
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if current route is /admin/login
  const headerList = await headers();
  const currentPath = headerList.get("x-pathname") || "";

  if (currentPath === "/admin/login") {
    return <>{children}</>;
  }

  // 1. Ambil cookie session di Server Component + verify signature
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionToken);

  // Jika tidak ada cookie sesi / signature tidak valid, redirect ke halaman admin login
  if (!session?.userId) {
    redirect("/admin/login");
  }

  // 2. Ambil data user langsung dari database (hindari fetch loopback ke /api/auth/me di server side)
  let user: { name: string; email: string; role: string } | null = null;

  try {
    const [currentUser] = await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (currentUser && currentUser.isActive) {
      user = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      };
    }
  } catch {
    user = null;
  }

  // 3. Cek otorisasi role: jika bukan admin (misal customer), redirect ke /admin/login
  if (!user || !isAdminRole(user.role)) {
    redirect("/admin/login");
  }

  const uppercaseRole = user.role.toUpperCase();
  const adminUserData = {
    name: user.name,
    email: user.email,
    role: uppercaseRole,
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      {/* Visual Admin Shell dengan prop role & data user - Fixed/Sticky sidebar */}
      <div className="sticky top-0 h-screen shrink-0 z-40">
        <AdminSidebar userRole={uppercaseRole} user={adminUserData} />
      </div>
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <AdminTopBar user={adminUserData} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-full min-h-0">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
