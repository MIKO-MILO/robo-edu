import * as React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/top-bar";
import { Toaster } from "@/components/admin/toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-body">
      <AdminSidebar userRole="SUPERADMIN" />
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
