import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/orders/[id]/payment-info
 *
 * Returns the order + the latest payment attempt for the custom payment page.
 *
 * payment_instruction is read from the dedicated `payments.payment_instruction`
 * column (written by checkout / retry). This survives the webhook's rawResponse
 * overwrite because the webhook only updates rawResponse, not payment_instruction.
 *
 * Legacy Snap orders that lack a dedicated payment_instruction fall back to
 * rawResponse.payment_instruction for backward-compatibility.
 *
 * payment_channel resolution order:
 *   1. payments.payment_channel (dedicated column, set at checkout / retry)
 *   2. rawResponse.payment_channel (Core API webhook field)
 *   3. rawResponse.payment_type
 *   4. payments.paymentType (Snap fallback)
 *   5. "bank_transfer" (last resort)
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
      expiresAt: orders.expiresAt,
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

  // Fetch the LATEST payment attempt for this order
  const [payment] = await db
    .select({
      id: payments.id,
      status: payments.status,
      paymentType: payments.paymentType,
      paymentChannel: payments.paymentChannel,
      paymentInstruction: payments.paymentInstruction,
      payerPhoneNumber: payments.payerPhoneNumber,
      amount: payments.amount,
      expiryTime: payments.expiryTime,
      transactionTime: payments.transactionTime,
      attemptNumber: payments.attemptNumber,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  if (!payment) {
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          order_number: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          expires_at: order.expiresAt?.toISOString() ?? null,
          created_at: order.createdAt.toISOString(),
        },
        payment: null,
      },
    });
  }

  // ── Resolve payment_channel ──────────────────────────────────────────────
  const raw = (payment.rawResponse ?? {}) as Record<string, unknown>;
  const paymentChannel =
    // 1. Dedicated column (Core API checkout / retry)
    typeof payment.paymentChannel === "string" && payment.paymentChannel
      ? payment.paymentChannel
      // 2. Webhook writes payment_channel into rawResponse for Core API orders
      : typeof raw.payment_channel === "string"
        ? raw.payment_channel
        // 3. rawResponse.payment_type (Snap / Core API)
        : typeof raw.payment_type === "string"
          ? raw.payment_type
          // 4. paymentType column
          : payment.paymentType ?? "bank_transfer";

  // ── Resolve payment_instruction ──────────────────────────────────────────
  // Dedicated column wins — it is not overwritten by the webhook.
  const paymentInstruction =
    payment.paymentInstruction != null
      ? payment.paymentInstruction
      : raw.payment_instruction != null
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
        expires_at: order.expiresAt?.toISOString() ?? null,
        created_at: order.createdAt.toISOString(),
      },
      payment: {
        id: payment.id,
        status: payment.status,
        payment_type: payment.paymentType,
        payment_channel: paymentChannel,
        payment_instruction: paymentInstruction,
        payer_phone_number: payment.payerPhoneNumber ?? null,
        amount: Number(payment.amount),
        expiry_time: payment.expiryTime?.toISOString() ?? null,
        transaction_time: payment.transactionTime?.toISOString() ?? null,
        attempt_number: payment.attemptNumber,
      },
    },
  });
}
