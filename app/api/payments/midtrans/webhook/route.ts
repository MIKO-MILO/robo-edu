import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, orders, payments, users } from "@/src/db/schema";
import {
  isValidMidtransSignature,
  type MidtransNotification,
} from "@/src/lib/payments/midtrans";
import { enqueueEmail } from "@/src/lib/queue/email-queue";

export const runtime = "nodejs";

type PaymentState = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
type OrderState = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

function notificationStates(notification: MidtransNotification): {
  payment: PaymentState;
  order: OrderState;
} {
  switch (notification.transaction_status) {
    case "settlement":
      return { payment: "PAID", order: "PAID" };
    case "capture":
      return notification.fraud_status === "accept"
        ? { payment: "PAID", order: "PAID" }
        : { payment: "PENDING", order: "PENDING" };
    case "expire":
      return { payment: "EXPIRED", order: "CANCELLED" };
    case "cancel":
    case "deny":
      return { payment: "FAILED", order: "CANCELLED" };
    case "refund":
    case "partial_refund":
      return { payment: "REFUNDED", order: "REFUNDED" };
    default:
      return { payment: "PENDING", order: "PENDING" };
  }
}

function hasNotificationShape(
  value: unknown,
): value is MidtransNotification & { signature_key: string } {
  if (!value || typeof value !== "object") return false;
  const notification = value as Record<string, unknown>;
  return [
    "order_id",
    "status_code",
    "gross_amount",
    "transaction_id",
    "transaction_status",
    "payment_type",
    "signature_key",
  ].every((key) => typeof notification[key] === "string");
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

// ── Membership webhook branch ─────────────────────────────────────────────────

/**
 * Handle a Midtrans notification whose order_id starts with "MBR-".
 *
 * On success:
 *   - updates `payments` row
 *   - updates `membership_purchase` row (paidAt, startsAt, endsAt)
 *   - sets `users.membership_status = "MEMBER"` and computes `membership_expires_at`
 *   - enqueues a `membership-receipt` email job (idempotent via jobId)
 *
 * Idempotent: duplicate PAID notifications are accepted silently (200).
 * A PENDING notification after PAID is discarded (no downgrade).
 */
async function handleMembershipWebhook(
  body: MidtransNotification & { signature_key: string },
): Promise<NextResponse> {
  const [purchase] = await db
    .select()
    .from(membershipPurchases)
    .where(eq(membershipPurchases.purchaseNumber, body.order_id))
    .limit(1);

  if (!purchase) {
    return NextResponse.json(
      { error: "Membership purchase not found" },
      { status: 404 },
    );
  }

  if (Number(purchase.priceSnapshot) !== Number(body.gross_amount)) {
    return NextResponse.json(
      { error: "Amount does not match" },
      { status: 400 },
    );
  }

  const states = notificationStates(body);
  const timestamp = body.transaction_time
    ? new Date(body.transaction_time)
    : new Date();

  // Idempotency guard: already PAID + duplicate PAID → accept silently.
  if (purchase.status === "PAID" && states.payment === "PAID") {
    return NextResponse.json({ received: true });
  }

  let justActivated = false;

  await db.transaction(async (tx) => {
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.membershipPurchaseId, purchase.id))
      .limit(1);

    if (payment) {
      // No downgrade.
      if (payment.status === "PAID" && states.payment === "PENDING") return;

      await tx
        .update(payments)
        .set({
          midtransTransactionId: body.transaction_id,
          paymentType: body.payment_type,
          paymentMethod: body.payment_type,
          status: states.payment,
          transactionTime: timestamp,
          settlementTime: states.payment === "PAID" ? timestamp : null,
          fraudStatus: body.fraud_status ?? null,
          rawResponse: body,
        })
        .where(eq(payments.id, payment.id));
    }

    const membershipPurchaseUpdate: Partial<
      typeof membershipPurchases.$inferInsert
    > = {
      status:
        states.payment === "PAID"
          ? "PAID"
          : states.payment === "FAILED"
            ? "FAILED"
            : states.payment === "EXPIRED"
              ? "EXPIRED"
              : states.payment === "REFUNDED"
                ? "REFUNDED"
                : "PENDING",
    };

    if (states.payment === "PAID" && purchase.status !== "PAID") {
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

  // ── Enqueue membership receipt email (outside DB transaction) ─────────────
  // jobId = purchase.id so duplicate notifications never produce duplicate jobs.
  if (justActivated) {
    try {
      await enqueueEmail(
        {
          type: "membership-receipt",
          membershipPurchaseId: purchase.id,
          userId: purchase.userId,
        },
        `membership-receipt:${purchase.id}`,
      );
    } catch (err) {
      // Queue failure is non-fatal — the DB state is already correct.
      console.error("[webhook] Failed to enqueue membership-receipt email:", err);
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

  if (
    !hasNotificationShape(body) ||
    !isValidMidtransSignature(body, body.signature_key)
  ) {
    return NextResponse.json(
      { error: "Invalid Midtrans signature" },
      { status: 401 },
    );
  }

  // Route membership notifications.
  if (body.order_id.startsWith("MBR-")) {
    return handleMembershipWebhook(body);
  }

  // ── Product-order branch ──────────────────────────────────────────────────
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, body.order_id))
    .limit(1);

  if (!order || Number(order.total) !== Number(body.gross_amount)) {
    return NextResponse.json(
      { error: "Order not found or amount does not match" },
      { status: 404 },
    );
  }

  const states = notificationStates(body);
  const timestamp = body.transaction_time
    ? new Date(body.transaction_time)
    : new Date();

  let justPaid = false;

  await db.transaction(async (tx) => {
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id))
      .limit(1);

    if (!payment) throw new Error("Payment record not found");

    if (payment.status === "PAID" && states.payment === "PENDING") return;

    await tx
      .update(payments)
      .set({
        midtransTransactionId: body.transaction_id,
        paymentType: body.payment_type,
        paymentMethod: body.payment_type,
        status: states.payment,
        transactionTime: timestamp,
        settlementTime: states.payment === "PAID" ? timestamp : null,
        fraudStatus: body.fraud_status ?? null,
        rawResponse: body,
      })
      .where(and(eq(payments.orderId, order.id), eq(payments.id, payment.id)));

    await tx
      .update(orders)
      .set({
        status: states.order,
        paidAt: states.order === "PAID" ? timestamp : order.paidAt,
        cancelledAt:
          states.order === "CANCELLED" ? timestamp : order.cancelledAt,
      })
      .where(eq(orders.id, order.id));

    if (states.order === "PAID" && order.status !== "PAID") {
      justPaid = true;
    }
  });

  // ── Enqueue order-receipt email (outside DB transaction) ──────────────────
  // jobId = order.id so duplicate webhook notifications never produce
  // duplicate emails — BullMQ deduplicates jobs with the same jobId.
  if (justPaid) {
    try {
      await enqueueEmail(
        { type: "order-receipt", orderId: order.id },
        `order-receipt:${order.id}`,
      );
    } catch (err) {
      // Queue failure is non-fatal — the DB state is already correct.
      console.error("[webhook] Failed to enqueue order-receipt email:", err);
    }
  }

  return NextResponse.json({ received: true });
}
