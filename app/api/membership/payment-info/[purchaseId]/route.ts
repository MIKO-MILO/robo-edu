import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/membership/payment-info/[purchaseId]
 *
 * Returns the membership purchase state plus the latest payment attempt for
 * the payment polling page. The frontend polls this endpoint every 3–5 s to
 * detect PAID, FAILED, or EXPIRED transitions.
 *
 * Response shape mirrors GET /api/orders/[id]/payment-info so
 * PaymentInstructionPage can consume it uniformly via the "membership" context.
 *
 * Shape returned:
 *   {
 *     order: {           // "order" key kept for frontend compat
 *       id, order_number, status, total, expires_at, created_at
 *     },
 *     payment: { ... } | null
 *   }
 *
 * Authentication: must be the purchase owner (userId from session cookie).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { purchaseId } = await params;

  // ── Fetch purchase — must belong to this user ─────────────────────────────
  const [purchase] = await db
    .select({
      id: membershipPurchases.id,
      purchaseNumber: membershipPurchases.purchaseNumber,
      status: membershipPurchases.status,
      priceSnapshot: membershipPurchases.priceSnapshot,
      createdAt: membershipPurchases.createdAt,
    })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.id, purchaseId),
        eq(membershipPurchases.userId, userId),
      ),
    )
    .limit(1);

  if (!purchase) {
    return NextResponse.json(
      { success: false, message: "Pembelian membership tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Fetch latest payment attempt ──────────────────────────────────────────
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
    .where(eq(payments.membershipPurchaseId, purchaseId))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  // Build "order-like" payload (using purchase data) for frontend compat
  const purchasePayload = {
    id: purchase.id,
    order_number: purchase.purchaseNumber,
    status: purchase.status,
    total: Number(purchase.priceSnapshot),
    expires_at: payment?.expiryTime?.toISOString() ?? null,
    created_at: new Date(purchase.createdAt).toISOString(),
  };

  if (!payment) {
    return NextResponse.json({
      success: true,
      data: { order: purchasePayload, payment: null },
    });
  }

  // ── Resolve payment_channel ───────────────────────────────────────────────
  const raw = (payment.rawResponse ?? {}) as Record<string, unknown>;
  const paymentChannel =
    typeof payment.paymentChannel === "string" && payment.paymentChannel
      ? payment.paymentChannel
      : typeof raw.payment_channel === "string"
        ? raw.payment_channel
        : typeof raw.payment_type === "string"
          ? raw.payment_type
          : payment.paymentType ?? "bank_transfer";

  // ── Resolve payment_instruction ───────────────────────────────────────────
  const paymentInstruction =
    payment.paymentInstruction != null
      ? payment.paymentInstruction
      : raw.payment_instruction != null
        ? (raw.payment_instruction as Record<string, unknown>)
        : null;

  return NextResponse.json({
    success: true,
    data: {
      order: purchasePayload,
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
