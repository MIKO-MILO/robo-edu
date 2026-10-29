import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { User, MembershipStatus } from "@/types";

export const runtime = "nodejs";

const ADMIN_ROLES = new Set([
  "superadmin",
  "admin_sales",
  "admin_laporan",
  "admin_gudang",
  "admin",
]);

const VALID_MEMBERSHIP_STATUS = new Set<MembershipStatus>([
  "NOT_MEMBER",
  "MEMBER",
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

/**
 * PATCH /api/admin/users/:id/reseller-status
 *
 * Endpoint ini dipertahankan untuk kompatibilitas dengan kode frontend
 * yang belum dimigrasikan. Secara internal ia sekarang mengupdate
 * `membership_status` (NOT_MEMBER | MEMBER) di tabel `users`.
 *
 * Body: { membership_status: "NOT_MEMBER" | "MEMBER" }
 *
 * @deprecated Gunakan PATCH /api/admin/users/:id/membership-status untuk
 * kode baru. Endpoint ini akan dihapus setelah migrasi frontend selesai.
 */
export async function PATCH(
  request: Request,
  segment: { params: Promise<{ id: string }> },
) {
  try {
    const forbidden = await assertAdminOr403();
    if (forbidden) return forbidden;

    const { id } = await segment.params;
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    }

    const body = await request.json();
    // Accept both old field name (reseller_status) and new (membership_status)
    // for backward compatibility during transition.
    const raw = body?.membership_status ?? body?.reseller_status;
    // Map legacy reseller values to new membership values
    let membershipStatus: MembershipStatus | undefined;
    if (raw === "APPROVED") membershipStatus = "MEMBER";
    else if (raw === "NOT_RESELLER" || raw === "PENDING" || raw === "REJECTED") membershipStatus = "NOT_MEMBER";
    else if (raw === "NOT_MEMBER" || raw === "MEMBER") membershipStatus = raw as MembershipStatus;

    if (!membershipStatus || !VALID_MEMBERSHIP_STATUS.has(membershipStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request tidak valid: field `membership_status` (NOT_MEMBER | MEMBER) diperlukan.",
        },
        { status: 400 },
      );
    }

    await db
      .update(users)
      .set({ membershipStatus })
      .where(eq(users.id, id));

    const [finalRow] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: finalRow ? dbUserToResponse(finalRow) : dbUserToResponse(existing),
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/:id/reseller-status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status membership.",
      },
      { status: 500 },
    );
  }
}
