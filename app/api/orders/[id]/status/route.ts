import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/status
 * Endpoint ringan untuk polling status order setelah pembayaran.
 * Hanya return { status, paid_at } — tidak load items/payment/shipment.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [order] = await db
    .select({ status: orders.status, paidAt: orders.paidAt })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json({ success: false, message: "Order tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      status: order.status,
      paid_at: order.paidAt?.toISOString() ?? null,
    },
  });
}
