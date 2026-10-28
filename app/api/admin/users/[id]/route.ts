import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { User } from "@/types";

export const runtime = "nodejs";

const ADMIN_ROLES = new Set([
  "superadmin",
  "admin_sales",
  "admin_laporan",
  "admin_gudang",
  "admin",
]);

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
    reseller_status: user.resellerStatus as User["reseller_status"],
    reseller_approved_at: user.resellerApprovedAt
      ? new Date(user.resellerApprovedAt).toISOString()
      : null,
    is_active: !!user.isActive,
    last_login_at: user.lastLoginAt
      ? new Date(user.lastLoginAt).toISOString()
      : null,
    created_at: new Date(user.createdAt).toISOString(),
    updated_at: new Date(user.updatedAt).toISOString(),
  };
}

async function assertAdminOr403(): Promise<NextResponse | null> {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }
  const [currentUser] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!currentUser || !currentUser.isActive) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }
  if (!ADMIN_ROLES.has(currentUser.role.toLowerCase())) {
    return NextResponse.json(
      {
        success: false,
        message: "Anda tidak memiliki izin akses admin.",
      },
      { status: 403 },
    );
  }
  return null;
}

export async function GET(
  _request: Request,
  segment: { params: Promise<{ id: string }> },
) {
  try {
    const forbidden = await assertAdminOr403();
    if (forbidden) return forbidden;

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
