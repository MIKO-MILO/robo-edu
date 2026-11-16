/**
 * Behavior tests for ticket 04:
 *   POST /api/orders/[id]/payment/retry
 *   GET  /api/orders/[id]/payment
 *
 * Pattern (follows webhook-core-api.test.ts):
 *   - Call real route handlers against the real test DB (reset + reseeded
 *     per test via tests/setup.ts).
 *   - Mock chargeCoreApi and cancelCoreApi so tests run without a live
 *     Midtrans sandbox.
 *   - Auth via real HMAC-signed session cookie (setSessionCookie).
 *
 * Covered acceptance criteria:
 *   1. POST cancels an existing PENDING attempt before charging (cancelCoreApi called)
 *   2. midtrans_order_id is unique per attempt (never reused)
 *   3. Attempt 6 is rejected with MAX_ATTEMPTS_REACHED
 *   4. Expired order returns 409 ORDER_EXPIRED
 *   5. Same Idempotency-Key on second call returns existing attempt (no double-charge)
 *   6. Previous PENDING attempt is marked FAILED after successful retry
 *   7. GET returns payment_instruction, payment_channel, expiry_time, order.expires_at
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { POST as retryHandler } from "@/app/api/orders/[id]/payment/retry/route";
import { GET as paymentHandler } from "@/app/api/orders/[id]/payment/route";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import type { PaymentInstruction } from "@/src/lib/payments/midtrans";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockChargeCoreApi, mockCancelCoreApi } = vi.hoisted(() => ({
  mockChargeCoreApi: vi.fn(),
  mockCancelCoreApi: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/src/lib/payments/midtrans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/payments/midtrans")>();
  return {
    ...original,
    chargeCoreApi: mockChargeCoreApi,
    cancelCoreApi: mockCancelCoreApi,
  };
});

// ── Default mock implementations ──────────────────────────────────────────────

const MOCK_INSTRUCTION: PaymentInstruction = {
  type: "va",
  bank_code: "BCA",
  va_number: "1234567890",
};

function mockChargeSuccess() {
  mockChargeCoreApi.mockResolvedValue({
    instruction: MOCK_INSTRUCTION,
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    transactionStatus: "pending",
    raw: { status_code: "201", transaction_status: "pending" },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function asUser(userId: string = FIXTURE_IDS.regularUser) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

function retryRequest(
  orderId: string,
  body: object,
  idempotencyKey?: string,
): NextRequest {
  return new NextRequest(
    `http://localhost/api/orders/${orderId}/payment/retry`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        cookie: `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.regularUser, false)}`,
      },
      body: JSON.stringify(body),
    },
  );
}

function paymentGetRequest(orderId: string): NextRequest {
  return new NextRequest(`http://localhost/api/orders/${orderId}/payment`, {
    method: "GET",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.regularUser, false)}`,
    },
  });
}

type RouteParams = { params: Promise<{ id: string }> };

function params(id: string): RouteParams {
  return { params: Promise.resolve({ id }) };
}

/** Reset the fixture payment row to a known PENDING state before each test. */
async function resetPaymentToPending() {
  await testDb()
    .update(schema.payments)
    .set({ status: "PENDING", paymentInstruction: null })
    .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
  await testDb()
    .update(schema.orders)
    .set({ status: "PENDING" })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));
}

/** Seed N extra FAILED payment attempts onto the fixture order. */
async function seedExtraAttempts(count: number, startAttempt = 2) {
  for (let i = 0; i < count; i++) {
    const n = startAttempt + i;
    await testDb().insert(schema.payments).values({
      id: crypto.randomUUID(),
      orderId: FIXTURE_IDS.order,
      midtransOrderId: `TEST-ORD-1-EXTRA-${n}`,
      attemptNumber: n,
      paymentType: "bank_transfer",
      status: "FAILED",
      amount: "215000.00",
    });
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockChargeCoreApi.mockReset();
  mockCancelCoreApi.mockReset();
  mockCancelCoreApi.mockResolvedValue(undefined);
});

