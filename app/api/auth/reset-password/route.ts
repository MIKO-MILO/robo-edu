import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ success: false, message: "Token reset tidak valid." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password baru minimal 8 karakter." }, { status: 400 });
    }

    // Hash the incoming raw token and compare against what's stored in the DB.
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, hashedToken),
          gt(users.passwordResetExpiresAt, now),
        ),
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Link reset password tidak valid atau sudah kedaluwarsa." },
        { status: 400 },
      );
    }

    // Update password and clear the reset token in one statement.
    await db
      .update(users)
      .set({
        password: await hashPassword(password),
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, message: "Password berhasil diperbarui. Silakan login." });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan. Silakan coba lagi." }, { status: 500 });
  }
}
