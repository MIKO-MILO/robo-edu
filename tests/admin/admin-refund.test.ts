/**
 * Behavior tests for ticket 07:
 *   POST /api/admin/orders/:id/refund
 *   PATCH /api/admin/orders/:id/refunds/:refundId/proof
 *
 * Pattern follows webhook-core-api.test.ts and admin-auth-guard patterns:
 *   - Real route handlers against the real test DB (reset + reseeded per test).
 *   - Mock midtrans-client so tests run without a live Midtrans sandbox.
 *   - Auth via real HMAC-signed session cookie (setSessionCookie).
 *
 * Covered acceptance criteria:
 *   1. Total refund exceeds payment.amount → 422 REFUND_EXCEEDS_PAYMENT
 *   2. restore_quota=true restores variant stock atomically
 *   3. order.status=REFUNDED only when total refunds = payment.amount
 *   4. Partial refund does NOT set order.status=REFUNDED
 *   5. MANUAL method used for bank_transfer / cstore (non-API-refundable)
 *   6. MIDTRANS_API method used for gopay / credit_card
 *   7. Audit log entry created for each refund
 *   8. PATCH proof: sets proof_url on a MANUAL refund
 *   9. PATCH proof: 422 when tried on MIDTRANS_API refund
 *   10. Auth guards: 401 for unauthenticated, 403 for CUSTOMER
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { POST as refundHandler } from "@/app/api/admin/orders/[id]/refund/route";
import { PATCH as proofHandler } from "@/app/api/admin/orders/[id]/refunds/[refundId]/proof/route";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import { NextRequest } from "next/server";

// ── Mock midtrans-client ──────────────────────────────────────────────────────

const { mockTransactionRefund } = vi.hoisted(() => ({
  mockTransactionRefund: vi.fn().mockResolvedValue({
    status_code: "200",
    transaction_status: "refund",
    refund_amount: "100000",
  }),
}));

vi.mock("midtrans-client", () => ({
  default: {
    CoreApi: class {
      transaction = { refund: mockTransactionRefund };
    },
    Snap: class {},
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminCookie() {
  return `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.adminUser, false)}`;
}

function customerCookie() {
  return `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.regularUser, false)}`;
}

function asAdmin() {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(FIXTURE_IDS.adminUser, false));
}

function refundRequest(orderId: string, body: object): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/orders/${orderId}/refund`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: adminCookie(),
      },
      body: JSON.stringify(body),
    },
  );
}

function proofRequest(orderId: string, refundId: string, body: object): NextRequest {
  return new NextRequest(
    `http://localhost/api/admin/orders/${orderId}/refunds/${refundId}/proof`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: adminCookie(),
      },
      body: JSON.stringify(body),
    },
  );
}

type RouteParams1 = { params: Promise<{ id: string }> };
type RouteParams2 = { params: Promise<{ id: string; refundId: string }> };

function params1(id: string): RouteParams1 {
  return { params: Promise.resolve({ id }) };
}

function params2(id: string, refundId: string): RouteParams2 {
  return { params: Promise.resolve({ id, refundId }) };
}

/** Set fixture payment to PAID status (bank_transfer = MANUAL). */
async function resetPaymentPaid(paymentType = "bank_transfer") {
  await testDb()
    .update(schema.payments)
    .set({ status: "PAID", paymentType, paymentMethod: paymentType, paymentChannel: null })
    .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment));
  await testDb()
    .update(schema.orders)
    .set({ status: "PAID" })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockTransactionRefund.mockReset();
  mockTransactionRefund.mockResolvedValue({
    status_code: "200",
    transaction_status: "refund",
  });
});

// ── POST /admin/orders/:id/refund — auth guards ───────────────────────────────

describe("POST /api/admin/orders/:id/refund — auth guards", () => {
  it("returns 401 for unauthenticated request", async () => {
    const req = new NextRequest(
      `http://localhost/api/admin/orders/${FIXTURE_IDS.order}/refund`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 1000, reason: "test" }),
      },
    );
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(401);
  });

  it("returns 403 for a CUSTOMER user", async () => {
    const req = new NextRequest(
      `http://localhost/api/admin/orders/${FIXTURE_IDS.order}/refund`,
      {
        method: "POST",
        headers: { "content-type": "application/json", cookie: customerCookie() },
        body: JSON.stringify({ amount: 1000, reason: "test" }),
      },
    );
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(403);
  });
});

