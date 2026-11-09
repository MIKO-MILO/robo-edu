/**
 * BullMQ email worker entry point.
 *
 * Run with:
 *   npm run worker
 *
 * This process is separate from the Next.js app server. It connects to Redis,
 * subscribes to the "email" queue, and processes jobs by calling Resend.
 *
 * DO NOT import anything with `import "server-only"` here — this is a plain
 * Node.js process, not a Next.js context.
 */

import "dotenv/config";

import { Worker, type Job } from "bullmq";
import { eq } from "drizzle-orm";

import {
  EMAIL_QUEUE_NAME,
  getRedisConnection,
  type EmailJobData,
} from "@/src/lib/queue/email-queue";
import { sendEmailWorker } from "@/src/lib/email/send-worker";
import {
  orderConfirmationEmailSubject,
  orderConfirmationEmailHtml,
} from "@/src/lib/email/templates/order-confirmation";
import {
  membershipReceiptEmailSubject,
  membershipReceiptEmailHtml,
} from "@/src/lib/email/templates/membership-receipt";

// Import db via a worker-safe path (send-worker.ts already creates its own pool;
// here we need direct DB access to fetch data for email templates).
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/src/db/schema";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error("DATABASE_URL is not configured");

const pool = mysql.createPool({ uri: DB_URL, connectionLimit: 5 });
const db = drizzle(pool, { schema, mode: "default" });

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost").replace(/\/$/, "");

// ── Job handlers ──────────────────────────────────────────────────────────────

async function handleOrderReceipt(orderId: string): Promise<void> {
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);

  if (!order) {
    console.warn(`[worker] order-receipt: order ${orderId} not found — skipping`);
    return;
  }

  const [user] = await db
    .select({ email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, order.userId))
    .limit(1);

  if (!user) {
    console.warn(`[worker] order-receipt: user for order ${orderId} not found — skipping`);
    return;
  }

  const items = await db
    .select({
      productNameSnapshot: schema.orderItems.productNameSnapshot,
      variantNameSnapshot: schema.orderItems.variantNameSnapshot,
      quantity: schema.orderItems.quantity,
      priceSnapshot: schema.orderItems.priceSnapshot,
      subtotal: schema.orderItems.subtotal,
    })
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));

  const paidAt = order.paidAt ?? new Date();

  await sendEmailWorker({
    to: user.email,
    subject: orderConfirmationEmailSubject(order.orderNumber),
    html: orderConfirmationEmailHtml({
      recipientName: order.recipientName,
      orderNumber: order.orderNumber,
      orderId: order.id,
      items: items.map((i) => ({
        productNameSnapshot: i.productNameSnapshot,
        variantNameSnapshot: i.variantNameSnapshot ?? "",
        quantity: i.quantity,
        priceSnapshot: Number(i.priceSnapshot),
        subtotal: Number(i.subtotal),
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
      appUrl: APP_URL,
    }),
    type: "RECEIPT",
    userId: order.userId,
    orderId: order.id,
  });
}

async function handleMembershipReceipt(
  membershipPurchaseId: string,
  userId: string,
): Promise<void> {
  const [purchase] = await db
    .select()
    .from(schema.membershipPurchases)
    .where(eq(schema.membershipPurchases.id, membershipPurchaseId))
    .limit(1);

  if (!purchase) {
    console.warn(`[worker] membership-receipt: purchase ${membershipPurchaseId} not found — skipping`);
    return;
  }

  const [user] = await db
    .select({ email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    console.warn(`[worker] membership-receipt: user ${userId} not found — skipping`);
    return;
  }

  // Get payment method from linked payment row
  const [payment] = await db
    .select({ paymentType: schema.payments.paymentType })
    .from(schema.payments)
    .where(eq(schema.payments.membershipPurchaseId, membershipPurchaseId))
    .limit(1);

  const startsAt = purchase.startsAt ?? purchase.paidAt ?? new Date();
  const endsAt = purchase.endsAt ?? new Date();

  await sendEmailWorker({
    to: user.email,
    subject: membershipReceiptEmailSubject(purchase.purchaseNumber),
    html: membershipReceiptEmailHtml({
      recipientName: user.name,
      purchaseNumber: purchase.purchaseNumber,
      planName: purchase.planNameSnapshot,
      pricePaid: Number(purchase.priceSnapshot),
      durationMonths: purchase.durationMonthsSnapshot,
      startsAt,
      endsAt,
      paymentMethod: payment?.paymentType ?? null,
      appUrl: APP_URL,
    }),
    type: "RECEIPT",
    userId,
    orderId: null,
  });
}

async function handleMembershipReminder(
  membershipPurchaseId: string,
  userId: string,
  type: "membership-reminder-h7" | "membership-reminder-h3",
): Promise<void> {
  const daysLeft = type === "membership-reminder-h7" ? 7 : 3;

  const [user] = await db
    .select({ email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) {
    console.warn(`[worker] ${type}: user ${userId} not found — skipping`);
    return;
  }

  const [purchase] = await db
    .select({ endsAt: schema.membershipPurchases.endsAt })
    .from(schema.membershipPurchases)
    .where(eq(schema.membershipPurchases.id, membershipPurchaseId))
    .limit(1);

  const firstName = user.name.split(" ")[0];
  const expiryDate = purchase?.endsAt
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(purchase.endsAt))
    : "segera";

  const subject =
    daysLeft === 7
      ? `Membership Plus-mu berakhir 7 hari lagi ⏰`
      : `Membership Plus-mu berakhir 3 hari lagi ⚠️`;

  // Minimal plain reminder — ticket 18 can replace with a richer template
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px;">
      <h2 style="color:#111827;">Halo ${firstName}!</h2>
      <p style="color:#374151;">Membership Plus kamu akan <strong>berakhir dalam ${daysLeft} hari</strong> (${expiryDate}).</p>
      <p style="color:#374151;">Perpanjang sekarang agar tidak kehilangan harga khusus member.</p>
      <a href="${APP_URL}/profile/reseller" style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px;">
        Perpanjang Membership
      </a>
    </div>
  `;

  await sendEmailWorker({
    to: user.email,
    subject,
    html,
    type: type === "membership-reminder-h7" ? "OTHER" : "OTHER",
    userId,
    orderId: null,
  });
}

// ── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker<EmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobData>) => {
    const { data } = job;
    console.log(`[worker] Processing job ${job.id} type=${data.type}`);

    switch (data.type) {
      case "order-receipt":
        await handleOrderReceipt(data.orderId);
        break;

      case "membership-receipt":
        await handleMembershipReceipt(data.membershipPurchaseId, data.userId);
        break;

      case "membership-reminder-h7":
      case "membership-reminder-h3":
        await handleMembershipReminder(
          data.membershipPurchaseId,
          data.userId,
          data.type,
        );
        break;

      default: {
        // TypeScript exhaustive check
        const exhaustive: never = data;
        console.warn(`[worker] Unknown job type:`, exhaustive);
      }
    }
  },
  {
    connection: getRedisConnection(),
    concurrency: 3,
  },
);

worker.on("completed", (job) => {
  console.log(`[worker] ✅ Job ${job.id} (${job.data.type}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[worker] ❌ Job ${job?.id} (${job?.data?.type}) failed (attempt ${job?.attemptsMade}):`,
    err.message,
  );
});

console.log(
  `[worker] 🚀 Email worker started — listening on queue "${EMAIL_QUEUE_NAME}"`,
);

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} received — shutting down gracefully...`);
  await worker.close();
  await pool.end();
  console.log("[worker] Shutdown complete.");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
