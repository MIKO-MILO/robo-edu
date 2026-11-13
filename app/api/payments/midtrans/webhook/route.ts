import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { auditLogs, membershipPurchases, orders, payments, users } from "@/src/db/schema";
import {
  isValidMidtransSignature,
  type MidtransNotification,
} from "@/src/lib/payments/midtrans";
import { enqueueEmail } from "@/src/lib/queue/email-queue";
import crypto from "node:crypto";

export const runtime = "nodejs";

// ── Status helpers ────────────────────────────────────────────────────────────

type PaymentState = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

/** Terminal payment states — once reached, no further update is applied (idempotency). */
const TERMINAL_PAYMENT_STATES = new Set<PaymentState>(["PAID", "FAILED", "EXPIRED", "REFUNDED"]);

/**
 * Map a Midtrans `transaction_status` + optional `fraud_status` to our
 * internal payment state.
 *
 * Returns null for `chargeback` because that notification does NOT change
 * payment status — it triggers an audit log + Sentry alert only.
 */
function resolvePaymentState(notification: MidtransNotification): PaymentState | null {
  switch (notification.transaction_status) {
    case "settlement":
      return "PAID";
    case "capture":
      // Core API card payments: fraud_status must be "accept" to settle.
      return notification.fraud_status === "accept" ? "PAID" : "PENDING";
    case "expire":
      return "EXPIRED";
    case "cancel":
    case "deny":
    case "failure":
      return "FAILED";
    case "refund":
    case "partial_refund":
      return "REFUNDED";
    case "chargeback":
      return null; // handled separately — no status change
    default:
      return "PENDING";
  }
}

function hasNotificationShape(
  value: unknown,
): value is MidtransNotification & { signature_key: string } {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return [
    "order_id",
    "status_code",
    "gross_amount",
    "transaction_id",
    "transaction_status",
    "payment_type",
    "signature_key",
  ].every((key) => typeof n[key] === "string");
}

// ── Safe month addition ───────────────────────────────────────────────────────

function addMonthsSafe(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDayOfTarget = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  result.setFullYear(
    targetYear,
    normalizedMonth,
    Math.min(result.getDate(), lastDayOfTarget),
  );
  return result;
}

// ── Membership webhook branch (MBR-) ─────────────────────────────────────────

/**
 * Handle a Midtrans notification whose order_id starts with "MBR-".
 *
 * Lookup: payments.midtrans_order_id = body.order_id (unique per attempt).
 * Idempotent: duplicate PAID notifications are accepted silently (200).
 */
