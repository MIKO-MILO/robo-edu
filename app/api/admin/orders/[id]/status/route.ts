import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { OrderStatus } from "@/types/enums";

export const runtime = "nodejs";

/** Status yang boleh di-set manual oleh admin (tidak termasuk PAID — itu dari payment gateway). */
const ALLOWED_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

/**
 * Transisi yang valid: hanya admin yang boleh mundur ke status tertentu,
 * tapi umumnya flow maju: PENDING → PROCESSING → SHIPPED → DELIVERED → COMPLETED.
 * Cancelled / Refunded bisa dari status mana pun.
 */
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PAID:       ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED", "CANCELLED"],
  DELIVERED:  ["COMPLETED", "REFUNDED"],
  COMPLETED:  ["REFUNDED"],
  CANCELLED:  [],
  REFUNDED:   [],
};

function isAdminRole(role: string): boolean {
  const r = role?.toLowerCase() ?? "";
  return r === "admin" || r === "superadmin" || r === "admin_sales" || r === "admin_laporan";
}

/**
 * PATCH /api/admin/orders/[id]/status
 *
 * Body JSON:
 * {
 *   status: OrderStatus;
 *   note?: string;         // opsional, catatan internal admin
 * }
 *
 * Otomatis mengisi timestamp kolom terkait (shippedAt, deliveredAt, dll.)
 * dan memvalidasi transisi status yang legal.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ───────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  const { id } = await params;

  // ── Parse body ─────────────────────────────────────────────────────────
  let body: { status?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const newStatus = body.status as OrderStatus | undefined;

  if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Status tidak valid. Nilai yang diizinkan: ${ALLOWED_STATUSES.join(", ")}.`,
      },
      { status: 422 },
    );
  }

  // ── Fetch current order ────────────────────────────────────────────────
  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  const currentStatus = order.status as OrderStatus;

  // ── Validate transition ────────────────────────────────────────────────
  if (currentStatus === newStatus) {
    return NextResponse.json(
      { success: false, message: `Pesanan sudah berstatus ${newStatus}.` },
      { status: 422 },
    );
  }

  const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Transisi dari ${currentStatus} ke ${newStatus} tidak diizinkan.`,
        allowed_transitions: allowed,
      },
      { status: 422 },
    );
  }

  // ── Build update payload (timestamps otomatis) ─────────────────────────
  const now = new Date();
  const updateData: Partial<typeof orders.$inferInsert> & { updatedAt: Date } = {
    status:    newStatus,
    updatedAt: now,
  };

  if (newStatus === "SHIPPED")    updateData.shippedAt   = now;
  if (newStatus === "DELIVERED")  updateData.deliveredAt = now;
  if (newStatus === "COMPLETED")  updateData.completedAt = now;
  if (newStatus === "CANCELLED")  updateData.cancelledAt = now;

  // ── Execute update ─────────────────────────────────────────────────────
  await db.update(orders).set(updateData).where(eq(orders.id, id));

  // ── Fetch updated record to return ────────────────────────────────────
  const [updated] = await db
    .select({
      id:          orders.id,
      orderNumber: orders.orderNumber,
      status:      orders.status,
      updatedAt:   orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return NextResponse.json({
    success: true,
    message: `Status pesanan berhasil diperbarui ke ${newStatus}.`,
    data: {
      id:           updated.id,
      order_number: updated.orderNumber,
      status:       updated.status as OrderStatus,
      updated_at:   updated.updatedAt.toISOString(),
    },
  });
}
