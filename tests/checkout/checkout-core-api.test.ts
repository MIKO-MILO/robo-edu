/**
 * Behavior tests for ticket payment/03: POST /checkout — Core API checkout.
 *
 * Tests call the real route handler against the real test database.
 * chargeCoreApi is mocked (no outbound Midtrans calls).
 * The webhook handler is exercised real (Sentry + enqueueEmail mocked).
 *
 * Covered acceptance criteria:
 *   (a) Stock decremented atomically at checkout, not at PAID.
 *   (b) Stock unchanged if Core API charge fails.
 *   (c) 4th PENDING order rejected (PENDING_ORDER_LIMIT).
 *   + order.expires_at from settings.order_expires_hours
 *   + midtrans_order_id = {order_number}-1
 *   + payment_instruction stored in dedicated DB column
 *   + Idempotency-Key same request → same order returned, no double charge
 *   + PAYMENT_CHARGE_FAILED → 422
 *   + Integration: checkout → webhook → instruction survives rawResponse overwrite
 *   + GET /payment-info returns instruction from dedicated column after webhook
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { POST as checkout } from "@/app/api/checkout/midtrans/route";
import { GET as getPaymentInfo } from "@/app/api/orders/[id]/payment-info/route";
import { POST as webhookHandler } from "@/app/api/payments/midtrans/webhook/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import { upsertSettings } from "@/src/lib/services/settings-service";

// ── Midtrans Core API mock ───────────────────────────────────────────────────
const mockCharge = vi.fn();

vi.mock("@/src/lib/payments/midtrans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/payments/midtrans")>();
  return {
    ...original,
    chargeCoreApi: (...args: unknown[]) => mockCharge(...args),
  };
});

// ── Sentry + email queue mocks (required by webhook) ────────────────────────
vi.mock("@sentry/nextjs", () => ({
  captureMessage: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("@/src/lib/queue/email-queue", () => ({
  enqueueEmail: vi.fn().mockResolvedValue(undefined),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_INSTRUCTION = {
  type: "va" as const,
  bank_code: "BCA",
  va_number: "1234567890123",
};

function successCharge(overrides: Partial<{ expiryTime: Date }> = {}) {
  return {
    instruction: MOCK_INSTRUCTION,
    expiryTime: overrides.expiryTime ?? new Date(Date.now() + 3600 * 1000),
    transactionStatus: "pending",
    raw: { transaction_status: "pending" },
  };
}

function asUser(userId: string) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

function checkoutRequest(
  body: Record<string, unknown>,
  idempotencyKey = crypto.randomUUID(),
): NextRequest {
  return new NextRequest("http://localhost/api/checkout/midtrans", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });
}

function baseBody(addressId = FIXTURE_IDS.address): Record<string, unknown> {
  return {
    addressId,
    shippingCost: 15000,
    providerId: FIXTURE_IDS.shippingProvider,
    paymentMethod: "bank_transfer",
    paymentChannel: "bca_va",
  };
}

async function addToCart(userId: string, variantId: string, quantity = 1) {
  const db = testDb();
  let [cart] = await db
    .select({ id: schema.carts.id })
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .limit(1);
  if (!cart) {
    const cartId = crypto.randomUUID();
    await db.insert(schema.carts).values({ id: cartId, userId });
    cart = { id: cartId };
  }
  const existing = await db
    .select({ id: schema.cartItems.id })
    .from(schema.cartItems)
    .where(and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.variantId, variantId)))
    .limit(1);
  if (existing[0]) {
    await db.update(schema.cartItems).set({ quantity }).where(eq(schema.cartItems.id, existing[0].id));
  } else {
    await db.insert(schema.cartItems).values({
      id: crypto.randomUUID(),
      cartId: cart.id,
      productId: FIXTURE_IDS.product,
      variantId,
      quantity,
    });
  }
}

/** Build a valid-signature Midtrans webhook body for an order. */
function makeOrderWebhookBody(overrides: {
  order_id: string;
  gross_amount: string;
  transaction_status?: string;
  payment_type?: string;
  transaction_id?: string;
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "test-server-key";
  const status_code = "200";
  const {
    order_id,
    gross_amount,
    transaction_status = "settlement",
    payment_type = "bank_transfer",
    transaction_id = `TX-${crypto.randomUUID().slice(0, 8)}`,
  } = overrides;
  const signature_key = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");
  return {
    order_id,
    status_code,
    gross_amount,
    transaction_id,
    transaction_status,
    payment_type,
    signature_key,
    transaction_time: new Date().toISOString().replace("T", " ").slice(0, 19),
  };
}

function webhookRequest(body: unknown): Request {
  return new Request("http://localhost/api/payments/midtrans/webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Reset mock before each test ───────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockCharge.mockResolvedValue(successCharge());
});

// ── Validation ────────────────────────────────────────────────────────────────

describe("validation", () => {
  it("rejects checkout without Idempotency-Key header with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const req = new NextRequest("http://localhost/api/checkout/midtrans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseBody()),
    });
    const res = await checkout(req);
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("Idempotency-Key");
  });

  it("rejects OVO payment without ovoPhone with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    const res = await checkout(checkoutRequest({ ...baseBody(), paymentMethod: "ovo", paymentChannel: "ovo" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("OVO");
  });

  it("rejects without paymentMethod with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest({ ...baseBody(), paymentMethod: "" }));
    expect(res.status).toBe(400);
  });
});

