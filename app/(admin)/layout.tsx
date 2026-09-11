import * as React from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/lib/api";
import { getSession } from "@/lib/auth/session";
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

  // 1. Ambil cookie session di Server Component
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("roboedu_session")?.value ||
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("token")?.value;

  // Jika tidak ada cookie sesi, redirect langsung ke halaman admin login
  if (!sessionToken) {
    redirect("/admin/login");
  }

  // Forward semua cookie dari Server Component ke HTTP client
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let user: { name: string; email: string; role: string } | null = null;

  // 2. Panggil API getMe() untuk mendapatkan data autentikasi user
  try {
    const response = await authService.getMe({
      headers: {
        cookie: cookieHeader,
      },
      skipAuthRedirect: true,
    });

    if (response?.success && response.data) {
      user = response.data;
    }
  } catch (error) {
    // Fallback: Jika backend getMe() belum ready, coba decode mock session
    const mockSession = await getSession();
    if (mockSession && isAdminRole(mockSession.role)) {
      user = {
        name: mockSession.name || "Admin RoboEdu",
        email: mockSession.email || "admin@roboedu.id",
        role: mockSession.role,
      };
    } else {
      redirect("/admin/login");
    }
  }

  // 4. Cek otorisasi role: jika bukan admin (misal customer), redirect ke /admin/login
  if (!user || !isAdminRole(user.role)) {
    redirect("/admin/login");
  }

  const uppercaseRole = user.role.toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      {/* Visual Admin Shell dengan prop role & data user */}
      <AdminSidebar userRole={uppercaseRole} />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopBar
          user={{
            name: user.name,
            email: user.email,
            role: uppercaseRole,
          }}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
