/**
 * Behavior tests for ticket 05: Webhook Core API
 *
 * Tests the RE- (product order) branch of POST /api/payments/midtrans/webhook.
 *
 * Covered criteria:
 *   1. Lookup by payments.midtrans_order_id (not orders.order_number)
 *   2. settlement / capture+accept → payment PAID, order PAID, receipt email enqueued
 *   3. capture+challenge → payment stays PENDING, Sentry alert fired
 *   4. deny/cancel/failure → payment FAILED, order CANCELLED
 *   5. expire → payment EXPIRED, order CANCELLED
 *   6. Webhook PAID for CANCELLED order → payment PAID, order stays CANCELLED, Sentry alert
 *   7. Chargeback → audit_log row inserted, Sentry alert, order unchanged
 *   8. Idempotency: duplicate settlement → email sent exactly once
 *   9. Invalid signature → 401
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { POST as webhookHandler } from "@/app/api/payments/midtrans/webhook/route";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── Mock: BullMQ enqueueEmail ─────────────────────────────────────────────────
const { mockEnqueueEmail } = vi.hoisted(() => ({
  mockEnqueueEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/src/lib/queue/email-queue", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/queue/email-queue")>();
  return { ...original, enqueueEmail: mockEnqueueEmail };
});

// ── Mock: Sentry ──────────────────────────────────────────────────────────────
const { mockSentryCaptureMessage } = vi.hoisted(() => ({
  mockSentryCaptureMessage: vi.fn(),
}));
vi.mock("@sentry/nextjs", () => ({
  captureMessage: mockSentryCaptureMessage,
  captureException: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a Midtrans-style webhook body for a product-order notification.
 * Uses the same SHA-512 signature algorithm as the real validator.
 */
