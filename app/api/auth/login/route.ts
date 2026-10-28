import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/src/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const rememberMe = body.rememberMe === true;
    if (!email || !password) return NextResponse.json({ success: false, message: "Email dan password wajib diisi." }, { status: 400 });

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.isActive || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ success: false, message: "Email atau password salah." }, { status: 401 });
    }

    if (!user.password.startsWith("scrypt$")) {
      await db.update(users).set({ password: await hashPassword(password) }).where(eq(users.id, user.id));
    }
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const response = NextResponse.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(user.id, rememberMe), {
      ...sessionCookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Data login tidak valid." }, { status: 400 });
  }
}
