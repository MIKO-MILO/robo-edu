import { NextRequest, NextResponse } from "next/server";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/resellers/[id]
 *
 * Full profile of a single member, plus all their `membership_purchase` rows.
 * Returns 404 if the user does not exist or is not a MEMBER.
 *
 * Note: the route keeps the `/resellers` path per the spec.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // ── Fetch member ──────────────────────────────────────────────────────
  const [user] = await db
    .select({
      id:                   users.id,
      name:                 users.name,
      email:                users.email,
      phone:                users.phone,
      gender:               users.gender,
      taxIdentificationNumber:  users.taxIdentificationNumber,
      taxIdentificationCountry: users.taxIdentificationCountry,
      residentialAddress:   users.residentialAddress,
      avatarKey:            users.avatarKey,
      role:                 users.role,
      membershipStatus:     users.membershipStatus,
      membershipExpiresAt:  users.membershipExpiresAt,
      isActive:             users.isActive,
      emailVerifiedAt:      users.emailVerifiedAt,
      lastLoginAt:          users.lastLoginAt,
      createdAt:            users.createdAt,
      updatedAt:            users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  // 404 if not found or not a MEMBER
  if (!user || user.membershipStatus !== "MEMBER") {
    return NextResponse.json(
      { success: false, message: "Member tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Fetch all membership purchases ────────────────────────────────────
  const purchases = await db
    .select({
      id:                      membershipPurchases.id,
      purchaseNumber:          membershipPurchases.purchaseNumber,
      paymentId:               membershipPurchases.paymentId,
      priceSnapshot:           membershipPurchases.priceSnapshot,
      durationMonthsSnapshot:  membershipPurchases.durationMonthsSnapshot,
      planNameSnapshot:        membershipPurchases.planNameSnapshot,
      startsAt:                membershipPurchases.startsAt,
      endsAt:                  membershipPurchases.endsAt,
      paidAt:                  membershipPurchases.paidAt,
      status:                  membershipPurchases.status,
      createdAt:               membershipPurchases.createdAt,
    })
    .from(membershipPurchases)
    .where(eq(membershipPurchases.userId, id))
    .orderBy(desc(membershipPurchases.createdAt));

  // ── Response ──────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    data: {
      id:                    user.id,
      name:                  user.name,
      email:                 user.email,
      phone:                 user.phone ?? null,
      gender:                user.gender ?? null,
      tax_id:                user.taxIdentificationNumber ?? null,
      tax_country:           user.taxIdentificationCountry ?? null,
      residential_address:   user.residentialAddress ?? null,
      avatar_url:            user.avatarKey ? `/api/profile/avatar?id=${user.id}` : null,
      role:                  user.role,
      membership_status:     user.membershipStatus,
      membership_expires_at: user.membershipExpiresAt?.toISOString() ?? null,
      is_active:             !!user.isActive,
      email_verified_at:     user.emailVerifiedAt?.toISOString() ?? null,
      last_login_at:         user.lastLoginAt?.toISOString() ?? null,
      created_at:            user.createdAt.toISOString(),
      updated_at:            user.updatedAt.toISOString(),
      membership_purchases: purchases.map((p) => ({
        id:                       p.id,
        purchase_number:          p.purchaseNumber,
        payment_id:               p.paymentId ?? null,
        price_snapshot:           Number(p.priceSnapshot),
        duration_months_snapshot: p.durationMonthsSnapshot,
        plan_name_snapshot:       p.planNameSnapshot,
        starts_at:                p.startsAt?.toISOString() ?? null,
        ends_at:                  p.endsAt?.toISOString() ?? null,
        paid_at:                  p.paidAt?.toISOString() ?? null,
        status:                   p.status,
        created_at:               p.createdAt.toISOString(),
      })),
    },
  });
}