// ── (a) Atomic stock reservation ─────────────────────────────────────────────

describe("(a) atomic stock reservation", () => {
  it("stock decrements at checkout (not at PAID)", async () => {
    // Record initial stock
    const [before] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithMemberPrice))
      .limit(1);
    const initialStock = before!.stock;

    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);

    const [after] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithMemberPrice))
      .limit(1);

    // Stock decremented right after checkout, before any webhook
    expect(after!.stock).toBe(initialStock - 1);
  });
});

// ── (b) Stock unchanged on charge failure ─────────────────────────────────────

describe("(b) stock unchanged if charge fails", () => {
  it("restores stock when chargeCoreApi throws", async () => {
    const [before] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithMemberPrice))
      .limit(1);
    const initialStock = before!.stock;

    // Make the charge fail
    mockCharge.mockRejectedValueOnce(new Error("Midtrans timeout"));

    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe("PAYMENT_CHARGE_FAILED");

    const [after] = await testDb()
      .select({ stock: schema.productVariants.stock })
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithMemberPrice))
      .limit(1);

    // Stock must be restored to original value
    expect(after!.stock).toBe(initialStock);
  });

  it("cancelled order not in DB after charge failure", async () => {
    mockCharge.mockRejectedValueOnce(new Error("charge failed"));
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    await checkout(checkoutRequest(baseBody()));

    // The order should be CANCELLED (not missing — the row exists for audit but status=CANCELLED)
    const cancelledOrders = await testDb()
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.userId, FIXTURE_IDS.regularUser),
          eq(schema.orders.status, "CANCELLED"),
        ),
      );
    expect(cancelledOrders.length).toBeGreaterThanOrEqual(1);
  });
});

// ── (c) Max 3 PENDING orders ──────────────────────────────────────────────────

describe("(c) PENDING_ORDER_LIMIT", () => {
  it("rejects 4th PENDING checkout with 409 PENDING_ORDER_LIMIT", async () => {
    // Create 3 PENDING orders by direct DB insert
    for (let i = 0; i < 3; i++) {
      await testDb().insert(schema.orders).values({
        id: crypto.randomUUID(),
        orderNumber: `RE-LIMIT-${i}-${crypto.randomUUID().slice(0, 8)}`,
        userId: FIXTURE_IDS.regularUser,
        addressId: FIXTURE_IDS.address,
        subtotal: "100000",
        discountAmount: "0",
        taxAmount: "0",
        shippingCost: "15000",
        total: "115000",
        status: "PENDING",
        recipientName: "Test",
        recipientPhone: "08123456789",
        shippingAddress: "Jl. Test",
        shippingProvince: "DKI Jakarta",
        shippingCity: "Jakarta",
        shippingDistrict: "Pusat",
        shippingVillage: "Gambir",
        shippingPostalCode: "10110",
        isDropship: false,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      });
    }

    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe("PENDING_ORDER_LIMIT");
  });
});

