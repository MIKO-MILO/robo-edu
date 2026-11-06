import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/resellers
 *
 * Paginated directory of users with `membership_status = 'MEMBER'`.
 * Each row includes the core profile fields, `membership_expires_at`,
 * and the total count of `membership_purchase` rows for that user.
 *
 * Query params:
 *   search  — filter by name / email / phone (optional)
 *   sort    — name | -name | expires_at | -expires_at | created_at | -created_at
 *             (default: -created_at)
 *   page    — 1-based (default 1)
 *   limit   — rows per page, max 200 (default 20)
 *
 * Note: the route keeps the `/resellers` path per the spec even though the
 * underlying data is now the membership model ("member" = former "reseller").
 */
export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const sort   = searchParams.get("sort") || "-created_at";
    const page   = Math.max(Number.parseInt(searchParams.get("page")  || "1",  10), 1);
    const limit  = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1),
      200,
    );
    const offset = (page - 1) * limit;

    // ── Filters ──────────────────────────────────────────────────────
    const filters = [eq(users.membershipStatus, "MEMBER")];

    if (search) {
      const q = `%${search}%`;
      filters.push(
        or(like(users.name, q), like(users.email, q), like(users.phone, q))!,
      );
    }

    // ── Order ────────────────────────────────────────────────────────
    const sortCol =
      sort === "name"        ? users.name :
      sort === "-name"       ? users.name :
      sort === "expires_at"  ? users.membershipExpiresAt :
      sort === "-expires_at" ? users.membershipExpiresAt :
      sort === "created_at"  ? users.createdAt :
      /* -created_at (default) */  users.createdAt;

    const orderBy = sort.startsWith("-") ? desc(sortCol) : asc(sortCol);

    const where = and(...filters);

    // ── Count ────────────────────────────────────────────────────────
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(${users.id})` })
      .from(users)
      .where(where);

    const total      = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ── Members page ─────────────────────────────────────────────────
    const rows = await db
      .select({
        id:                   users.id,
        name:                 users.name,
        email:                users.email,
        phone:                users.phone,
        membershipStatus:     users.membershipStatus,
        membershipExpiresAt:  users.membershipExpiresAt,
        isActive:             users.isActive,
        createdAt:            users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { current_page: page, per_page: limit, total_pages: totalPages, total_count: total },
      });
    }

    // ── Purchase counts (one extra query, batched across all returned rows) ─
    const memberIds = rows.map((r) => r.id);

    const purchaseCounts = await db
      .select({
        userId: membershipPurchases.userId,
        cnt:    sql<number>`COUNT(${membershipPurchases.id})`,
      })
      .from(membershipPurchases)
      .where(inArray(membershipPurchases.userId, memberIds))
      .groupBy(membershipPurchases.userId);

    const countMap: Record<string, number> = {};
    for (const row of purchaseCounts) countMap[row.userId] = Number(row.cnt);

    // ── Response ─────────────────────────────────────────────────────
    const data = rows.map((u) => ({
      id:                    u.id,
      name:                  u.name,
      email:                 u.email,
      phone:                 u.phone ?? null,
      membership_status:     u.membershipStatus,
      membership_expires_at: u.membershipExpiresAt?.toISOString() ?? null,
      is_active:             !!u.isActive,
      purchase_count:        countMap[u.id] ?? 0,
      created_at:            u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        current_page:  page,
        per_page:      limit,
        total_pages:   totalPages,
        total_count:   total,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/resellers error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar member." },
      { status: 500 },
    );
  }
}