async function handleMembershipWebhook(
  body: MidtransNotification & { signature_key: string },
): Promise<NextResponse> {
  // Lookup by midtrans_order_id on the payments table first (multi-attempt support).
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.midtransOrderId, body.order_id))
    .limit(1);

  if (!payment || !payment.membershipPurchaseId) {
    return NextResponse.json(
      { error: "Membership payment not found" },
      { status: 404 },
    );
  }

  const [purchase] = await db
    .select()
    .from(membershipPurchases)
    .where(eq(membershipPurchases.id, payment.membershipPurchaseId))
    .limit(1);

  if (!purchase) {
    return NextResponse.json(
      { error: "Membership purchase not found" },
      { status: 404 },
    );
  }

  if (Number(payment.amount) !== Number(body.gross_amount)) {
    return NextResponse.json(
      { error: "Amount does not match" },
      { status: 400 },
    );
  }

  // ── Chargeback branch ─────────────────────────────────────────────────────
  if (body.transaction_status === "chargeback") {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorId: null,
      action: "payment.chargeback",
      targetType: "payment",
      targetId: payment.id,
      description: `Chargeback received for membership payment ${body.order_id}`,
      metadata: {
        midtransOrderId: body.order_id,
        membershipPurchaseId: purchase.id,
        rawNotification: body,
      },
    });
    Sentry.captureMessage(
      `[Webhook] Chargeback for membership ${body.order_id} — membership_purchase_id=${purchase.id}`,
      { level: "error", extra: { body } },
    );
    return NextResponse.json({ received: true });
  }

  const newState = resolvePaymentState(body);
  const timestamp = body.transaction_time
    ? new Date(body.transaction_time)
    : new Date();

  // ── Fraud challenge ───────────────────────────────────────────────────────
  if (body.transaction_status === "capture" && body.fraud_status === "challenge") {
    // Keep payment PENDING — do not update, just alert.
    Sentry.captureMessage(
      `[Webhook] Fraud challenge for membership ${body.order_id} — requires manual review`,
      { level: "warning", extra: { body } },
    );
    return NextResponse.json({ received: true });
  }

  // ── Idempotency guard: already at a terminal state ────────────────────────
  if (newState !== null && TERMINAL_PAYMENT_STATES.has(payment.status as PaymentState)) {
    // If the incoming state matches what we already have, accept silently.
    if (payment.status === newState) {
      return NextResponse.json({ received: true });
    }
    // If the current state is terminal and the incoming is different (e.g. downgrade),
    // also accept silently — do not regress a terminal state.
    return NextResponse.json({ received: true });
  }

  if (newState === null) {
    // Unknown status — accept silently.
    return NextResponse.json({ received: true });
  }

  let justActivated = false;

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        midtransTransactionId: body.transaction_id,
        paymentType: body.payment_type,
        paymentMethod: body.payment_type,
        status: newState,
        transactionTime: timestamp,
        settlementTime: newState === "PAID" ? timestamp : null,
        fraudStatus: body.fraud_status ?? null,
        rawResponse: body,
      })
      .where(eq(payments.id, payment.id));

    const membershipPurchaseUpdate: Partial<typeof membershipPurchases.$inferInsert> = {
      status:
        newState === "PAID"
          ? "PAID"
          : newState === "FAILED"
            ? "FAILED"
            : newState === "EXPIRED"
              ? "EXPIRED"
              : newState === "REFUNDED"
                ? "REFUNDED"
                : "PENDING",
    };

    if (newState === "PAID" && purchase.status !== "PAID") {
      const startsAt = timestamp;
      const endsAt = addMonthsSafe(startsAt, purchase.durationMonthsSnapshot);

      membershipPurchaseUpdate.paidAt = startsAt;
      membershipPurchaseUpdate.startsAt = startsAt;
      membershipPurchaseUpdate.endsAt = endsAt;

      const [currentUser] = await tx
        .select({
          membershipStatus: users.membershipStatus,
          membershipExpiresAt: users.membershipExpiresAt,
        })
        .from(users)
        .where(eq(users.id, purchase.userId))
        .limit(1);

      let finalExpiresAt = endsAt;
      if (
        currentUser?.membershipStatus === "MEMBER" &&
        currentUser.membershipExpiresAt &&
        new Date(currentUser.membershipExpiresAt) > startsAt
      ) {
        finalExpiresAt = addMonthsSafe(
          new Date(currentUser.membershipExpiresAt),
          purchase.durationMonthsSnapshot,
        );
      }

      await tx
        .update(users)
        .set({
          membershipStatus: "MEMBER",
          membershipExpiresAt: finalExpiresAt,
        })
        .where(eq(users.id, purchase.userId));

      membershipPurchaseUpdate.endsAt = finalExpiresAt;
      justActivated = true;
    }

    await tx
      .update(membershipPurchases)
      .set(membershipPurchaseUpdate)
      .where(eq(membershipPurchases.id, purchase.id));
  });

  // ── Enqueue membership receipt email (outside DB tx, non-fatal) ───────────
  // jobId = payment.id so duplicate notifications never produce duplicate jobs.
  // BullMQ does not allow ":" in jobIds — use "-" as separator.
  if (justActivated) {
    try {
      await enqueueEmail(
        {
          type: "membership-receipt",
          membershipPurchaseId: purchase.id,
          userId: purchase.userId,
        },
        `membership-receipt-${payment.id}`,
      );
    } catch (err) {
      console.error("[webhook] Failed to enqueue membership-receipt email:", err);
    }
  }

  return NextResponse.json({ received: true });
}

// ── Product-order webhook branch (RE-) ────────────────────────────────────────

/**
 * Handle a Midtrans notification whose order_id starts with "RE-".
 *
 * Ticket 05 requirements:
 * - Lookup by payments.midtrans_order_id (not orders.order_number)
 * - Idempotent: terminal state → accept silently
 * - capture+challenge → keep PENDING, Sentry alert
 * - chargeback → audit_log, Sentry alert, no order change
 * - PAID for CANCELLED order → payment=PAID, order stays CANCELLED, Sentry alert
 */
