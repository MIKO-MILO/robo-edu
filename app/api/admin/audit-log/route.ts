import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { auditLogs, users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/audit-log
 *
 * Paginated view of the `audit_logs` table with actor info.
 *
 * Query params:
 *   action     — exact action string filter, e.g. `order.status_updated`
 *   actor_id   — filter by the admin user UUID who performed the action
 *   date_from  — ISO date, inclusive lower bound on created_at
 *   date_to    — ISO date, inclusive upper bound on created_at
 *   sort       — created_at | -created_at (default: -created_at)
 *   page       — 1-based page number (default 1)
 *   limit      — rows per page, max 200 (default 20)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);

    const actionFilter  = searchParams.get("action")?.trim()    || "";
    const actorIdFilter = searchParams.get("actor_id")?.trim()  || "";
    const dateFrom      = searchParams.get("date_from")?.trim() || "";
    const dateTo        = searchParams.get("date_to")?.trim()   || "";
    const sort          = searchParams.get("sort") || "-created_at";
    const page  = Math.max(Number.parseInt(searchParams.get("page")  || "1",  10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1),
      200,
    );
    const offset = (page - 1) * limit;

    // ── Filters ──────────────────────────────────────────────────────────
    const filters: ReturnType<typeof eq>[] = [];

    if (actionFilter)  filters.push(eq(auditLogs.action,  actionFilter));
    if (actorIdFilter) filters.push(eq(auditLogs.actorId, actorIdFilter));
    if (dateFrom) {
      const d = new Date(dateFrom);
      if (!Number.isNaN(d.getTime())) filters.push(gte(auditLogs.createdAt, d));
    }
    if (dateTo) {
      const d = new Date(dateTo);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        filters.push(lte(auditLogs.createdAt, d));
      }
    }

    const where = filters.length > 0 ? and(...filters) : undefined;
    const orderBy = sort === "created_at"
      ? asc(auditLogs.createdAt)
      : desc(auditLogs.createdAt);

    // ── Count ─────────────────────────────────────────────────────────────
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(${auditLogs.id})` })
      .from(auditLogs)
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

    // ── Rows + actor name ─────────────────────────────────────────────────
    const rows = await db
      .select({
        id:          auditLogs.id,
        actorId:     auditLogs.actorId,
        actorName:   users.name,
        action:      auditLogs.action,
        targetType:  auditLogs.targetType,
        targetId:    auditLogs.targetId,
        description: auditLogs.description,
        metadata:    auditLogs.metadata,
        createdAt:   auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id:          r.id,
      actor_id:    r.actorId ?? null,
      actor_name:  r.actorName ?? null,
      action:      r.action,
      target_type: r.targetType ?? null,
      target_id:   r.targetId  ?? null,
      description: r.description ?? null,
      metadata:    r.metadata   ?? null,
      created_at:  r.createdAt.toISOString(),
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
    console.error("GET /api/admin/audit-log error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat audit log." },
      { status: 500 },
    );
  }
}