function makeOrderWebhookBody(overrides: {
  order_id: string;
  gross_amount: string;
  transaction_status?: string;
  payment_type?: string;
  transaction_id?: string;
  fraud_status?: string;
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "test-server-key";
  const status_code = "200";
  const {
    order_id,
    gross_amount,
    transaction_status = "settlement",
    payment_type = "bank_transfer",
    transaction_id = `TX-${crypto.randomUUID().slice(0, 8)}`,
    fraud_status,
  } = overrides;

  const signature_key = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  const body: Record<string, unknown> = {
    order_id,
    status_code,
    gross_amount,
    transaction_id,
    transaction_status,
    payment_type,
    signature_key,
    transaction_time: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
  if (fraud_status) body.fraud_status = fraud_status;
  return body;
}

function webhookRequest(body: unknown): Request {
  return new Request("http://localhost/api/payments/midtrans/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** midtrans_order_id stored in fixture payment is "TEST-MORD-1" */
const FIXTURE_MIDTRANS_ORDER_ID = "TEST-MORD-1";
/** gross_amount must match fixture payment.amount = "215000.00" */
const FIXTURE_GROSS_AMOUNT = "215000.00";

/** Reset mocks before each test (resetData() is called by global beforeEach). */
beforeEach(() => {
  mockEnqueueEmail.mockClear();
  mockSentryCaptureMessage.mockClear();
});

// ── Test suites ───────────────────────────────────────────────────────────────

describe("POST /api/payments/midtrans/webhook — RE- (product order) branch", () => {

  // ── Signature validation ───────────────────────────────────────────────────

  describe("signature validation", () => {
    it("returns 401 for an invalid signature", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
      });
      (body as Record<string, unknown>).signature_key = "invalid-sig";

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/signature/i);
    });

    it("returns 401 when signature_key field is missing entirely", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
      });
      delete (body as Record<string, unknown>).signature_key;

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(401);
    });
  });

  // ── Lookup by midtrans_order_id ────────────────────────────────────────────

  describe("lookup by midtrans_order_id", () => {
    it("finds payment by midtrans_order_id (not order_number)", async () => {
      // The fixture payment has midtrans_order_id = "TEST-MORD-1"
      // The order's orderNumber = "TEST-ORD-1" (different value)
      // If lookup were by orderNumber, sending "TEST-MORD-1" would return 404.
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
      });

      // Fixture payment is already at "settlement" (terminal) — still returns 200 idempotently.
      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);
    });

    it("returns 404 when midtrans_order_id does not exist", async () => {
      const body = makeOrderWebhookBody({
        order_id: "RE-NONEXISTENT-9999",
        gross_amount: "215000.00",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(404);
    });
  });

  // ── Status transitions ─────────────────────────────────────────────────────

  describe("settlement → PAID", () => {
    beforeEach(async () => {
      // Reset fixture payment to PENDING so the transition can be tested.
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PENDING" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("sets payment.status = PAID and order.status = PAID on settlement", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);
      expect((await res.json()).received).toBe(true);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PAID");

      const [order] = await testDb()
        .select({ status: schema.orders.status, paidAt: schema.orders.paidAt })
        .from(schema.orders)
        .where(eq(schema.orders.id, FIXTURE_IDS.order))
        .limit(1);
      expect(order!.status).toBe("PAID");
      expect(order!.paidAt).not.toBeNull();
    });

    it("enqueues an order-receipt email on PAID transition", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      await webhookHandler(webhookRequest(body));

      expect(mockEnqueueEmail).toHaveBeenCalledOnce();
      const [jobData, jobId] = mockEnqueueEmail.mock.calls[0]!;
      expect(jobData).toMatchObject({ type: "order-receipt", orderId: FIXTURE_IDS.order });
      expect(typeof jobId).toBe("string");
      // jobId must be stable (payment-scoped, not order-scoped, for multi-attempt support)
      expect(jobId).toMatch(/^order-receipt-/);
    });

    it("sets payment.status = PAID on capture + fraud_status=accept", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "capture",
        fraud_status: "accept",
      });

      await webhookHandler(webhookRequest(body));

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PAID");
    });
  });

  describe("capture + fraud_status=challenge → PENDING + Sentry alert", () => {
    beforeEach(async () => {
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PENDING" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("does not change payment status on fraud challenge", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "capture",
        fraud_status: "challenge",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PENDING");
    });

    it("fires a Sentry alert on fraud challenge", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "capture",
        fraud_status: "challenge",
      });

      await webhookHandler(webhookRequest(body));

      expect(mockSentryCaptureMessage).toHaveBeenCalledOnce();
      const [msg] = mockSentryCaptureMessage.mock.calls[0]!;
      expect(msg).toMatch(/fraud/i);
    });

    it("does not enqueue a receipt email on fraud challenge", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "capture",
        fraud_status: "challenge",
      });

      await webhookHandler(webhookRequest(body));
      expect(mockEnqueueEmail).not.toHaveBeenCalled();
    });
  });

  describe("deny / cancel / failure → FAILED", () => {
    beforeEach(async () => {
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PENDING" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    for (const transaction_status of ["deny", "cancel", "failure"] as const) {
      it(`sets payment.status = FAILED on ${transaction_status}`, async () => {
        const body = makeOrderWebhookBody({
          order_id: FIXTURE_MIDTRANS_ORDER_ID,
          gross_amount: FIXTURE_GROSS_AMOUNT,
          transaction_status,
        });

        const res = await webhookHandler(webhookRequest(body));
        expect(res.status).toBe(200);

        const [payment] = await testDb()
          .select({ status: schema.payments.status })
          .from(schema.payments)
          .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
          .limit(1);
        expect(payment!.status).toBe("FAILED");
      });
    }
  });

  describe("expire → EXPIRED", () => {
    beforeEach(async () => {
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PENDING" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("sets payment.status = EXPIRED on expire", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "expire",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("EXPIRED");
    });
  });

  // ── Special scenarios ──────────────────────────────────────────────────────

  describe("PAID webhook for CANCELLED order", () => {
    beforeEach(async () => {
      // Set payment to PENDING, order to CANCELLED (simulates: user cancelled after paying)
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "CANCELLED" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("sets payment.status = PAID but keeps order.status = CANCELLED", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PAID");

      const [order] = await testDb()
        .select({ status: schema.orders.status })
        .from(schema.orders)
        .where(eq(schema.orders.id, FIXTURE_IDS.order))
        .limit(1);
      expect(order!.status).toBe("CANCELLED");
    });

    it("fires a Sentry alert for manual refund", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      await webhookHandler(webhookRequest(body));

      expect(mockSentryCaptureMessage).toHaveBeenCalledOnce();
      const [msg] = mockSentryCaptureMessage.mock.calls[0]!;
      expect(msg).toMatch(/refund/i);
    });
  });

  describe("chargeback", () => {
    beforeEach(async () => {
      await testDb()
        .update(schema.payments)
        .set({ status: "PAID" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PAID" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("does not change order or payment status on chargeback", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "chargeback",
      });

      const res = await webhookHandler(webhookRequest(body));
      expect(res.status).toBe(200);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PAID");

      const [order] = await testDb()
        .select({ status: schema.orders.status })
        .from(schema.orders)
        .where(eq(schema.orders.id, FIXTURE_IDS.order))
        .limit(1);
      expect(order!.status).toBe("PAID");
    });

    it("inserts an audit_log row on chargeback", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "chargeback",
      });

      await webhookHandler(webhookRequest(body));

      const logs = await testDb()
        .select()
        .from(schema.auditLogs)
        .where(eq(schema.auditLogs.action, "payment.chargeback"));

      expect(logs.length).toBeGreaterThanOrEqual(1);
      const log = logs[0]!;
      expect(log.targetType).toBe("payment");
      expect(log.targetId).toBe(FIXTURE_IDS.orderPayment);
    });

    it("fires a Sentry alert on chargeback", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "chargeback",
      });

      await webhookHandler(webhookRequest(body));

      expect(mockSentryCaptureMessage).toHaveBeenCalledOnce();
      const [msg] = mockSentryCaptureMessage.mock.calls[0]!;
      expect(msg).toMatch(/chargeback/i);
    });
  });

  // ── Idempotency ────────────────────────────────────────────────────────────

  describe("idempotency", () => {
    beforeEach(async () => {
      await testDb()
        .update(schema.payments)
        .set({ status: "PENDING" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
      await testDb()
        .update(schema.orders)
        .set({ status: "PENDING" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));
    });

    it("sending the same settlement notification twice enqueues the receipt email only once", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      // First notification.
      const res1 = await webhookHandler(webhookRequest(body));
      expect(res1.status).toBe(200);

      // Second identical notification (Midtrans retry).
      const res2 = await webhookHandler(webhookRequest(body));
      expect(res2.status).toBe(200);

      // Email must have been enqueued exactly once.
      expect(mockEnqueueEmail).toHaveBeenCalledOnce();
    });

    it("sending the same settlement notification twice does not update payment twice", async () => {
      const body = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });

      await webhookHandler(webhookRequest(body));
      await webhookHandler(webhookRequest(body));

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      // Status should still be PAID — not regressed or duplicated.
      expect(payment!.status).toBe("PAID");
    });

    it("a PENDING notification after PAID does not downgrade payment to PENDING", async () => {
      // First: settle the payment.
      const settlementBody = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "settlement",
      });
      await webhookHandler(webhookRequest(settlementBody));

      // Then: a spurious PENDING notification arrives (e.g. delayed status update).
      const pendingBody = makeOrderWebhookBody({
        order_id: FIXTURE_MIDTRANS_ORDER_ID,
        gross_amount: FIXTURE_GROSS_AMOUNT,
        transaction_status: "pending",
      });
      const res = await webhookHandler(webhookRequest(pendingBody));
      expect(res.status).toBe(200);

      const [payment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);
      expect(payment!.status).toBe("PAID");
    });
  });
});
