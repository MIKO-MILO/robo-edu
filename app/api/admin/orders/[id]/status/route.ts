import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, shipments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

// Status yang valid dan transisi yang diperbolehkan
const VALID_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

type ValidStatus = (typeof VALID_STATUSES)[number];

/**
 * PATCH /api/admin/orders/[id]/status
 * Body: { status: string }
 * Admin dapat mengubah status order secara manual.
 * Secara otomatis mengisi timestamp (shipped_at, delivered_at, dll.)
 * dan mengupdate status shipment jika relevan.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // ── Fetch existing order ──────────────────────────────────────────────
  const [order] = await db
    .select({ id: orders.id, status: orders.status, orderNumber: orders.orderNumber })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body tidak valid." },
      { status: 400 },
    );
  }

  const newStatus = body.status?.toLowerCase() as ValidStatus | undefined;

  if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(", ")}`,
      },
      { status: 422 },
    );
  }

  if (newStatus === order.status) {
    return NextResponse.json(
      { success: false, message: "Status sudah sama, tidak ada perubahan." },
      { status: 422 },
    );
  }

  const now = new Date();

  // ── Tentukan field timestamp yang perlu diisi ─────────────────────────
  const updateData: Record<string, unknown> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === "paid" && !order.status.includes("paid")) {
    updateData.paidAt = now;
  }
  if (newStatus === "shipped") {
    updateData.shippedAt = now;
  }
  if (newStatus === "delivered") {
    updateData.deliveredAt = now;
  }
  if (newStatus === "completed") {
    updateData.completedAt = now;
  }
  if (newStatus === "cancelled") {
    updateData.cancelledAt = now;
  }

  // ── Update order ──────────────────────────────────────────────────────
  await db.update(orders).set(updateData).where(eq(orders.id, id));

  // ── Sync shipment status jika relevan ─────────────────────────────────
  if (newStatus === "shipped" || newStatus === "delivered") {
    const shipmentStatus = newStatus === "shipped" ? "shipped" : "delivered";
    const shipmentTimestamp = newStatus === "shipped"
      ? { shippedAt: now, updatedAt: now }
      : { deliveredAt: now, status: shipmentStatus, updatedAt: now };

    await db
      .update(shipments)
      .set({ status: shipmentStatus, ...shipmentTimestamp })
      .where(eq(shipments.orderId, id));
  }

  // ── Fetch updated order ───────────────────────────────────────────────
  const [updated] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return NextResponse.json({
    success: true,
    message: `Status pesanan ${updated.orderNumber} berhasil diubah ke ${newStatus.toUpperCase()}.`,
    data: {
      id: updated.id,
      order_number: updated.orderNumber,
      status: updated.status.toUpperCase(),
      updated_at: updated.updatedAt.toISOString(),
    },
  });
}
