import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { emailLogs, orders, users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/email-log
 *
 * Paginated view of the `email_logs` table. Provides visibility into
 * transactional emails sent by the application (order confirmations,
 * password resets, membership notifications, etc.).
 *
 * Query params:
 *   status     — PENDING | SENT | FAILED (optional)
 *   type       — email type string, e.g. `order_confirmation` (optional)
 *   user_id    — filter by recipient user UUID (optional)
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

    const statusFilter = searchParams.get("status")?.trim().toUpperCase() || "";
    const typeFilter   = searchParams.get("type")?.trim()    || "";
    const userIdFilter = searchParams.get("user_id")?.trim() || "";
    const dateFrom     = searchParams.get("date_from")?.trim() || "";
    const dateTo       = searchParams.get("date_to")?.trim()   || "";
    const sort         = searchParams.get("sort") || "-created_at";
    const page  = Math.max(Number.parseInt(searchParams.get("page")  || "1",  10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1),
      200,
    );
    const offset = (page - 1) * limit;

    // ── Filters ──────────────────────────────────────────────────────────
    const filters: ReturnType<typeof eq>[] = [];

    const VALID_STATUSES = new Set(["PENDING", "SENT", "FAILED"]);
    if (statusFilter && VALID_STATUSES.has(statusFilter)) {
      filters.push(eq(emailLogs.status, statusFilter));
    }
    if (typeFilter)   filters.push(eq(emailLogs.type,   typeFilter));
    if (userIdFilter) filters.push(eq(emailLogs.userId, userIdFilter));
    if (dateFrom) {
      const d = new Date(dateFrom);
      if (!Number.isNaN(d.getTime())) filters.push(gte(emailLogs.createdAt, d));
    }
    if (dateTo) {
      const d = new Date(dateTo);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        filters.push(lte(emailLogs.createdAt, d));
      }
    }

    const where = filters.length > 0 ? and(...filters) : undefined;
    const orderBy = sort === "created_at"
      ? asc(emailLogs.createdAt)
      : desc(emailLogs.createdAt);

    // ── Count ─────────────────────────────────────────────────────────────
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(${emailLogs.id})` })
      .from(emailLogs)
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

    // ── Rows with optional user + order context ───────────────────────────
    const rows = await db
      .select({
        id:          emailLogs.id,
        userId:      emailLogs.userId,
        userName:    users.name,
        orderId:     emailLogs.orderId,
        orderNumber: orders.orderNumber,
        email:       emailLogs.email,
        type:        emailLogs.type,
        subject:     emailLogs.subject,
        status:      emailLogs.status,
        sentAt:      emailLogs.sentAt,
        createdAt:   emailLogs.createdAt,
      })
      .from(emailLogs)
      .leftJoin(users,   eq(emailLogs.userId,  users.id))
      .leftJoin(orders,  eq(emailLogs.orderId, orders.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id:           r.id,
      user_id:      r.userId      ?? null,
      user_name:    r.userName    ?? null,
      order_id:     r.orderId     ?? null,
      order_number: r.orderNumber ?? null,
      email:        r.email,
      type:         r.type,
      subject:      r.subject,
      status:       r.status,
      sent_at:      r.sentAt?.toISOString()   ?? null,
      created_at:   r.createdAt.toISOString(),
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
    console.error("GET /api/admin/email-log error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat email log." },
      { status: 500 },
    );
  }
}