// ── POST /payment/retry ───────────────────────────────────────────────────────

describe("POST /api/orders/[id]/payment/retry", () => {
  describe("authentication", () => {
    it("returns 401 for an unauthenticated request", async () => {
      const req = new NextRequest(
        `http://localhost/api/orders/${FIXTURE_IDS.order}/payment/retry`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paymentChannel: "bca_va" }),
        },
      );
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(401);
    });

    it("returns 404 when order belongs to a different user", async () => {
      mockChargeSuccess();
      await resetPaymentToPending();
      asUser(FIXTURE_IDS.memberUser);

      const req = new NextRequest(
        `http://localhost/api/orders/${FIXTURE_IDS.order}/payment/retry`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie: `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.memberUser, false)}`,
          },
          body: JSON.stringify({ paymentChannel: "bca_va" }),
        },
      );
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(404);
    });
  });

  describe("validation guards", () => {
    it("returns 409 ORDER_ALREADY_PAID when order is PAID", async () => {
      await resetPaymentToPending();
      await testDb()
        .update(schema.orders)
        .set({ status: "PAID" })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(409);
      expect((await res.json()).code).toBe("ORDER_ALREADY_PAID");
    });

    it("returns 409 ORDER_EXPIRED when order.expires_at has passed", async () => {
      await resetPaymentToPending();
      // Set expires_at to the past
      await testDb()
        .update(schema.orders)
        .set({ expiresAt: new Date("2020-01-01T00:00:00Z") })
        .where(eq(schema.orders.id, FIXTURE_IDS.order));

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(409);
      expect((await res.json()).code).toBe("ORDER_EXPIRED");
    });

    it("returns 422 MAX_ATTEMPTS_REACHED on attempt 6", async () => {
      await resetPaymentToPending();
      // Seed 4 extra FAILED attempts (total = 5 existing when we try attempt 6)
      await seedExtraAttempts(4);

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.code).toBe("MAX_ATTEMPTS_REACHED");
      // No charge should have been attempted
      expect(mockChargeCoreApi).not.toHaveBeenCalled();
    });

    it("returns 400 when paymentChannel is missing", async () => {
      await resetPaymentToPending();
      const req = retryRequest(FIXTURE_IDS.order, { paymentMethod: "bank_transfer" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(400);
    });
  });

  describe("successful retry", () => {
    beforeEach(resetPaymentToPending);

    it("creates a new payment attempt with a unique midtrans_order_id", async () => {
      mockChargeSuccess();

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bni_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.payment.payment_channel).toBe("bni_va");

      // New attempt has attempt_number = 2
      expect(json.data.payment.attempt_number).toBe(2);

      // midtrans_order_id should contain attempt number and be unique
      const allAttempts = await testDb()
        .select({ midtransOrderId: schema.payments.midtransOrderId })
        .from(schema.payments)
        .where(eq(schema.payments.orderId, FIXTURE_IDS.order));

      const ids = allAttempts.map((p) => p.midtransOrderId);
      // All IDs must be unique
      expect(new Set(ids).size).toBe(ids.length);
      // New attempt ID includes "-2"
      expect(ids.some((id) => id.includes("-2"))).toBe(true);
      // Original attempt ID is still there
      expect(ids).toContain("TEST-MORD-1");
    });

    it("marks the previous PENDING attempt as FAILED after a successful retry", async () => {
      mockChargeSuccess();

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "gopay" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(200);

      // The original fixture payment should now be FAILED
      const [oldPayment] = await testDb()
        .select({ status: schema.payments.status })
        .from(schema.payments)
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
        .limit(1);

      expect(oldPayment?.status).toBe("FAILED");
    });

    it("calls cancelCoreApi with the old midtrans_order_id when previous attempt is PENDING", async () => {
      mockChargeSuccess();

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "gopay" });
      await retryHandler(req, params(FIXTURE_IDS.order));

      expect(mockCancelCoreApi).toHaveBeenCalledOnce();
      expect(mockCancelCoreApi).toHaveBeenCalledWith("TEST-MORD-1");
    });

    it("does NOT call cancelCoreApi when previous attempt is already FAILED", async () => {
      mockChargeSuccess();
      // Mark existing payment as FAILED (not PENDING)
      await testDb()
        .update(schema.payments)
        .set({ status: "FAILED" })
        .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      await retryHandler(req, params(FIXTURE_IDS.order));

      expect(mockCancelCoreApi).not.toHaveBeenCalled();
    });

    it("stores payment_instruction on the new payment row", async () => {
      mockChargeSuccess();

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      await retryHandler(req, params(FIXTURE_IDS.order));

      const [newPayment] = await testDb()
        .select({ paymentInstruction: schema.payments.paymentInstruction, attemptNumber: schema.payments.attemptNumber })
        .from(schema.payments)
        .where(eq(schema.payments.orderId, FIXTURE_IDS.order))
        .orderBy(schema.payments.attemptNumber)
        .then((rows) => rows.slice(-1)); // last row = highest attempt

      expect(newPayment?.paymentInstruction).toMatchObject({
        type: "va",
        bank_code: "BCA",
        va_number: "1234567890",
      });
    });

    it("includes order.expires_at in the response", async () => {
      mockChargeSuccess();

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      const json = await res.json();

      expect(json.data.order).toHaveProperty("expires_at");
    });

    it("marks the new payment row FAILED and returns 502 when charge throws", async () => {
      mockChargeCoreApi.mockRejectedValue(new Error("Midtrans timeout"));

      const req = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" });
      const res = await retryHandler(req, params(FIXTURE_IDS.order));
      expect(res.status).toBe(502);
      const json = await res.json();
      expect(json.code).toBe("PAYMENT_CHARGE_FAILED");

      // The new attempt row should be FAILED
      const failedAttempts = await testDb()
        .select({ status: schema.payments.status, attemptNumber: schema.payments.attemptNumber })
        .from(schema.payments)
        .where(eq(schema.payments.orderId, FIXTURE_IDS.order));

      const attempt2 = failedAttempts.find((p) => p.attemptNumber === 2);
      expect(attempt2?.status).toBe("FAILED");
    });
  });

  describe("idempotency", () => {
    beforeEach(resetPaymentToPending);

    it("returns the same attempt on a duplicate request with the same Idempotency-Key", async () => {
      mockChargeSuccess();

      const key = `idem-${crypto.randomUUID()}`;
      const req1 = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" }, key);
      const res1 = await retryHandler(req1, params(FIXTURE_IDS.order));
      expect(res1.status).toBe(200);
      const data1 = (await res1.json()).data;

      // Second call with same key — charge should NOT be called again
      mockChargeCoreApi.mockReset();
      const req2 = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" }, key);
      const res2 = await retryHandler(req2, params(FIXTURE_IDS.order));
      expect(res2.status).toBe(200);

      expect(mockChargeCoreApi).not.toHaveBeenCalled();

      const data2 = (await res2.json()).data;
      expect(data2.payment.id).toBe(data1.payment.id);
      expect(data2.payment.attempt_number).toBe(data1.payment.attempt_number);
    });

    it("creates a new attempt when the Idempotency-Key is different", async () => {
      mockChargeSuccess();

      const req1 = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bca_va" }, "key-A");
      const res1 = await retryHandler(req1, params(FIXTURE_IDS.order));
      expect(res1.status).toBe(200);
      const id1 = (await res1.json()).data.payment.id;

      mockChargeSuccess(); // reset for second call
      const req2 = retryRequest(FIXTURE_IDS.order, { paymentChannel: "bni_va" }, "key-B");
      const res2 = await retryHandler(req2, params(FIXTURE_IDS.order));
      expect(res2.status).toBe(200);
      const id2 = (await res2.json()).data.payment.id;

      expect(id1).not.toBe(id2);
      expect(mockChargeCoreApi).toHaveBeenCalledTimes(2);
    });
  });
});