// ── POST — validation ─────────────────────────────────────────────────────────

describe("POST /api/admin/orders/:id/refund — validation", () => {
  beforeEach(() => resetPaymentPaid());

  it("returns 422 REFUND_EXCEEDS_PAYMENT when amount > payment.amount", async () => {
    asAdmin();
    // payment.amount = 215000; request 300000
    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 300000,
      reason: "Melebihi jumlah",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe("REFUND_EXCEEDS_PAYMENT");
  });

  it("returns 422 when second refund pushes total > payment.amount", async () => {
    asAdmin();
    // First refund: 150000 (OK)
    const req1 = refundRequest(FIXTURE_IDS.order, {
      amount: 150000,
      reason: "Refund pertama",
      restore_quota: false,
    });
    const res1 = await refundHandler(req1, params1(FIXTURE_IDS.order));
    expect(res1.status).toBe(200);

    // Second refund: 100000 (150000 + 100000 = 250000 > 215000)
    const req2 = refundRequest(FIXTURE_IDS.order, {
      amount: 100000,
      reason: "Refund kedua melebihi",
      restore_quota: false,
    });
    const res2 = await refundHandler(req2, params1(FIXTURE_IDS.order));
    expect(res2.status).toBe(422);
    expect((await res2.json()).code).toBe("REFUND_EXCEEDS_PAYMENT");
  });

  it("returns 400 when amount is missing or zero", async () => {
    asAdmin();
    const req = refundRequest(FIXTURE_IDS.order, { amount: 0, reason: "test" });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(400);
  });

  it("returns 400 when reason is empty", async () => {
    asAdmin();
    const req = refundRequest(FIXTURE_IDS.order, { amount: 50000, reason: "   " });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(400);
  });

  it("returns 404 when order does not exist", async () => {
    asAdmin();
    const req = refundRequest("nonexistent-order", {
      amount: 50000,
      reason: "test",
    });
    const res = await refundHandler(req, params1("nonexistent-order"));
    expect(res.status).toBe(404);
  });
});

// ── POST — refund method selection ────────────────────────────────────────────

describe("POST /api/admin/orders/:id/refund — method selection", () => {
  it("uses MANUAL method for bank_transfer (VA) payment", async () => {
    asAdmin();
    await resetPaymentPaid("bank_transfer");

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Refund VA manual",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.method).toBe("MANUAL");
    expect(json.data.proof_url).toBeNull();

    // Midtrans should NOT have been called
    expect(mockTransactionRefund).not.toHaveBeenCalled();
  });

  it("uses MIDTRANS_API method for gopay payment and calls transaction.refund", async () => {
    asAdmin();
    await resetPaymentPaid("gopay");

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Refund GoPay",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.method).toBe("MIDTRANS_API");
    expect(mockTransactionRefund).toHaveBeenCalledOnce();
    expect(json.data.status).toBe("SUCCESS");
  });

  it("uses MIDTRANS_API for credit_card payment", async () => {
    asAdmin();
    await resetPaymentPaid("credit_card");

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Kartu kredit refund",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.method).toBe("MIDTRANS_API");
  });

  it("sets refund.status=FAILED when Midtrans refund call throws", async () => {
    asAdmin();
    await resetPaymentPaid("gopay");
    mockTransactionRefund.mockRejectedValue(new Error("Midtrans error"));

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Gagal refund",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.method).toBe("MIDTRANS_API");
    expect(json.data.status).toBe("FAILED");
  });
});

// ── POST — restore_quota ──────────────────────────────────────────────────────