// ── order.expires_at from settings ───────────────────────────────────────────

describe("order.expires_at from settings", () => {
  it("expires_at ≈ now + order_expires_hours", async () => {
    await upsertSettings({ order_expires_hours: "5" });
    const beforeCheckout = Date.now();

    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const [order] = await testDb()
      .select({ expiresAt: schema.orders.expiresAt })
      .from(schema.orders)
      .where(eq(schema.orders.id, data.orderId))
      .limit(1);

    const expectedMs = beforeCheckout + 5 * 3600 * 1000;
    const diff = Math.abs(order!.expiresAt.getTime() - expectedMs);
    expect(diff).toBeLessThan(60_000); // within 1 minute

    await upsertSettings({ order_expires_hours: "24" }); // restore
  });
});

// ── midtrans_order_id = {order_number}-1 ─────────────────────────────────────

describe("midtrans_order_id format", () => {
  it("midtrans_order_id = {order_number}-1 on first attempt", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const [payment] = await testDb()
      .select({ midtransOrderId: schema.payments.midtransOrderId, attemptNumber: schema.payments.attemptNumber })
      .from(schema.payments)
      .where(eq(schema.payments.orderId, data.orderId))
      .limit(1);

    expect(payment!.midtransOrderId).toBe(`${data.orderNumber}-1`);
    expect(payment!.attemptNumber).toBe(1);
  });
});

// ── payment_instruction in dedicated column ───────────────────────────────────

describe("payment_instruction in dedicated column", () => {
  it("paymentInstruction stored in DB, paymentChannel set", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const [payment] = await testDb()
      .select({
        paymentInstruction: schema.payments.paymentInstruction,
        paymentChannel: schema.payments.paymentChannel,
        paymentType: schema.payments.paymentType,
      })
      .from(schema.payments)
      .where(eq(schema.payments.orderId, data.orderId))
      .limit(1);

    expect(payment!.paymentInstruction).not.toBeNull();
    expect((payment!.paymentInstruction as typeof MOCK_INSTRUCTION).type).toBe("va");
    expect((payment!.paymentInstruction as typeof MOCK_INSTRUCTION).va_number).toBe("1234567890123");
    expect(payment!.paymentChannel).toBe("bca_va");
    expect(payment!.paymentType).toBe("bank_transfer");
  });

  it("response 201 includes paymentInstruction and expiryTime", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    expect(data.paymentInstruction).toBeDefined();
    expect(data.paymentInstruction.type).toBe("va");
    expect(data.paymentInstruction.va_number).toBe("1234567890123");
    expect(typeof data.expiryTime).toBe("string");
  });
});

// ── Idempotency ───────────────────────────────────────────────────────────────

describe("idempotency", () => {
  it("same Idempotency-Key returns same order without double charge", async () => {
    const ikey = crypto.randomUUID();
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res1 = await checkout(checkoutRequest(baseBody(), ikey));
    expect(res1.status).toBe(201);
    const { data: d1 } = await res1.json();

    // Second request with same key (don't add to cart — it's cleared after first checkout)
    asUser(FIXTURE_IDS.regularUser);
    const res2 = await checkout(checkoutRequest(baseBody(), ikey));
    expect(res2.status).toBe(201);
    const { data: d2 } = await res2.json();

    expect(d2.orderId).toBe(d1.orderId);
    expect(d2.orderNumber).toBe(d1.orderNumber);

    // chargeCoreApi called exactly once — not on the idempotent second request
    expect(mockCharge).toHaveBeenCalledTimes(1);

    // Exactly one order for this user with this idempotency key
    const orderCount = await testDb()
      .select({ c: count() })
      .from(schema.orders)
      .where(eq(schema.orders.idempotencyKey, ikey));
    expect(Number(orderCount[0]!.c)).toBe(1);
  });
});

// ── Route alias ───────────────────────────────────────────────────────────────

describe("route alias POST /api/checkout/midtrans", () => {
  it("midtrans alias returns 201 same as /api/checkout", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.paymentInstruction).toBeDefined();
  });
});

