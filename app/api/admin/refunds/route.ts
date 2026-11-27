import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, refunds, users } from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";

export const runtime = "nodejs";

/**
 * GET /api/admin/refunds
 *
 * Paginated list of all refund records across all orders.
 * Each record includes: refund ID, order number, customer name, amount,
 * method (MANUAL/MIDTRANS_API), status, and date.
 *
 * Query params:
 *   status     — PENDING | SUCCESS | FAILED (optional, omit = all)
 *   date_from  — ISO date string, inclusive lower bound on created_at (optional)
 *   date_to    — ISO date string, inclusive upper bound on created_at (optional)
 *   sort       — created_at | -created_at (default: -created_at)
 *   page       — 1-based page number (default 1)
 *   limit      — rows per page, max 100 (default 20)
 *
 * Only accessible to admins.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);

    const statusFilter = searchParams.get("status")?.trim().toUpperCase() || "";
    const dateFrom = searchParams.get("date_from")?.trim() || "";
    const dateTo = searchParams.get("date_to")?.trim() || "";
    const sort = searchParams.get("sort") || "-created_at";
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1),
      100,
    );
    const offset = (page - 1) * limit;

    // ── Filters ──────────────────────────────────────────────────────────
    const filters: ReturnType<typeof eq>[] = [];

    const VALID_STATUSES = new Set(["PENDING", "SUCCESS", "FAILED"]);
    if (statusFilter && VALID_STATUSES.has(statusFilter)) {
      filters.push(eq(refunds.status, statusFilter));
    }

    if (dateFrom) {
      const d = new Date(dateFrom);
      if (!Number.isNaN(d.getTime())) filters.push(gte(refunds.createdAt, d));
    }

    if (dateTo) {
      const d = new Date(dateTo);
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999);
        filters.push(lte(refunds.createdAt, d));
      }
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // ── Sort ─────────────────────────────────────────────────────────────
    const orderBy = sort === "created_at" ? asc(refunds.createdAt) : desc(refunds.createdAt);

    // ── Count ─────────────────────────────────────────────────────────────
    const [countRow] = await db
      .select({ count: sql<number>`COUNT(${refunds.id})` })
      .from(refunds)
      .where(whereClause);

    const total = Number(countRow?.count ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (total === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          current_page: page,
          per_page: limit,
          total_pages: 1,
          total_count: 0,
          has_next_page: false,
          has_prev_page: false,
        },
      });
    }

    // ── Main query ────────────────────────────────────────────────────────
    // LEFT JOIN orders and users — orderId can be null for membership refunds
    const rows = await db
      .select({
        id: refunds.id,
        orderId: refunds.orderId,
        amount: refunds.amount,
        reason: refunds.reason,
        method: refunds.method,
        proofUrl: refunds.proofUrl,
        status: refunds.status,
        createdAt: refunds.createdAt,
        updatedAt: refunds.updatedAt,
        // order info (nullable)
        orderNumber: orders.orderNumber,
        // customer info via processedBy is the submitter user; for the
        // customer we join through orders.userId
        customerId: users.id,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(refunds)
      .leftJoin(orders, eq(refunds.orderId, orders.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id: r.id,
      order_id: r.orderId ?? null,
      order_number: r.orderNumber ?? null,
      customer: r.customerId
        ? {
            id: r.customerId,
            name: r.customerName ?? null,
            email: r.customerEmail ?? null,
          }
        : null,
      amount: Number(r.amount),
      method: r.method,
      status: r.status,
      proof_url: r.proofUrl ?? null,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        current_page: page,
        per_page: limit,
        total_pages: totalPages,
        total_count: total,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/refunds error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar refund." },
      { status: 500 },
    );
  }
}