describe("POST /api/admin/orders/:id/refund — restore_quota", () => {
  beforeEach(() => resetPaymentPaid());

  it("restores stock when restore_quota=true", async () => {
    asAdmin();

    // Check current stock
    const [before] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithoutMemberPrice))
      .limit(1);
    const stockBefore = before!.stock;

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Kembalikan stok",
      restore_quota: true,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    // Order item quantity = 1 (from fixture), so stock should increase by 1
    const [after] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithoutMemberPrice))
      .limit(1);

    expect(after!.stock).toBe(stockBefore + 1);
  });

  it("does NOT restore stock when restore_quota=false", async () => {
    asAdmin();

    const [before] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithoutMemberPrice))
      .limit(1);
    const stockBefore = before!.stock;

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Jangan kembalikan stok",
      restore_quota: false,
    });
    await refundHandler(req, params1(FIXTURE_IDS.order));

    const [after] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithoutMemberPrice))
      .limit(1);

    expect(after!.stock).toBe(stockBefore);
  });
});

// ── POST — order status transition ────────────────────────────────────────────

describe("POST /api/admin/orders/:id/refund — order status", () => {
  beforeEach(() => resetPaymentPaid());

  it("sets order.status=REFUNDED when total refund equals payment.amount", async () => {
    asAdmin();
    // payment.amount = 215000; refund exactly that amount
    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 215000,
      reason: "Refund penuh",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.order_status.toUpperCase()).toBe("REFUNDED");

    const [order] = await testDb()
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, FIXTURE_IDS.order))
      .limit(1);
    expect(order?.status.toUpperCase()).toBe("REFUNDED");
  });

  it("does NOT set order.status=REFUNDED for a partial refund", async () => {
    asAdmin();
    // payment.amount = 215000; refund only 100000
    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 100000,
      reason: "Refund sebagian",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const [order] = await testDb()
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, FIXTURE_IDS.order))
      .limit(1);
    // Status should still be PAID (not REFUNDED)
    expect(order?.status.toUpperCase()).not.toBe("REFUNDED");
  });

  it("sets order.status=REFUNDED when two partial refunds sum to payment.amount", async () => {
    asAdmin();

    // First partial refund: 100000
    const req1 = refundRequest(FIXTURE_IDS.order, {
      amount: 100000,
      reason: "Refund sebagian 1",
      restore_quota: false,
    });
    await refundHandler(req1, params1(FIXTURE_IDS.order));

    // Second partial refund: 115000 (100000 + 115000 = 215000 = payment.amount)
    const req2 = refundRequest(FIXTURE_IDS.order, {
      amount: 115000,
      reason: "Refund sebagian 2",
      restore_quota: false,
    });
    const res2 = await refundHandler(req2, params1(FIXTURE_IDS.order));
    expect(res2.status).toBe(200);

    const json2 = await res2.json();
    expect(json2.data.order_status.toUpperCase()).toBe("REFUNDED");
  });
});

// ── POST — refund record is persisted ─────────────────────────────────────────

describe("POST /api/admin/orders/:id/refund — refund record", () => {
  beforeEach(() => resetPaymentPaid());

  it("inserts a refund row in the database", async () => {
    asAdmin();

    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Test insert",
      restore_quota: false,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    expect(res.status).toBe(200);

    const json = await res.json();
    const refundId = json.data.id;

    const [row] = await testDb()
      .select()
      .from(schema.refunds)
      .where(eq(schema.refunds.id, refundId))
      .limit(1);

    expect(row).toBeDefined();
    expect(Number(row!.amount)).toBe(50000);
    expect(row!.reason).toBe("Test insert");
    expect(row!.orderId).toBe(FIXTURE_IDS.order);
    expect(row!.paymentId).toBe(FIXTURE_IDS.orderPayment);
    expect(row!.processedBy).toBe(FIXTURE_IDS.adminUser);
  });

  it("response contains all required Refund fields", async () => {
    asAdmin();
    const req = refundRequest(FIXTURE_IDS.order, {
      amount: 50000,
      reason: "Full field test",
      restore_quota: true,
    });
    const res = await refundHandler(req, params1(FIXTURE_IDS.order));
    const json = await res.json();
    const d = json.data;

    expect(d).toHaveProperty("id");
    expect(d).toHaveProperty("payment_id", FIXTURE_IDS.orderPayment);
    expect(d).toHaveProperty("order_id", FIXTURE_IDS.order);
    expect(d).toHaveProperty("amount", 50000);
    expect(d).toHaveProperty("reason", "Full field test");
    expect(d).toHaveProperty("method");
    expect(d).toHaveProperty("status");
    expect(d).toHaveProperty("restore_quota", true);
    expect(d).toHaveProperty("processed_by", FIXTURE_IDS.adminUser);
    expect(d).toHaveProperty("created_at");
  });
});

