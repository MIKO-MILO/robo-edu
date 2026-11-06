import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import type { User } from "@/types";

export const runtime = "nodejs";

type UserDbRow = typeof users.$inferSelect;

function dbUserToResponse(user: UserDbRow): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    gender: (user.gender as User["gender"]) ?? null,
    tax_id: user.taxIdentificationNumber ?? null,
    tax_country: user.taxIdentificationCountry ?? null,
    avatar_url: user.avatarKey ? `/api/profile/avatar?id=${user.id}` : null,
    role: user.role as User["role"],
    membership_status: (user.membershipStatus as User["membership_status"]) ?? "NOT_MEMBER",
    membership_expires_at: user.membershipExpiresAt
      ? new Date(user.membershipExpiresAt).toISOString()
      : null,
    is_active: !!user.isActive,
    last_login_at: user.lastLoginAt
      ? new Date(user.lastLoginAt).toISOString()
      : null,
    created_at: new Date(user.createdAt).toISOString(),
    updated_at: new Date(user.updatedAt).toISOString(),
  };
}

export async function GET(
  _request: Request,
  segment: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await segment.params;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: dbUserToResponse(user),
    });
  } catch (error) {
    console.error("GET /api/admin/users/:id error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat detail pengguna.",
      },
      { status: 500 },
    );
  }
}
