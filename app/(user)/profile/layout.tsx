import { redirect } from "next/navigation";
import { getSessionUserId } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import Sidebar from "@/components/user/profile/sidebar";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login?next=%2Fprofile");
  }

  // Pastikan user benar-benar ada di DB (cookie mungkin valid tapi user sudah dihapus)
  const [user] = await db
    .select({ id: users.id, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.isActive) {
    redirect("/login?next=%2Fprofile");
  }

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
