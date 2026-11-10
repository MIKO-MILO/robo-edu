import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/payment-info
 *
 * Mengembalikan info order + payment yang dibutuhkan halaman pembayaran
 * kustom (Core API UI). Termasuk payment_channel dari rawResponse dan
 * payment_instruction (dari Core API; placeholder ketika belum tersedia).
 *
 * Hanya order milik user yang login — 404 jika bukan pemilik.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // Fetch order — must belong to this user
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // Fetch payment
  const [payment] = await db
    .select({
      status: payments.status,
      paymentType: payments.paymentType,
      amount: payments.amount,
      expiryTime: payments.expiryTime,
      transactionTime: payments.transactionTime,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  // Extract payment_channel from rawResponse if available (set by Core API webhook)
  // or fall back to paymentType stored at checkout.
  const raw = (payment?.rawResponse ?? {}) as Record<string, unknown>;
  const paymentChannel =
    typeof raw.payment_channel === "string"
      ? raw.payment_channel
      : typeof raw.payment_type === "string"
        ? raw.payment_type
        : payment?.paymentType ?? "bank_transfer";

  // payment_instruction: from Core API (not yet available, so null in mock scenario)
  const paymentInstruction =
    raw.payment_instruction != null
      ? (raw.payment_instruction as Record<string, unknown>)
      : null;

  return NextResponse.json({
    success: true,
    data: {
      order: {
        id: order.id,
        order_number: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        created_at: order.createdAt.toISOString(),
      },
      payment: payment
        ? {
            status: payment.status,
            payment_type: payment.paymentType,
            payment_channel: paymentChannel,
            amount: Number(payment.amount),
            expiry_time: payment.expiryTime?.toISOString() ?? null,
            transaction_time: payment.transactionTime?.toISOString() ?? null,
            payment_instruction: paymentInstruction,
          }
        : null,
    },
  });
}