// ── Integration: checkout → webhook → instruction survives ────────────────────

describe("integration: checkout + webhook (03 + 05 compose)", () => {
  it("payment_instruction survives webhook rawResponse overwrite", async () => {
    // 1. Checkout → get order + payment
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const checkoutRes = await checkout(checkoutRequest(baseBody()));
    expect(checkoutRes.status).toBe(201);
    const { data } = await checkoutRes.json();

    // 2. Retrieve the midtrans_order_id from DB
    const [payment] = await testDb()
      .select({
        id: schema.payments.id,
        midtransOrderId: schema.payments.midtransOrderId,
        amount: schema.payments.amount,
        paymentInstruction: schema.payments.paymentInstruction,
      })
      .from(schema.payments)
      .where(eq(schema.payments.orderId, data.orderId))
      .limit(1);

    // instruction must be present before webhook
    expect(payment!.paymentInstruction).not.toBeNull();
    const instructionBefore = payment!.paymentInstruction as typeof MOCK_INSTRUCTION;

    // 3. Fire a settlement webhook
    const webhookBody = makeOrderWebhookBody({
      order_id: payment!.midtransOrderId,
      gross_amount: payment!.amount,
      transaction_status: "settlement",
    });
    const wRes = await webhookHandler(webhookRequest(webhookBody));
    expect(wRes.status).toBe(200);
    expect((await wRes.json()).received).toBe(true);

    // 4. After webhook: order PAID, payment PAID
    const [orderAfter] = await testDb()
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, data.orderId))
      .limit(1);
    expect(orderAfter!.status).toBe("PAID");

    // 5. payment_instruction in dedicated column is UNCHANGED by webhook
    const [paymentAfter] = await testDb()
      .select({
        status: schema.payments.status,
        paymentInstruction: schema.payments.paymentInstruction,
        rawResponse: schema.payments.rawResponse,
      })
      .from(schema.payments)
      .where(eq(schema.payments.id, payment!.id))
      .limit(1);

    expect(paymentAfter!.status).toBe("PAID");
    // rawResponse was overwritten by webhook (contains the notification body)
    expect((paymentAfter!.rawResponse as Record<string, unknown>)?.transaction_status).toBe("settlement");
    // But the dedicated column is still intact
    expect(paymentAfter!.paymentInstruction).not.toBeNull();
    const instructionAfter = paymentAfter!.paymentInstruction as typeof MOCK_INSTRUCTION;
    expect(instructionAfter.type).toBe(instructionBefore.type);
    expect(instructionAfter.va_number).toBe(instructionBefore.va_number);
  });

  it("GET /payment-info returns instruction from dedicated column after webhook", async () => {
    // 1. Checkout
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);
    const checkoutRes = await checkout(checkoutRequest(baseBody()));
    const { data } = await checkoutRes.json();

    // 2. Fetch payment for midtrans_order_id
    const [payment] = await testDb()
      .select({ midtransOrderId: schema.payments.midtransOrderId, amount: schema.payments.amount })
      .from(schema.payments)
      .where(eq(schema.payments.orderId, data.orderId))
      .limit(1);

    // 3. Fire webhook
    await webhookHandler(
      webhookRequest(makeOrderWebhookBody({
        order_id: payment!.midtransOrderId,
        gross_amount: payment!.amount,
      })),
    );

    // 4. GET /payment-info and check instruction
    asUser(FIXTURE_IDS.regularUser);
    const infoReq = new NextRequest(
      `http://localhost/api/orders/${data.orderId}/payment-info`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${createSessionToken(FIXTURE_IDS.regularUser, false)}` } },
    );
    const infoRes = await getPaymentInfo(infoReq, { params: Promise.resolve({ id: data.orderId }) });
    expect(infoRes.status).toBe(200);
    const infoJson = await infoRes.json();

    expect(infoJson.data.payment.payment_instruction).not.toBeNull();
    expect(infoJson.data.payment.payment_instruction.type).toBe("va");
    expect(infoJson.data.payment.payment_channel).toBe("bca_va");
    expect(infoJson.data.order.status).toBe("PAID");
  });
});
