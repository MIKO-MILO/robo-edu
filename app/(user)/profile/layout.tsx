"use client";

import Sidebar from "@/components/user/profile/sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex flex-col gap-6 shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </main>
  );
}