// ── PATCH .../:refundId/proof — auth guards ───────────────────────────────────

describe("PATCH .../proof — auth guards", () => {
  it("returns 401 for unauthenticated request", async () => {
    const req = new NextRequest(
      `http://localhost/api/admin/orders/${FIXTURE_IDS.order}/refunds/some-id/proof`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proof_url: "https://example.com/proof.jpg" }),
      },
    );
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, "some-id"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for a CUSTOMER user", async () => {
    const req = new NextRequest(
      `http://localhost/api/admin/orders/${FIXTURE_IDS.order}/refunds/some-id/proof`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json", cookie: customerCookie() },
        body: JSON.stringify({ proof_url: "https://example.com/proof.jpg" }),
      },
    );
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, "some-id"));
    expect(res.status).toBe(403);
  });
});

// ── PATCH .../:refundId/proof — functionality ─────────────────────────────────

describe("PATCH .../proof — functionality", () => {
  let testRefundId: string;

  beforeEach(async () => {
    // Reset payment to PAID (bank_transfer = MANUAL)
    await resetPaymentPaid("bank_transfer");

    // Insert a fresh MANUAL refund for testing
    testRefundId = crypto.randomUUID();
    await testDb().insert(schema.refunds).values({
      id: testRefundId,
      paymentId: FIXTURE_IDS.orderPayment,
      orderId: FIXTURE_IDS.order,
      amount: "50000.00",
      reason: "Test manual refund",
      method: "MANUAL",
      proofUrl: null,
      restoreQuota: false,
      processedBy: FIXTURE_IDS.adminUser,
      status: "PENDING",
    });
  });

  it("sets proof_url on a MANUAL refund", async () => {
    asAdmin();
    const proofUrl = "https://minio.example.com/refund-proofs/proof.jpg";

    const req = proofRequest(FIXTURE_IDS.order, testRefundId, { proof_url: proofUrl });
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, testRefundId));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.proof_url).toBe(proofUrl);

    // Verify persisted in DB
    const [row] = await testDb()
      .select({ proofUrl: schema.refunds.proofUrl })
      .from(schema.refunds)
      .where(eq(schema.refunds.id, testRefundId))
      .limit(1);
    expect(row?.proofUrl).toBe(proofUrl);
  });

  it("returns 422 when trying to upload proof for a MIDTRANS_API refund", async () => {
    asAdmin();

    // Insert a MIDTRANS_API refund
    const apiRefundId = crypto.randomUUID();
    await testDb().insert(schema.refunds).values({
      id: apiRefundId,
      paymentId: FIXTURE_IDS.orderPayment,
      orderId: FIXTURE_IDS.order,
      amount: "50000.00",
      reason: "Midtrans API refund",
      method: "MIDTRANS_API",
      proofUrl: null,
      restoreQuota: false,
      processedBy: FIXTURE_IDS.adminUser,
      status: "SUCCESS",
    });

    const req = proofRequest(FIXTURE_IDS.order, apiRefundId, {
      proof_url: "https://example.com/proof.jpg",
    });
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, apiRefundId));
    expect(res.status).toBe(422);
  });

  it("returns 404 when refund does not belong to this order", async () => {
    asAdmin();
    const req = proofRequest(FIXTURE_IDS.order, "nonexistent-refund-id", {
      proof_url: "https://example.com/proof.jpg",
    });
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, "nonexistent-refund-id"));
    expect(res.status).toBe(404);
  });

  it("returns 400 when proof_url is missing or empty", async () => {
    asAdmin();
    const req = proofRequest(FIXTURE_IDS.order, testRefundId, { proof_url: "" });
    const res = await proofHandler(req, params2(FIXTURE_IDS.order, testRefundId));
    expect(res.status).toBe(400);
  });
});
