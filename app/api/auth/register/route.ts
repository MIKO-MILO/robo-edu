import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";
import { sendEmail } from "@/src/lib/email/send";
import { welcomeEmailSubject, welcomeEmailHtml } from "@/src/lib/email/templates/welcome";
import { getAppUrl } from "@/src/lib/email/resend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length > 150 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || phone.length > 30) {
      return NextResponse.json({ success: false, message: "Data pendaftaran tidak valid. Password minimal 8 karakter." }, { status: 400 });
    }

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) return NextResponse.json({ success: false, message: "Email sudah terdaftar." }, { status: 409 });

    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      name,
      email,
      password: await hashPassword(password),
      phone: phone || null,
    });

    // Send welcome email — fire-and-forget (never blocks the response)
    void sendEmail({
      to: email,
      subject: welcomeEmailSubject(),
      html: welcomeEmailHtml({ name, appUrl: getAppUrl() }),
      type: "OTHER",
      userId: id,
    });

    return NextResponse.json({ success: true, data: { id, name, email } }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ success: false, message: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat akun." }, { status: 500 });
  }
}
