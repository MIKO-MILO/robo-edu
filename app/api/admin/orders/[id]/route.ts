import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import {
  orders,
  orderItems,
  payments,
  shipments,
  shipmentTrackings,
  shippingProviders,
  users,
} from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/orders/[id]
 * Detail lengkap sebuah order: order + customer + items + payment + shipment + trackings.
 * Admin-only — tidak ada filter userId.
 */
export async function GET(
  _req: NextRequest,
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

  // ── Order ─────────────────────────────────────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      subtotal: orders.subtotal,
      discountAmount: orders.discountAmount,
      shippingCost: orders.shippingCost,
      taxAmount: orders.taxAmount,
      total: orders.total,
      voucherCodeSnapshot: orders.voucherCodeSnapshot,
      recipientName: orders.recipientName,
      recipientPhone: orders.recipientPhone,
      shippingAddress: orders.shippingAddress,
      shippingDistrict: orders.shippingDistrict,
      shippingCity: orders.shippingCity,
      shippingProvince: orders.shippingProvince,
      shippingPostalCode: orders.shippingPostalCode,
      paidAt: orders.paidAt,
      shippedAt: orders.shippedAt,
      deliveredAt: orders.deliveredAt,
      completedAt: orders.completedAt,
      cancelledAt: orders.cancelledAt,
      createdAt: orders.createdAt,
      // Customer via join
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Order Items ───────────────────────────────────────────────────────
  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      variantId: orderItems.variantId,
      productNameSnapshot: orderItems.productNameSnapshot,
      variantNameSnapshot: orderItems.variantNameSnapshot,
      skuSnapshot: orderItems.skuSnapshot,
      priceSnapshot: orderItems.priceSnapshot,
      quantity: orderItems.quantity,
      subtotal: orderItems.subtotal,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.createdAt));

  // ── Payment ───────────────────────────────────────────────────────────
  const [payment] = await db
    .select({
      status: payments.status,
      paymentType: payments.paymentType,
      transactionId: payments.transactionId,
      amount: payments.amount,
      transactionTime: payments.transactionTime,
      expiryTime: payments.expiryTime,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  // ── Shipment + Provider ───────────────────────────────────────────────
  const [shipmentRow] = await db
    .select({
      id: shipments.id,
      trackingNumber: shipments.trackingNumber,
      service: shipments.service,
      status: shipments.status,
      shippedAt: shipments.shippedAt,
      deliveredAt: shipments.deliveredAt,
      providerName: shippingProviders.name,
    })
    .from(shipments)
    .leftJoin(shippingProviders, eq(shipments.shippingProviderId, shippingProviders.id))
    .where(eq(shipments.orderId, id))
    .limit(1);

  // ── Shipment Trackings ────────────────────────────────────────────────
  let trackings: Array<{
    id: string;
    status: string;
    description: string | null;
    location: string | null;
    occurred_at: string;
  }> = [];

  if (shipmentRow) {
    const tRows = await db
      .select({
        id: shipmentTrackings.id,
        status: shipmentTrackings.status,
        description: shipmentTrackings.description,
        location: shipmentTrackings.location,
        occurredAt: shipmentTrackings.occurredAt,
      })
      .from(shipmentTrackings)
      .where(eq(shipmentTrackings.shipmentId, shipmentRow.id))
      .orderBy(asc(shipmentTrackings.occurredAt));

    trackings = tRows.map((t) => ({
      id: t.id,
      status: t.status,
      description: t.description ?? null,
      location: t.location ?? null,
      occurred_at: t.occurredAt.toISOString(),
    }));
  }

  // ── Response ──────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      order_number: order.orderNumber,
      status: order.status.toUpperCase(),
      subtotal: Number(order.subtotal),
      discount_amount: Number(order.discountAmount),
      shipping_cost: Number(order.shippingCost),
      tax_amount: Number(order.taxAmount),
      total: Number(order.total),
      voucher_code_snapshot: order.voucherCodeSnapshot ?? null,
      recipient_name: order.recipientName,
      recipient_phone: order.recipientPhone,
      shipping_address: order.shippingAddress,
      shipping_district: order.shippingDistrict,
      shipping_city: order.shippingCity,
      shipping_province: order.shippingProvince,
      shipping_postal_code: order.shippingPostalCode,
      paid_at: order.paidAt?.toISOString() ?? null,
      shipped_at: order.shippedAt?.toISOString() ?? null,
      delivered_at: order.deliveredAt?.toISOString() ?? null,
      completed_at: order.completedAt?.toISOString() ?? null,
      cancelled_at: order.cancelledAt?.toISOString() ?? null,
      created_at: order.createdAt.toISOString(),
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone ?? "-",
      },
      order_items: items.map((item) => ({
        id: item.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        product_name_snapshot: item.productNameSnapshot,
        variant_name_snapshot: item.variantNameSnapshot ?? null,
        sku_snapshot: item.skuSnapshot,
        price_snapshot: Number(item.priceSnapshot),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
      payment: payment
        ? {
            status: payment.status.toUpperCase(),
            payment_type: payment.paymentType,
            transaction_id: payment.transactionId,
            amount: Number(payment.amount),
            transaction_time: payment.transactionTime?.toISOString() ?? null,
            expiry_time: payment.expiryTime?.toISOString() ?? null,
          }
        : null,
      shipment: shipmentRow
        ? {
            tracking_number: shipmentRow.trackingNumber ?? null,
            service: shipmentRow.service ?? null,
            status: shipmentRow.status,
            shipped_at: shipmentRow.shippedAt?.toISOString() ?? null,
            delivered_at: shipmentRow.deliveredAt?.toISOString() ?? null,
            provider_name: shipmentRow.providerName ?? null,
            trackings,
          }
        : null,
    },
  });
}
