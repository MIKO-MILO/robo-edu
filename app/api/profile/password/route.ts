import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * PATCH /api/profile/password
 * Ganti password user yang sedang login.
 * Body: { currentPassword, newPassword }
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword     = typeof body.newPassword     === "string" ? body.newPassword     : "";

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: "Password saat ini wajib diisi." },
        { status: 400 },
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password baru minimal 8 karakter." },
        { status: 400 },
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: "Password baru tidak boleh sama dengan password saat ini." },
        { status: 400 },
      );
    }

    const [user] = await db
      .select({ id: users.id, password: users.password, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.isActive) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 },
      );
    }

    // Verifikasi password lama
    const isCorrect = await verifyPassword(currentPassword, user.password);
    if (!isCorrect) {
      return NextResponse.json(
        { success: false, message: "Password saat ini tidak sesuai." },
        { status: 400 },
      );
    }

    // Simpan password baru
    await db
      .update(users)
      .set({ password: await hashPassword(newPassword), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PATCH /api/profile/password error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
