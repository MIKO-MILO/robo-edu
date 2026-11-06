import { NextRequest, NextResponse } from "next/server";
import { and, asc, between, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  complaints,
  complaintAttachments,
  orderItems,
  users,
} from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/complaints
 *
 * Paginated list of all warranty complaints. Filterable by status and date
 * range so admins can triage incoming and in-progress claims.
 *
 * Query params:
 *   status      — open | in_review | resolved | closed (optional, omit = all)
 *   date_from   — ISO date string, inclusive lower bound on created_at (optional)
 *   date_to     — ISO date string, inclusive upper bound on created_at (optional)
 *   search      — filter by customer name/email or complaint subject (optional)
 *   sort        — created_at | -created_at | updated_at | -updated_at
 *                 (default: -created_at)
 *   page        — 1-based page number (default 1)
 *   limit       — rows per page, max 100 (default 20)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get("status")?.trim() || "";
    const dateFrom     = searchParams.get("date_from")?.trim() || "";
    const dateTo       = searchParams.get("date_to")?.trim()   || "";
    const search       = searchParams.get("search")?.trim()    || "";
    const sort         = searchParams.get("sort") || "-created_at";
    const page  = Math.max(Number.parseInt(searchParams.get("page")  || "1",  10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    // ── Filters ──────────────────────────────────────────────────────────
    const filters: ReturnType<typeof eq>[] = [];

    const VALID_STATUSES = new Set(["open", "in_review", "resolved", "closed"]);
    if (statusFilter && VALID_STATUSES.has(statusFilter)) {
      filters.push(eq(complaints.status, statusFilter));
    }
    if (dateFrom) {
      const d = new Date(dateFrom);
      if (!Number.isNaN(d.getTime())) filters.push(gte(complaints.createdAt, d));
    }
    if (dateTo) {
      const d = new Date(dateTo);
      if (!Number.isNaN(d.getTime())) {
        // inclusive upper bound: extend to end of day
        d.setHours(23, 59, 59, 999);
        filters.push(lte(complaints.createdAt, d));
      }
    }

    // ── Sorting ───────────────────────────────────────────────────────────
    const sortCol =
      sort === "updated_at"  ? complaints.updatedAt :
      sort === "-updated_at" ? complaints.updatedAt :
      /* created_at (default) */  complaints.createdAt;
    const orderBy = sort.startsWith("-") ? desc(sortCol) : asc(sortCol);

    const where = filters.length > 0 ? and(...filters) : undefined;

    // ── Count ─────────────────────────────────────────────────────────────
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(${complaints.id})` })
      .from(complaints)
      .where(where);

    const total      = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (total === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { current_page: page, per_page: limit, total_pages: 1, total_count: 0 },
      });
    }

    // ── Main query (with customer + order_item info) ───────────────────────
    // We need customer name/email for display, so JOIN users.
    const rows = await db
      .select({
        id:            complaints.id,
        orderItemId:   complaints.orderItemId,
        subject:       complaints.subject,
        status:        complaints.status,
        resolution:    complaints.resolution,
        resolvedAt:    complaints.resolvedAt,
        createdAt:     complaints.createdAt,
        updatedAt:     complaints.updatedAt,
        // customer
        customerId:    users.id,
        customerName:  users.name,
        customerEmail: users.email,
        // order item snapshot
        productName:   orderItems.productNameSnapshot,
        variantName:   orderItems.variantNameSnapshot,
      })
      .from(complaints)
      .innerJoin(users,       eq(complaints.userId,       users.id))
      .innerJoin(orderItems,  eq(complaints.orderItemId,  orderItems.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Apply text search post-join (simpler than a sub-select; N is bounded by limit)
    const searchLower = search.toLowerCase();
    const filtered = search
      ? rows.filter(
          (r) =>
            r.customerName.toLowerCase().includes(searchLower) ||
            r.customerEmail.toLowerCase().includes(searchLower) ||
            r.subject.toLowerCase().includes(searchLower),
        )
      : rows;

    const data = filtered.map((r) => ({
      id:           r.id,
      order_item_id: r.orderItemId,
      subject:      r.subject,
      status:       r.status,
      resolution:   r.resolution ?? null,
      resolved_at:  r.resolvedAt?.toISOString() ?? null,
      created_at:   r.createdAt.toISOString(),
      updated_at:   r.updatedAt.toISOString(),
      customer: {
        id:    r.customerId,
        name:  r.customerName,
        email: r.customerEmail,
      },
      order_item: {
        id:           r.orderItemId,
        product_name: r.productName,
        variant_name: r.variantName ?? null,
      },
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
    console.error("GET /api/admin/complaints error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar pengaduan." },
      { status: 500 },
    );
  }
}
