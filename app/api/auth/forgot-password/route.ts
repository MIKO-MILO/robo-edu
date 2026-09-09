import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { sendEmail } from "@/src/lib/email/send";
import { passwordResetEmailSubject, passwordResetEmailHtml } from "@/src/lib/email/templates/password-reset";
import { getAppUrl } from "@/src/lib/email/resend";

export const runtime = "nodejs";

/** Token expires in 60 minutes. */
const EXPIRES_IN_MINUTES = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Masukkan alamat email yang valid." }, { status: 400 });
    }

    // Always respond with success to prevent email enumeration attacks.
    // The actual work only happens when the account exists.
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, isActive: users.isActive })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user?.isActive) {
      // Generate a cryptographically random token, store a SHA-256 hash of it.
      // The raw token goes in the email link; only the hash lives in the DB.
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + EXPIRES_IN_MINUTES * 60 * 1000);

      await db
        .update(users)
        .set({ passwordResetToken: hashedToken, passwordResetExpiresAt: expiresAt })
        .where(eq(users.id, user.id));

      const resetUrl = `${getAppUrl()}/reset-password?token=${rawToken}`;

      void sendEmail({
        to: user.email,
        subject: passwordResetEmailSubject(),
        html: passwordResetEmailHtml({ name: user.name, resetUrl, expiresInMinutes: EXPIRES_IN_MINUTES }),
        type: "OTHER",
        userId: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, kamu akan menerima link reset password dalam beberapa menit.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan. Silakan coba lagi." }, { status: 500 });
  }
}
