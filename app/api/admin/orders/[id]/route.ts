import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
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
import { getSession } from "@/lib/auth/session";
import { getSessionUserId } from "@/src/lib/auth/session";
import type { OrderStatus } from "@/types/enums";

export const runtime = "nodejs";

function isAdminRole(role: string): boolean {
  const r = role?.toLowerCase() ?? "";
  return r === "admin" || r === "superadmin" || r === "admin_sales" || r === "admin_laporan";
}

/**
 * GET /api/admin/orders/[id]
 *
 * Admin-only — full detail untuk satu order termasuk customer info,
 * order items, payment, dan shipment (dengan trackings).
 */
export async function GET(
  _req: NextRequest,
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

  // ── Fetch order + customer ─────────────────────────────────────────────
  const [row] = await db
    .select({
      // order fields
      id:                   orders.id,
      orderNumber:          orders.orderNumber,
      status:               orders.status,
      subtotal:             orders.subtotal,
      discountAmount:       orders.discountAmount,
      taxAmount:            orders.taxAmount,
      shippingCost:         orders.shippingCost,
      total:                orders.total,
      voucherCodeSnapshot:  orders.voucherCodeSnapshot,
      recipientName:        orders.recipientName,
      recipientPhone:       orders.recipientPhone,
      shippingAddress:      orders.shippingAddress,
      shippingProvince:     orders.shippingProvince,
      shippingCity:         orders.shippingCity,
      shippingDistrict:     orders.shippingDistrict,
      shippingVillage:      orders.shippingVillage,
      shippingPostalCode:   orders.shippingPostalCode,
      paidAt:               orders.paidAt,
      shippedAt:            orders.shippedAt,
      deliveredAt:          orders.deliveredAt,
      completedAt:          orders.completedAt,
      cancelledAt:          orders.cancelledAt,
      createdAt:            orders.createdAt,
      updatedAt:            orders.updatedAt,
      // customer
      customerId:           users.id,
      customerName:         users.name,
      customerEmail:        users.email,
      customerPhone:        users.phone,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Order items ────────────────────────────────────────────────────────
  const items = await db
    .select({
      id:                   orderItems.id,
      productId:            orderItems.productId,
      variantId:            orderItems.variantId,
      productNameSnapshot:  orderItems.productNameSnapshot,
      variantNameSnapshot:  orderItems.variantNameSnapshot,
      skuSnapshot:          orderItems.skuSnapshot,
      priceSnapshot:        orderItems.priceSnapshot,
      quantity:             orderItems.quantity,
      subtotal:             orderItems.subtotal,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.createdAt));

  // ── Payment ────────────────────────────────────────────────────────────
  const [payment] = await db
    .select({
      status:          payments.status,
      paymentType:     payments.paymentType,
      amount:          payments.amount,
      transactionTime: payments.transactionTime,
      expiryTime:      payments.expiryTime,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  // ── Shipment + provider ────────────────────────────────────────────────
  const [shipmentRow] = await db
    .select({
      id:             shipments.id,
      trackingNumber: shipments.trackingNumber,
      service:        shipments.service,
      status:         shipments.status,
      shippedAt:      shipments.shippedAt,
      deliveredAt:    shipments.deliveredAt,
      providerName:   shippingProviders.name,
    })
    .from(shipments)
    .leftJoin(shippingProviders, eq(shipments.shippingProviderId, shippingProviders.id))
    .where(eq(shipments.orderId, id))
    .limit(1);

  // ── Shipment trackings ─────────────────────────────────────────────────
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
        id:          shipmentTrackings.id,
        status:      shipmentTrackings.status,
        description: shipmentTrackings.description,
        location:    shipmentTrackings.location,
        occurredAt:  shipmentTrackings.occurredAt,
      })
      .from(shipmentTrackings)
      .where(eq(shipmentTrackings.shipmentId, shipmentRow.id))
      .orderBy(asc(shipmentTrackings.occurredAt));

    trackings = tRows.map((t) => ({
      id:          t.id,
      status:      t.status,
      description: t.description ?? null,
      location:    t.location ?? null,
      occurred_at: t.occurredAt.toISOString(),
    }));
  }

  // ── Response ───────────────────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    data: {
      id:                    row.id,
      order_number:          row.orderNumber,
      status:                row.status as OrderStatus,
      subtotal:              Number(row.subtotal),
      discount_amount:       Number(row.discountAmount),
      tax_amount:            Number(row.taxAmount),
      shipping_cost:         Number(row.shippingCost),
      total:                 Number(row.total),
      voucher_code_snapshot: row.voucherCodeSnapshot ?? null,
      recipient_name:        row.recipientName,
      recipient_phone:       row.recipientPhone,
      shipping_address:      row.shippingAddress,
      shipping_province:     row.shippingProvince,
      shipping_city:         row.shippingCity,
      shipping_district:     row.shippingDistrict,
      shipping_village:      row.shippingVillage,
      shipping_postal_code:  row.shippingPostalCode,
      paid_at:               row.paidAt?.toISOString()       ?? null,
      shipped_at:            row.shippedAt?.toISOString()    ?? null,
      delivered_at:          row.deliveredAt?.toISOString()  ?? null,
      completed_at:          row.completedAt?.toISOString()  ?? null,
      cancelled_at:          row.cancelledAt?.toISOString()  ?? null,
      created_at:            row.createdAt.toISOString(),
      updated_at:            row.updatedAt.toISOString(),
      // customer
      customer: {
        id:    row.customerId,
        name:  row.customerName,
        email: row.customerEmail,
        phone: row.customerPhone ?? null,
      },
      // items
      order_items: items.map((item) => ({
        id:                   item.id,
        product_id:           item.productId,
        variant_id:           item.variantId ?? null,
        product_name_snapshot: item.productNameSnapshot,
        variant_name_snapshot: item.variantNameSnapshot ?? null,
        sku_snapshot:         item.skuSnapshot,
        price_snapshot:       Number(item.priceSnapshot),
        quantity:             item.quantity,
        subtotal:             Number(item.subtotal),
      })),
      // payment
      payment: payment
        ? {
            status:           payment.status,
            payment_type:     payment.paymentType,
            amount:           Number(payment.amount),
            transaction_time: payment.transactionTime?.toISOString() ?? null,
            expiry_time:      payment.expiryTime?.toISOString()      ?? null,
          }
        : null,
      // shipment
      shipment: shipmentRow
        ? {
            tracking_number: shipmentRow.trackingNumber ?? null,
            service:         shipmentRow.service        ?? null,
            status:          shipmentRow.status,
            shipped_at:      shipmentRow.shippedAt?.toISOString()   ?? null,
            delivered_at:    shipmentRow.deliveredAt?.toISOString() ?? null,
            provider_name:   shipmentRow.providerName               ?? null,
            trackings,
          }
        : null,
    },
  });
}
