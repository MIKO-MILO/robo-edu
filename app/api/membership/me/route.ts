import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments, users } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { MembershipStatusData, MembershipPurchase } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/membership/me
 *
 * Returns the authenticated user's membership status and full purchase history.
 *
 * Response shape (wrapped in ApiResponse):
 * {
 *   success: true,
 *   data: {
 *     membership_status: "NOT_MEMBER" | "MEMBER",
 *     membership_expires_at: ISODateString | null,
 *     days_remaining: number | null,   // null when NOT_MEMBER or expires_at is null
 *     purchases: MembershipPurchase[]  // newest first
 *   }
 * }
 *
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  // ── 1. Fetch user's membership columns ────────────────────────────────
  const [user] = await db
    .select({
      membershipStatus: users.membershipStatus,
      membershipExpiresAt: users.membershipExpiresAt,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.isActive) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid." },
      { status: 401 },
    );
  }

  // ── 2. Fetch purchase history with payment method ─────────────────────
  const rows = await db
    .select({
      id: membershipPurchases.id,
      purchaseNumber: membershipPurchases.purchaseNumber,
      planNameSnapshot: membershipPurchases.planNameSnapshot,
      priceSnapshot: membershipPurchases.priceSnapshot,
      durationMonthsSnapshot: membershipPurchases.durationMonthsSnapshot,
      status: membershipPurchases.status,
      startsAt: membershipPurchases.startsAt,
      endsAt: membershipPurchases.endsAt,
      paidAt: membershipPurchases.paidAt,
      createdAt: membershipPurchases.createdAt,
      // payment_method comes from the linked payment row (nullable join)
      paymentMethod: payments.paymentType,
    })
    .from(membershipPurchases)
    .leftJoin(payments, eq(payments.id, membershipPurchases.paymentId))
    .where(eq(membershipPurchases.userId, userId))
    .orderBy(desc(membershipPurchases.createdAt));

  const purchases: MembershipPurchase[] = rows.map((r) => ({
    id: r.id,
    purchase_number: r.purchaseNumber,
    plan_name_snapshot: r.planNameSnapshot,
    price_snapshot: Number(r.priceSnapshot),
    duration_months_snapshot: r.durationMonthsSnapshot,
    status: r.status as MembershipPurchase["status"],
    starts_at: r.startsAt ? new Date(r.startsAt).toISOString() : null,
    ends_at: r.endsAt ? new Date(r.endsAt).toISOString() : null,
    paid_at: r.paidAt ? new Date(r.paidAt).toISOString() : null,
    payment_method: r.paymentMethod ?? null,
    created_at: new Date(r.createdAt).toISOString(),
  }));

  // ── 3. Compute days_remaining ─────────────────────────────────────────
  const membershipExpiresAt = user.membershipExpiresAt
    ? new Date(user.membershipExpiresAt)
    : null;

  let daysRemaining: number | null = null;
  if (user.membershipStatus === "MEMBER" && membershipExpiresAt) {
    const msLeft = membershipExpiresAt.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }

  const data: MembershipStatusData & { days_remaining: number | null } = {
    membership_status: user.membershipStatus as MembershipStatusData["membership_status"],
    membership_expires_at: membershipExpiresAt
      ? membershipExpiresAt.toISOString()
      : null,
    days_remaining: daysRemaining,
    purchases,
  };

  return NextResponse.json({ success: true, data });
}