// ── GET /api/orders/[id]/payment ──────────────────────────────────────────────

describe("GET /api/orders/[id]/payment", () => {
  it("returns 401 for unauthenticated request", async () => {
    const req = new NextRequest(
      `http://localhost/api/orders/${FIXTURE_IDS.order}/payment`,
      { method: "GET" },
    );
    const res = await paymentHandler(req, params(FIXTURE_IDS.order));
    expect(res.status).toBe(401);
  });

  it("returns 404 for an order belonging to another user", async () => {
    const req = new NextRequest(
      `http://localhost/api/orders/${FIXTURE_IDS.order}/payment`,
      {
        method: "GET",
        headers: {
          cookie: `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.memberUser, false)}`,
        },
      },
    );
    const res = await paymentHandler(req, params(FIXTURE_IDS.order));
    expect(res.status).toBe(404);
  });

  it("returns order + latest payment attempt with all required fields", async () => {
    // Seed a payment_instruction into the fixture payment
    await testDb()
      .update(schema.payments)
      .set({
        paymentInstruction: { type: "va", bank_code: "BCA", va_number: "9876543210" },
        paymentChannel: "bca_va",
        expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        status: "PENDING",
      })
      .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));

    const req = paymentGetRequest(FIXTURE_IDS.order);
    const res = await paymentHandler(req, params(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    // Order fields
    expect(json.data.order).toHaveProperty("expires_at");
    expect(json.data.order.id).toBe(FIXTURE_IDS.order);
    expect(json.data.order.status).toBe("PENDING");

    // Payment fields
    const p = json.data.payment;
    expect(p).not.toBeNull();
    expect(p.payment_instruction).toMatchObject({ type: "va", bank_code: "BCA" });
    expect(p.payment_channel).toBe("bca_va");
    expect(p.expiry_time).toBeTruthy();
    expect(p.status).toBe("PENDING");
    expect(p.attempt_number).toBe(1);
  });

  it("returns null payment when no payment row exists", async () => {
    // Insert a fresh order with no payment
    const freshOrderId = crypto.randomUUID();
    await testDb().insert(schema.orders).values({
      id: freshOrderId,
      orderNumber: "TEST-ORD-NO-PAY",
      userId: FIXTURE_IDS.regularUser,
      addressId: FIXTURE_IDS.address,
      subtotal: "100000.00",
      discountAmount: "0",
      taxAmount: "0",
      shippingCost: "10000.00",
      total: "110000.00",
      status: "PENDING",
      recipientName: "Regular User",
      recipientPhone: "08120000002",
      shippingAddress: "Jl. Test No. 2",
      shippingProvince: "DKI Jakarta",
      shippingCity: "Jakarta Selatan",
      shippingDistrict: "Kebayoran",
      shippingVillage: "Test Village",
      shippingPostalCode: "12345",
    });

    const req = paymentGetRequest(freshOrderId);
    const res = await paymentHandler(req, params(freshOrderId));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.payment).toBeNull();
  });

  it("returns the latest attempt (highest attempt_number) when multiple exist", async () => {
    // Seed a second attempt (attempt_number = 2) on the fixture order
    const attempt2Id = crypto.randomUUID();
    await testDb().insert(schema.payments).values({
      id: attempt2Id,
      orderId: FIXTURE_IDS.order,
      midtransOrderId: "TEST-ORD-1-2",
      attemptNumber: 2,
      paymentType: "gopay",
      paymentChannel: "gopay",
      paymentInstruction: { type: "qr", qr_string: "mock-qr", deeplink_url: "" },
      status: "PENDING",
      amount: "215000.00",
    });

    const req = paymentGetRequest(FIXTURE_IDS.order);
    const res = await paymentHandler(req, params(FIXTURE_IDS.order));
    const json = await res.json();

    expect(json.data.payment.attempt_number).toBe(2);
    expect(json.data.payment.payment_channel).toBe("gopay");
    expect(json.data.payment.payment_instruction).toMatchObject({ type: "qr" });
  });
});
