import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { writeAuditLog } from "@/src/lib/audit/write-audit-log";
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

/**
 * PATCH /api/admin/users/[id]/status
 * Body: { is_active: boolean }
 */
export async function PATCH(
  request: NextRequest,
  segment: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminFromRequest(request);
    if (!auth.ok) return auth.response;

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
    const is_active = body?.is_active;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Request tidak valid: field `is_active` (boolean) diperlukan.",
        },
        { status: 400 },
      );
    }

    await db.update(users).set({ isActive: is_active }).where(eq(users.id, id));

    // ── Audit log ──────────────────────────────────────────────────────────
    await writeAuditLog({
      actorId:    auth.userId,
      action:     "user.status_updated",
      targetType: "user",
      targetId:   id,
      description: `Status akun pengguna ${existing.email} diubah menjadi ${is_active ? "aktif" : "nonaktif"}.`,
      metadata:   {
        user_id:       id,
        email:         existing.email,
        from_is_active: existing.isActive,
        to_is_active:   is_active,
      },
    });

    const [updated] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: updated ? dbUserToResponse(updated) : dbUserToResponse(existing),
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/:id/status error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status pengguna." },
      { status: 500 },
    );
  }
}
