import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { shipments, shipmentTrackings } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";

export const runtime = "nodejs";

/**
 * POST /api/admin/orders/[id]/tracking
 *
 * Admin-only. Menambahkan satu entri checkpoint tracking ke shipment milik
 * order `[id]`. Body:
 * {
 *   status?:      string;  // opsional, default "IN_TRANSIT"
 *   description?: string;  // opsional
 *   location?:    string;  // opsional
 *   timestamp?:   string;  // ISO datetime opsional → occurred_at (default: now)
 * }
 *
 * Response 201 dengan row `shipment_trackings` baru.
 */
export async function POST(
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
    description?: string;
    location?: string;
    timestamp?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const status = body.status?.trim() || "IN_TRANSIT";
  const description = body.description?.trim() || null;
  const location = body.location?.trim() || null;

  // ── Timestamp → occurred_at (default: sekarang) ───────────────────────
  let occurredAt: Date;
  if (body.timestamp) {
    const parsed = new Date(body.timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format timestamp tidak valid (harus ISO 8601)." },
        { status: 422 },
      );
    }
    occurredAt = parsed;
  } else {
    occurredAt = new Date();
  }

  // ── Cari shipment milik order ──────────────────────────────────────────
  const [shipment] = await db
    .select({ id: shipments.id, status: shipments.status })
    .from(shipments)
    .where(eq(shipments.orderId, id))
    .limit(1);

  if (!shipment) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Shipment untuk pesanan ini belum dibuat. Tandai pesanan SHIPPED terlebih dahulu.",
      },
      { status: 422 },
    );
  }

  // ── Insert checkpoint ──────────────────────────────────────────────────
  const trackingId = randomUUID();
  await db.insert(shipmentTrackings).values({
    id: trackingId,
    shipmentId: shipment.id,
    status,
    description,
    location,
    occurredAt,
  });

  // ── Fetch inserted row (urutkan untuk konsistensi dengan GET) ───────────
  const [row] = await db
    .select({
      id: shipmentTrackings.id,
      status: shipmentTrackings.status,
      description: shipmentTrackings.description,
      location: shipmentTrackings.location,
      occurredAt: shipmentTrackings.occurredAt,
      createdAt: shipmentTrackings.createdAt,
    })
    .from(shipmentTrackings)
    .where(eq(shipmentTrackings.id, trackingId))
    .limit(1);

  return NextResponse.json(
    {
      success: true,
      message: "Checkpoint tracking berhasil ditambahkan.",
      data: {
        id: row.id,
        shipment_id: shipment.id,
        status: row.status,
        description: row.description ?? null,
        location: row.location ?? null,
        occurred_at: row.occurredAt.toISOString(),
        created_at: row.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}

/**
 * GET /api/admin/orders/[id]/tracking
 *
 * Admin-only. Mengembalikan daftar checkpoint tracking untuk shipment milik
 * order `[id]`, diurutkan kronologis (paling baru di atas).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const [shipment] = await db
    .select({ id: shipments.id })
    .from(shipments)
    .where(eq(shipments.orderId, id))
    .limit(1);

  if (!shipment) {
    return NextResponse.json({ success: true, data: [] });
  }

  const rows = await db
    .select({
      id: shipmentTrackings.id,
      status: shipmentTrackings.status,
      description: shipmentTrackings.description,
      location: shipmentTrackings.location,
      occurredAt: shipmentTrackings.occurredAt,
      createdAt: shipmentTrackings.createdAt,
    })
    .from(shipmentTrackings)
    .where(eq(shipmentTrackings.shipmentId, shipment.id))
    .orderBy(asc(shipmentTrackings.occurredAt));

  return NextResponse.json({
    success: true,
    data: rows.map((t) => ({
      id: t.id,
      status: t.status,
      description: t.description ?? null,
      location: t.location ?? null,
      occurred_at: t.occurredAt.toISOString(),
      created_at: t.createdAt.toISOString(),
    })),
  });
}
