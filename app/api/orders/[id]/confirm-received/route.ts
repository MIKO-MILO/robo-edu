import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/confirm-received
 *
 * User confirms they have received their package.
 * Transitions order status from DELIVERED → COMPLETED and sets completed_at.
 *
 * Rules:
 * - User must be logged in.
 * - The order must belong to the logged-in user.
 * - Order must be DELIVERED (or already COMPLETED — idempotent).
 *
 * Returns 200 whether the order was just completed or was already COMPLETED.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id: orderId } = await params;

  // ── Fetch order (ownership check) ─────────────────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  const status = order.status.toUpperCase();

  // ── Idempotency: already COMPLETED ────────────────────────────────────────
  if (status === "COMPLETED") {
    return NextResponse.json({
      success: true,
      message: "Pesanan sudah dikonfirmasi diterima.",
      data: {
        id: order.id,
        order_number: order.orderNumber,
        status: "COMPLETED",
        completed_at: order.completedAt?.toISOString() ?? null,
      },
    });
  }

  // ── Validate status is DELIVERED ──────────────────────────────────────────
  if (status !== "DELIVERED") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Konfirmasi penerimaan hanya dapat dilakukan untuk pesanan yang sudah dikirim (DELIVERED).",
      },
      { status: 409 },
    );
  }

  // ── Transition DELIVERED → COMPLETED ─────────────────────────────────────
  const now = new Date();
  await db
    .update(orders)
    .set({ status: "COMPLETED", completedAt: now, updatedAt: now })
    .where(eq(orders.id, orderId));

  return NextResponse.json({
    success: true,
    message: "Penerimaan paket berhasil dikonfirmasi.",
    data: {
      id: order.id,
      order_number: order.orderNumber,
      status: "COMPLETED",
      completed_at: now.toISOString(),
    },
  });
}