async function handleOrderWebhook(
  body: MidtransNotification & { signature_key: string },
): Promise<NextResponse> {
  // Lookup payment by midtrans_order_id (unique per attempt).
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.midtransOrderId, body.order_id))
    .limit(1);

  if (!payment || !payment.orderId) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 },
    );
  }

  // Validate amount.
  if (Number(payment.amount) !== Number(body.gross_amount)) {
    return NextResponse.json(
      { error: "Amount does not match" },
      { status: 400 },
    );
  }

  // Load the linked order.
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, payment.orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ── Chargeback branch ─────────────────────────────────────────────────────
  if (body.transaction_status === "chargeback") {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorId: null,
      action: "payment.chargeback",
      targetType: "payment",
      targetId: payment.id,
      description: `Chargeback received for order payment ${body.order_id} (order: ${order.orderNumber})`,
      metadata: {
        midtransOrderId: body.order_id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        rawNotification: body,
      },
    });
    Sentry.captureMessage(
      `[Webhook] Chargeback for order ${order.orderNumber} (${body.order_id}) — requires admin review`,
      { level: "error", extra: { body, orderId: order.id } },
    );
    return NextResponse.json({ received: true });
  }

  // ── Fraud challenge ───────────────────────────────────────────────────────
  if (body.transaction_status === "capture" && body.fraud_status === "challenge") {
    Sentry.captureMessage(
      `[Webhook] Fraud challenge for order ${order.orderNumber} (${body.order_id}) — requires manual review`,
      { level: "warning", extra: { body, orderId: order.id } },
    );
    // Payment remains PENDING — no DB update.
    return NextResponse.json({ received: true });
  }

  const newState = resolvePaymentState(body);

  // ── Idempotency guard: already at a terminal payment state ────────────────
  if (newState !== null && TERMINAL_PAYMENT_STATES.has(payment.status as PaymentState)) {
    return NextResponse.json({ received: true });
  }

  if (newState === null) {
    return NextResponse.json({ received: true });
  }

  const timestamp = body.transaction_time
    ? new Date(body.transaction_time)
    : new Date();

  const orderIsCancelled = order.status === "CANCELLED";

  // ── PAID webhook for a CANCELLED order ───────────────────────────────────
  if (newState === "PAID" && orderIsCancelled) {
    // Set payment to PAID but do NOT touch order status.
    await db
      .update(payments)
      .set({
        midtransTransactionId: body.transaction_id,
        paymentType: body.payment_type,
        paymentMethod: body.payment_type,
        status: "PAID",
        transactionTime: timestamp,
        settlementTime: timestamp,
        fraudStatus: body.fraud_status ?? null,
        rawResponse: body,
      })
      .where(eq(payments.id, payment.id));

    Sentry.captureMessage(
      `[Webhook] PAID received for CANCELLED order ${order.orderNumber} — manual refund required`,
      {
        level: "error",
        extra: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paymentId: payment.id,
          midtransOrderId: body.order_id,
          grossAmount: body.gross_amount,
        },
      },
    );

    return NextResponse.json({ received: true });
  }

  let justPaid = false;

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        midtransTransactionId: body.transaction_id,
        paymentType: body.payment_type,
        paymentMethod: body.payment_type,
        status: newState,
        transactionTime: timestamp,
        settlementTime: newState === "PAID" ? timestamp : null,
        fraudStatus: body.fraud_status ?? null,
        rawResponse: body,
      })
      .where(eq(payments.id, payment.id));

    // Only advance order status if it's currently PENDING.
    // Do not overwrite PROCESSING/SHIPPED/DELIVERED/COMPLETED/CANCELLED.
    if (order.status === "PENDING") {
      const newOrderStatus =
        newState === "PAID"
          ? "PAID"
          : newState === "FAILED" || newState === "EXPIRED"
            ? "CANCELLED"
            : newState === "REFUNDED"
              ? "REFUNDED"
              : order.status;

      await tx
        .update(orders)
        .set({
          status: newOrderStatus,
          paidAt: newState === "PAID" ? timestamp : order.paidAt,
          cancelledAt:
            newOrderStatus === "CANCELLED" ? timestamp : order.cancelledAt,
        })
        .where(eq(orders.id, order.id));
    }

    if (newState === "PAID" && order.status === "PENDING") {
      justPaid = true;
    }
  });

  // ── Enqueue order receipt email (outside DB tx, non-fatal) ────────────────
  // jobId = payment.id so duplicate notifications never produce duplicate jobs.
  // BullMQ does not allow ":" in jobIds — use "-" as separator.
  if (justPaid) {
    try {
      await enqueueEmail(
        { type: "order-receipt", orderId: order.id },
        `order-receipt-${payment.id}`,
      );
    } catch (err) {
      console.error("[webhook] Failed to enqueue order-receipt email:", err);
    }
  }

  return NextResponse.json({ received: true });
}

// ── Main webhook handler ──────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!hasNotificationShape(body)) {
    console.warn("[webhook] Invalid notification shape received");
    return NextResponse.json(
      { error: "Invalid Midtrans signature" },
      { status: 401 },
    );
  }

  if (!isValidMidtransSignature(body, body.signature_key)) {
    console.warn("[webhook] Invalid Midtrans signature for order_id:", body.order_id);
    return NextResponse.json(
      { error: "Invalid Midtrans signature" },
      { status: 401 },
    );
  }

  if (body.order_id.startsWith("MBR-")) {
    return handleMembershipWebhook(body);
  }

  // RE- prefix or any other product-order prefix.
  return handleOrderWebhook(body);
}
