import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, isActive: users.isActive }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isActive) return NextResponse.json({ success: false, message: "Sesi tidak valid." }, { status: 401 });
  return NextResponse.json({ success: true, data: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
}
