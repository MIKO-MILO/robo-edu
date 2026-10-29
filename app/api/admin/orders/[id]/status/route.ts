import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, shipments, shippingProviders } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";
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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // ── Parse body ─────────────────────────────────────────────────────────
  let body: {
    status?: string;
    note?: string;
    tracking_number?: string;
    provider_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const rawStatus = body.status?.trim().toUpperCase();
  const newStatus = rawStatus as OrderStatus | undefined;

  if (!newStatus || !ALLOWED_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        message: `Status tidak valid. Nilai yang diizinkan: ${ALLOWED_STATUSES.join(", ")}.`,
      },
      { status: 422 },
    );
  }

  // ── Optional tracking info (hanya relevan saat SHIPPED) ────────────────
  const trackingNumber = body.tracking_number?.trim() || null;
  const providerId = body.provider_id?.trim() || null;

  // Validasi provider_id bila diberikan — pastikan benar-benar ada di DB.
  if (providerId) {
    const [provider] = await db
      .select({ id: shippingProviders.id })
      .from(shippingProviders)
      .where(eq(shippingProviders.id, providerId))
      .limit(1);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider pengiriman tidak ditemukan." },
        { status: 422 },
      );
    }
  }

  // ── Fetch current order ────────────────────────────────────────────────
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

  const currentStatus = order.status.toUpperCase() as OrderStatus;

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

  // ── Sync shipment status jika relevan ─────────────────────────────────
  if (newStatus === "SHIPPED" || newStatus === "DELIVERED") {
    const shipmentStatus = newStatus === "SHIPPED" ? "shipped" : "delivered";

    if (newStatus === "SHIPPED") {
      // Saat SHIPPED, set tracking number + provider (jika diberikan) + shipped_at.
      const shipmentUpdate: Partial<typeof shipments.$inferInsert> = {
        status: shipmentStatus,
        shippedAt: now,
        updatedAt: now,
      };
      if (trackingNumber) shipmentUpdate.trackingNumber = trackingNumber;
      if (providerId) shipmentUpdate.shippingProviderId = providerId;

      await db
        .update(shipments)
        .set(shipmentUpdate)
        .where(eq(shipments.orderId, id));
    } else {
      // DELIVERED
      await db
        .update(shipments)
        .set({ status: shipmentStatus, deliveredAt: now, updatedAt: now })
        .where(eq(shipments.orderId, id));
    }
  }

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

  // Ambil tracking number terbaru dari shipment (jika SHIPPED barusan di-set).
  let trackingNumberOut: string | null = null;
  if (newStatus === "SHIPPED") {
    const [shipment] = await db
      .select({ trackingNumber: shipments.trackingNumber })
      .from(shipments)
      .where(eq(shipments.orderId, id))
      .limit(1);
    trackingNumberOut = shipment?.trackingNumber ?? null;
  }

  return NextResponse.json({
    success: true,
    message: `Status pesanan ${updated.orderNumber} berhasil diperbarui ke ${newStatus}.`,
    data: {
      id:             updated.id,
      order_number:   updated.orderNumber,
      status:         updated.status.toUpperCase() as OrderStatus,
      tracking_number: trackingNumberOut,
      updated_at:     updated.updatedAt.toISOString(),
    },
  });
}
