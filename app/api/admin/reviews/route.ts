import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { reviews, users, products, orderItems } from "@/src/db/schema";
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { ReviewStatus } from "@/types/enums";

export const runtime = "nodejs";

function isAdminRole(role: string) {
  const r = role?.toLowerCase() ?? "";
  return ["admin", "superadmin", "admin_sales", "admin_laporan"].includes(r);
}

/**
 * GET /api/admin/reviews
 *
 * Query params:
 *   page      = 1-based (default 1)
 *   limit     = max 100 (default 20)
 *   q         = search: product name | user name | comment
 *   status    = PUBLISHED | HIDDEN | ALL (default ALL)
 *   rating    = 1-5 | ALL (default ALL)
 *   sort      = created_at_desc | created_at_asc | rating_desc | rating_asc
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    const uid = await getSessionUserId();
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const q      = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const rating = searchParams.get("rating") ?? "ALL";
  const sort   = searchParams.get("sort") ?? "created_at_desc";
  const offset = (page - 1) * limit;

  // ── Build filters ──────────────────────────────────────────────────────
  const filters: ReturnType<typeof eq>[] = [];

  if (status !== "ALL") filters.push(eq(reviews.status, status as ReviewStatus));
  if (rating !== "ALL") filters.push(eq(reviews.rating, Number(rating)));

  // Search: find matching reviewIds first
  if (q) {
    const ql = `%${q}%`;
    const byProduct = await db
      .select({ id: reviews.id })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .where(like(products.name, ql));

    const byUser = await db
      .select({ id: reviews.id })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(or(like(users.name, ql), like(users.email, ql)));

    const byComment = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(like(reviews.comment, ql));

    const matchIds = [
      ...new Set([
        ...byProduct.map(r => r.id),
        ...byUser.map(r => r.id),
        ...byComment.map(r => r.id),
      ]),
    ];

    if (matchIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      });
    }
    filters.push(inArray(reviews.id, matchIds));
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  // ── Count ──────────────────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(reviews)
    .where(where);

  const totalCount = Number(total);
  if (totalCount === 0) {
    return NextResponse.json({
      success: true, data: [],
      meta: { page, limit, total: 0, totalPages: 0 },
    });
  }

  // ── Sort ───────────────────────────────────────────────────────────────
  const orderByClause =
    sort === "created_at_asc" ? asc(reviews.createdAt)  :
    sort === "rating_desc"    ? desc(reviews.rating)     :
    sort === "rating_asc"     ? asc(reviews.rating)      :
    /* default */               desc(reviews.createdAt);

  // ── Fetch rows ─────────────────────────────────────────────────────────
  const rows = await db
    .select({
      id:            reviews.id,
      orderItemId:   reviews.orderItemId,
      productId:     reviews.productId,
      userId:        reviews.userId,
      rating:        reviews.rating,
      comment:       reviews.comment,
      status:        reviews.status,
      createdAt:     reviews.createdAt,
      productName:   products.name,
      userName:      users.name,
      userEmail:     users.email,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(where)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  const data = rows.map(r => ({
    id:            r.id,
    order_item_id: r.orderItemId,
    product_id:    r.productId,
    user_id:       r.userId,
    rating:        r.rating,
    comment:       r.comment ?? null,
    status:        r.status as ReviewStatus,
    created_at:    r.createdAt.toISOString(),
    product_name:  r.productName,
    user_name:     r.userName,
    user_email:    r.userEmail,
  }));

  return NextResponse.json({
    success: true,
    data,
    meta: {
      page, limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}
