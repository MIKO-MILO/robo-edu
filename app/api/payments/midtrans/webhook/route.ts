import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, orderItems, orders, payments, users } from "@/src/db/schema";
import {
  isValidMidtransSignature,
  type MidtransNotification,
} from "@/src/lib/payments/midtrans";
import { sendEmail } from "@/src/lib/email/send";
import {
  orderConfirmationEmailSubject,
  orderConfirmationEmailHtml,
} from "@/src/lib/email/templates/order-confirmation";
import { getAppUrl } from "@/src/lib/email/resend";

export const runtime = "nodejs";

type PaymentState = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
type OrderState = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

function notificationStates(notification: MidtransNotification): { payment: PaymentState; order: OrderState } {
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

function hasNotificationShape(value: unknown): value is MidtransNotification & { signature_key: string } {
  if (!value || typeof value !== "object") return false;
  const notification = value as Record<string, unknown>;
  return ["order_id", "status_code", "gross_amount", "transaction_id", "transaction_status", "payment_type", "signature_key"].every(
    (key) => typeof notification[key] === "string",
  );
}

/**
 * Sends the order confirmation email after a successful payment.
 * Runs after the DB transaction commits — failures are logged but never
 * propagate back to Midtrans (which would cause a retry storm).
 */
async function sendOrderConfirmationEmail(
  order: typeof orders.$inferSelect,
  paidAt: Date,
): Promise<void> {
  try {
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    if (!user) return;

    const items = await db
      .select({
        productNameSnapshot: orderItems.productNameSnapshot,
        variantNameSnapshot: orderItems.variantNameSnapshot,
        quantity: orderItems.quantity,
        priceSnapshot: orderItems.priceSnapshot,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    await sendEmail({
      to: user.email,
      subject: orderConfirmationEmailSubject(order.orderNumber),
      html: orderConfirmationEmailHtml({
        recipientName: order.recipientName,
        orderNumber: order.orderNumber,
        orderId: order.id,
        items: items.map((item) => ({
          productNameSnapshot: item.productNameSnapshot,
          variantNameSnapshot: item.variantNameSnapshot ?? "",
          quantity: item.quantity,
          priceSnapshot: Number(item.priceSnapshot),
          subtotal: Number(item.subtotal),
        })),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingProvince: order.shippingProvince,
        shippingPostalCode: order.shippingPostalCode,
        paidAt,
        appUrl: getAppUrl(),
      }),
      type: "RECEIPT",
      userId: order.userId,
      orderId: order.id,
    });
  } catch (err) {
    console.error("[webhook] Failed to send order confirmation email:", err);
  }
}

// ── Membership webhook branch ────────────────────────────────────────────────

/**
 * Add `months` calendar months to `date` without day-overflow.
 *
 * JavaScript's `Date.setMonth()` rolls over when the source day doesn't exist
 * in the target month (e.g. Jan 31 + 1 → Mar 3 instead of Feb 28). This helper
 * clamps to the last valid day of the target month instead.
 *
 * @example
 *   addMonthsSafe(new Date("2026-01-31"), 1) → 2026-02-28  (not Mar 3)
 *   addMonthsSafe(new Date("2026-03-31"), 1) → 2026-04-30  (not May 1)
 *   addMonthsSafe(new Date("2026-02-28"), 12) → 2027-02-28 (normal case)
 */
function addMonthsSafe(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12; // handle negative mod
  // Last day of the target month
  const lastDayOfTarget = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  result.setFullYear(targetYear, normalizedMonth, Math.min(result.getDate(), lastDayOfTarget));
  return result;
}

/**
 * Handle a Midtrans notification whose order_id starts with "MBR-".
 *
 * On success:
 *   - updates `payments` row (status, transactionId, paymentType, timestamps)
 *   - updates `membership_purchase` row (status, paidAt, startsAt, endsAt)
 *   - sets `users.membership_status = "MEMBER"` and computes `membership_expires_at`
 *
 * Idempotent: if the purchase is already PAID a duplicate PAID notification is
 * accepted silently (returns 200). A PENDING notification after PAID is discarded
 * (no downgrade).
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
  const timestamp = body.transaction_time ? new Date(body.transaction_time) : new Date();

  // Idempotency guard: if already PAID, accept silently and return.
  if (purchase.status === "PAID" && states.payment === "PAID") {
    return NextResponse.json({ received: true });
  }

  await db.transaction(async (tx) => {
    // Lookup the payment row via the membership_purchase_id back-link.
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.membershipPurchaseId, purchase.id))
      .limit(1);

    if (payment) {
      // No downgrade: ignore a PENDING notification if already PAID.
      if (payment.status === "PAID" && states.payment === "PENDING") return;

      await tx
        .update(payments)
        .set({
          transactionId: body.transaction_id,
          paymentType: body.payment_type,
          status: states.payment,
          transactionTime: timestamp,
          settlementTime: states.payment === "PAID" ? timestamp : null,
          fraudStatus: body.fraud_status ?? null,
          rawResponse: body,
        })
        .where(eq(payments.id, payment.id));
    }

    const membershipPurchaseUpdate: Partial<typeof membershipPurchases.$inferInsert> = {
      status: states.payment === "PAID" ? "PAID"
        : states.payment === "FAILED" ? "FAILED"
        : states.payment === "EXPIRED" ? "EXPIRED"
        : states.payment === "REFUNDED" ? "REFUNDED"
        : "PENDING",
    };

    if (states.payment === "PAID" && purchase.status !== "PAID") {
      const startsAt = timestamp;

      // Add months safely — JavaScript's setMonth() has a day-overflow bug:
      // Jan 31 + 1 month → Mar 3 instead of Feb 28.
      // We clamp to the last day of the target month to avoid this.
      const endsAt = addMonthsSafe(startsAt, purchase.durationMonthsSnapshot);

      membershipPurchaseUpdate.paidAt = startsAt;
      membershipPurchaseUpdate.startsAt = startsAt;
      membershipPurchaseUpdate.endsAt = endsAt;

      // Activate (or extend) membership on the user.
      // If the user is already an active MEMBER, extend from their current
      // expiry — do NOT overwrite with a value computed from `now`, which
      // would lose the remaining time on the current subscription.
      const [currentUser] = await tx
        .select({ membershipStatus: users.membershipStatus, membershipExpiresAt: users.membershipExpiresAt })
        .from(users)
        .where(eq(users.id, purchase.userId))
        .limit(1);

      let finalExpiresAt = endsAt;
      if (
        currentUser?.membershipStatus === "MEMBER" &&
        currentUser.membershipExpiresAt &&
        new Date(currentUser.membershipExpiresAt) > startsAt
      ) {
        // Active member renewing early: extend from their current expiry,
        // not from now, so they don't lose remaining days.
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

      // Keep endsAt on the purchase in sync with what we wrote to the user.
      membershipPurchaseUpdate.endsAt = finalExpiresAt;
    }

    await tx
      .update(membershipPurchases)
      .set(membershipPurchaseUpdate)
      .where(eq(membershipPurchases.id, purchase.id));
  });

  return NextResponse.json({ received: true });
}

// ── Main webhook handler ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!hasNotificationShape(body) || !isValidMidtransSignature(body, body.signature_key)) {
    return NextResponse.json({ error: "Invalid Midtrans signature" }, { status: 401 });
  }

  // Route to the membership branch when the order_id starts with "MBR-".
  if (body.order_id.startsWith("MBR-")) {
    return handleMembershipWebhook(body);
  }

  // ── Product-order branch (original logic) ──────────────────────────────
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, body.order_id)).limit(1);
  if (!order || Number(order.total) !== Number(body.gross_amount)) {
    return NextResponse.json({ error: "Order not found or amount does not match" }, { status: 404 });
  }

  const states = notificationStates(body);
  const timestamp = body.transaction_time ? new Date(body.transaction_time) : new Date();

  let justPaid = false;

  await db.transaction(async (tx) => {
    const [payment] = await tx.select().from(payments).where(eq(payments.orderId, order.id)).limit(1);
    if (!payment) throw new Error("Payment record not found");

    if (payment.status === "PAID" && states.payment === "PENDING") return;

    await tx
      .update(payments)
      .set({
        transactionId: body.transaction_id,
        paymentType: body.payment_type,
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
        cancelledAt: states.order === "CANCELLED" ? timestamp : order.cancelledAt,
      })
      .where(eq(orders.id, order.id));

    if (states.order === "PAID" && order.status !== "PAID") {
      justPaid = true;
    }
  });

  if (justPaid) {
    void sendOrderConfirmationEmail(order, timestamp);
  }

  return NextResponse.json({ received: true });
}
