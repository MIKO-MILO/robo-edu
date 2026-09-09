import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orderItems, orders, payments, users } from "@/src/db/schema";
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
    // Fetch the buyer's email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    if (!user) return;

    // Fetch order line items
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
    // Non-fatal — log and continue
    console.error("[webhook] Failed to send order confirmation email:", err);
  }
}

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

  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, body.order_id)).limit(1);
  if (!order || Number(order.total) !== Number(body.gross_amount)) {
    return NextResponse.json({ error: "Order not found or amount does not match" }, { status: 404 });
  }

  const states = notificationStates(body);
  const timestamp = body.transaction_time ? new Date(body.transaction_time) : new Date();

  // Track whether this transition actually marks the order as paid for the
  // first time — used below to decide whether to send the confirmation email.
  let justPaid = false;

  await db.transaction(async (tx) => {
    const [payment] = await tx.select().from(payments).where(eq(payments.orderId, order.id)).limit(1);
    if (!payment) throw new Error("Payment record not found");

    // A late pending notification must never downgrade an already paid order.
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

    // Only send once — when this notification actually transitions to PAID
    // and the order wasn't already paid before.
    if (states.order === "PAID" && order.status !== "PAID") {
      justPaid = true;
    }
  });

  // Send confirmation email outside the DB transaction so a Resend failure
  // cannot roll back the payment status update.
  if (justPaid) {
    void sendOrderConfirmationEmail(order, timestamp);
  }

  return NextResponse.json({ received: true });
}
