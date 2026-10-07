import * as React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/top-bar";
import { Toaster } from "@/components/admin/toast";

/**
 * Role yang dianggap admin.
 */
function isAdminRole(role: string): boolean {
  const r = role?.toLowerCase();
  return r === "admin" || r === "superadmin" || r === "admin_sales" || r === "admin_laporan";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts meng-inject header x-pathname pada setiap request.
  // Halaman login tidak perlu auth check.
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Verifikasi session HMAC secara langsung — tidak ada HTTP round-trip.
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/admin/login");
  }

  // Ambil data user dari DB dan validasi role.
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.isActive || !isAdminRole(user.role)) {
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
