/**
 * Behavior tests for membership purchase flow (ticket payment/10 + payment/08).
 *
 * These tests call the real route handlers against the real test database.
 * Midtrans Core API is mocked via vi.mock so no outbound network calls are made.
 *
 * Covered criteria:
 *   1. POST /api/checkout/membership returns payment_instruction; creates
 *      a PENDING membership_purchase + payments row; price comes from settings.
 *   2. 409 PENDING_PURCHASE_EXISTS when user already has a PENDING purchase.
 *   3. 400 VOUCHER_NOT_SUPPORTED when voucher_code is sent.
 *   4. 422 PAYMENT_CHARGE_FAILED when Core API throws; rows are still created as FAILED.
 *   5. EXPIRED sweep: a PENDING purchase whose only payment is FAILED gets
 *      auto-EXPIRED so the user can start fresh.
 *   6. Successful MBR- webhook sets membership_status = MEMBER (unchanged from
 *      Snap era — webhook branch does not care about Snap vs Core API).
 *   7. Idempotent webhook: double-settlement does not double-activate.
 *   8. Full end-to-end: NOT_MEMBER → checkout → webhook → MEMBER.
 *   9. Settings-driven price (ticket 11 criterion 3).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { POST as membershipCheckout } from "@/app/api/checkout/membership/route";
import { POST as webhookHandler } from "@/app/api/payments/midtrans/webhook/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS, SETTINGS_SEED } from "@/tests/helpers/fixtures";
import { upsertSettings } from "@/src/lib/services/settings-service";
import type { PaymentInstruction } from "@/src/lib/payments/midtrans";

// ── Mocks ──────────────────────────────────────────────────────────────────────

const { mockChargeCoreApi } = vi.hoisted(() => ({
  mockChargeCoreApi: vi.fn(),
}));

vi.mock("@/src/lib/payments/midtrans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/payments/midtrans")>();
  return {
    ...original,
    chargeCoreApi: mockChargeCoreApi,
    // cancelCoreApi: keep original (not needed for checkout tests)
    isValidMidtransSignature: original.isValidMidtransSignature,
  };
});

// ── Default mock ───────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

function asUser(userId: string) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

/** Default valid checkout body — includes payment fields required by Core API route. */
function checkoutRequest(overrides: Record<string, unknown> = {}): NextRequest {
  return new NextRequest("http://localhost/api/checkout/membership", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      package: "PLUS",
      payment_method: "bank_transfer",
      payment_channel: "bca_va",
      ...overrides,
    }),
  });
}

function makeWebhookBody(overrides: {
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

/** Run checkout as regularUser and return the response data. */
async function doCheckout(userId = FIXTURE_IDS.regularUser) {
  asUser(userId);
  const res = await membershipCheckout(checkoutRequest());
  expect(res.status).toBe(200);
  const json = await res.json();
  return json.data as {
    purchase_id: string;
    purchase_number: string;
    payment_instruction: PaymentInstruction;
    expiry_time: string;
    status: string;
  };
}

// ── Setup ──────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockChargeCoreApi.mockReset();
  mockChargeSuccess();
});

// ── POST /api/checkout/membership ─────────────────────────────────────────────

describe("POST /api/checkout/membership — Core API checkout", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid package", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest({ package: "BASIC" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when payment_method or payment_channel is missing", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(
      new NextRequest("http://localhost/api/checkout/membership", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ package: "PLUS" }),
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).message).toMatch(/payment_method/i);
  });

  it("returns 400 VOUCHER_NOT_SUPPORTED when voucher_code is sent", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(
      checkoutRequest({ voucher_code: "SAVE10" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("VOUCHER_NOT_SUPPORTED");
  });

  it("returns payment_instruction and expiry_time (not snap_token)", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const d = json.data;
    expect(d).toHaveProperty("purchase_id");
    expect(d).toHaveProperty("purchase_number");
    expect(d).toHaveProperty("payment_instruction");
    expect(d).toHaveProperty("expiry_time");
    expect(d.status).toBe("PENDING");
    // Must NOT have snap_token
    expect(d).not.toHaveProperty("snap_token");
    expect(d.purchase_number).toMatch(/^MBR-/);
  });

  it("payment_instruction matches the Core API mock shape", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const { data } = await res.json();
    expect(data.payment_instruction).toMatchObject({
      type: "va",
      bank_code: "BCA",
      va_number: "1234567890",
    });
  });

  it("creates a PENDING membership_purchase row in the DB", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const { data } = await res.json();

    const [purchase] = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, data.purchase_id))
      .limit(1);

    expect(purchase).toBeDefined();
    expect(purchase!.status).toBe("PENDING");
    expect(purchase!.userId).toBe(FIXTURE_IDS.regularUser);
    expect(purchase!.planNameSnapshot).toBe("Plus");
    expect(Number(purchase!.priceSnapshot)).toBe(
      Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_price")!.value),
    );
  });

  it("creates a PENDING payment row with paymentInstruction set (not in rawResponse)", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const { data } = await res.json();

    const [payment] = await testDb()
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, data.purchase_id))
      .limit(1);

    expect(payment).toBeDefined();
    expect(payment!.orderId).toBeNull();
    expect(payment!.status).toBe("PENDING");
    expect(payment!.paymentInstruction).toMatchObject({ type: "va" });
    expect(payment!.midtransOrderId).toMatch(/-1$/); // {purchaseNumber}-1
    expect(payment!.attemptNumber).toBe(1);
  });

  it("midtransOrderId = {purchaseNumber}-1 for the first attempt", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const { data } = await res.json();

    const [payment] = await testDb()
      .select({ midtransOrderId: schema.payments.midtransOrderId })
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, data.purchase_id))
      .limit(1);

    expect(payment!.midtransOrderId).toBe(`${data.purchase_number}-1`);
  });

  it("price comes from settings — changing membership_plus_price changes what is charged", async () => {
    await upsertSettings({ membership_plus_price: "299000" });
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(200);

    const { data } = await res.json();
    const [purchase] = await testDb()
      .select({ priceSnapshot: schema.membershipPurchases.priceSnapshot })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, data.purchase_id))
      .limit(1);

    expect(Number(purchase!.priceSnapshot)).toBe(299000);
  });

  it("returns 409 PENDING_PURCHASE_EXISTS when user already has a PENDING purchase", async () => {
    asUser(FIXTURE_IDS.regularUser);
    // First checkout — creates a PENDING purchase
    const res1 = await membershipCheckout(checkoutRequest());
    expect(res1.status).toBe(200);
    const first = (await res1.json()).data;

    // Second checkout without paying first
    const res2 = await membershipCheckout(checkoutRequest());
    expect(res2.status).toBe(409);

    const json2 = await res2.json();
    expect(json2.code).toBe("PENDING_PURCHASE_EXISTS");
    expect(json2.purchase_id).toBe(first.purchase_id);
    expect(json2.purchase_number).toBe(first.purchase_number);

    // chargeCoreApi should only have been called once (not twice)
    expect(mockChargeCoreApi).toHaveBeenCalledOnce();
  });

  it("creates purchase + payment rows as FAILED when Core API throws, returns 422", async () => {
    mockChargeCoreApi.mockRejectedValue(new Error("Midtrans timeout"));
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.code).toBe("PAYMENT_CHARGE_FAILED");

    // Both rows should exist and be FAILED
    const purchases = await testDb()
      .select({ status: schema.membershipPurchases.status })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.userId, FIXTURE_IDS.regularUser));

    expect(purchases.length).toBeGreaterThan(0);
    expect(purchases.every((p) => p.status === "FAILED")).toBe(true);
  });

  it("auto-expires PENDING purchase with no active payment so user can start fresh", async () => {
    // Create a failed checkout (all payment attempts FAILED)
    mockChargeCoreApi.mockRejectedValue(new Error("Midtrans error"));
    asUser(FIXTURE_IDS.regularUser);
    const failedRes = await membershipCheckout(checkoutRequest());
    expect(failedRes.status).toBe(422);

    // Verify there is a FAILED purchase
    const failedPurchases = await testDb()
      .select({ id: schema.membershipPurchases.id, status: schema.membershipPurchases.status })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.userId, FIXTURE_IDS.regularUser));
    expect(failedPurchases[0]!.status).toBe("FAILED");

    // Manually set it back to PENDING to simulate a stale PENDING purchase
    // whose only payment attempt failed (the realistic scenario)
    await testDb()
      .update(schema.membershipPurchases)
      .set({ status: "PENDING" })
      .where(eq(schema.membershipPurchases.id, failedPurchases[0]!.id));

    // Now try a fresh checkout — the EXPIRED sweep should auto-expire the stale purchase
    mockChargeSuccess();
    const freshRes = await membershipCheckout(checkoutRequest());
    expect(freshRes.status).toBe(200);

    // The old purchase should now be EXPIRED
    const [oldPurchase] = await testDb()
      .select({ status: schema.membershipPurchases.status })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, failedPurchases[0]!.id))
      .limit(1);
    expect(oldPurchase!.status).toBe("EXPIRED");

    // A new PENDING purchase should exist
    const freshData = (await freshRes.json()).data;
    expect(freshData.purchase_id).not.toBe(failedPurchases[0]!.id);
  });
});

// ── Webhook MBR- branch (Core API) ────────────────────────────────────────────

describe("POST /api/payments/midtrans/webhook — MBR- branch (Core API)", () => {
  async function doCheckoutAndGetWebhookData(userId = FIXTURE_IDS.regularUser) {
    const data = await doCheckout(userId);
    const price = Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_price")!.value);
    return { ...data, gross_amount: String(price) };
  }

  it("rejects an invalid Midtrans signature with 401", async () => {
    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();
    const body = makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount });
    (body as Record<string, unknown>).signature_key = "bad-sig";

    const res = await webhookHandler(webhookRequest(body));
    expect(res.status).toBe(401);
  });

  it("activates membership on settlement: status=MEMBER, expires_at set", async () => {
    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();

    const res = await webhookHandler(
      webhookRequest(makeWebhookBody({
        order_id: `${purchase_number}-1`,
        gross_amount,
        transaction_status: "settlement",
      })),
    );
    expect(res.status).toBe(200);

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus, membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);

    expect(user!.membershipStatus).toBe("MEMBER");
    expect(user!.membershipExpiresAt).not.toBeNull();
  });

  it("sets membership_purchase.status = PAID and paidAt on settlement", async () => {
    const { purchase_id, purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();

    await webhookHandler(
      webhookRequest(makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount })),
    );

    const [purchase] = await testDb()
      .select({ status: schema.membershipPurchases.status, paidAt: schema.membershipPurchases.paidAt })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, purchase_id))
      .limit(1);

    expect(purchase!.status).toBe("PAID");
    expect(purchase!.paidAt).not.toBeNull();
  });

  it("idempotent: sending the same settlement notification twice activates membership exactly once", async () => {
    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();
    const body = makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount });

    await webhookHandler(webhookRequest(body));
    await webhookHandler(webhookRequest(body));

    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(user!.membershipStatus).toBe("MEMBER");

    const purchases = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.purchaseNumber, purchase_number));
    expect(purchases.length).toBe(1);
    expect(purchases[0]!.status).toBe("PAID");
  });

  it("does not activate membership on expire or deny", async () => {
    for (const transaction_status of ["expire", "deny"] as const) {
      const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();

      await webhookHandler(
        webhookRequest(makeWebhookBody({
          order_id: `${purchase_number}-1`,
          gross_amount,
          transaction_status,
        })),
      );

      const [user] = await testDb()
        .select({ membershipStatus: schema.users.membershipStatus })
        .from(schema.users)
        .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
        .limit(1);
      expect(user!.membershipStatus).toBe("NOT_MEMBER");

      const { resetData } = await import("@/tests/helpers/db");
      await resetData();
      mockChargeSuccess();
    }
  });

  it("full end-to-end: NOT_MEMBER → checkout → webhook → MEMBER", async () => {
    const [before] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(before!.membershipStatus).toBe("NOT_MEMBER");

    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();

    await webhookHandler(
      webhookRequest(makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount })),
    );

    const [after] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus, membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(after!.membershipStatus).toBe("MEMBER");
    expect(after!.membershipExpiresAt).not.toBeNull();
  });

  it("early renewal: active MEMBER who buys again gets expiry extended from current expiry", async () => {
    const [before] = await testDb()
      .select({ membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);
    const currentExpiry = new Date(before!.membershipExpiresAt!);

    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData(FIXTURE_IDS.memberUser);

    await webhookHandler(
      webhookRequest(makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount })),
    );

    const [after] = await testDb()
      .select({ membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);

    const newExpiry = new Date(after!.membershipExpiresAt!);
    expect(newExpiry.getTime()).toBeGreaterThan(currentExpiry.getTime());
  });

  it("addMonthsSafe: Mar 31 + 1 month expires Apr 30 (not May 1)", async () => {
    await upsertSettings({ membership_plus_duration_months: "1" });
    const { purchase_number, gross_amount } = await doCheckoutAndGetWebhookData();

    const body = makeWebhookBody({ order_id: `${purchase_number}-1`, gross_amount });
    (body as Record<string, unknown>).transaction_time = "2026-03-31 10:00:00";

    await webhookHandler(webhookRequest(body));

    const [user] = await testDb()
      .select({ membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);

    const expiresAt = new Date(user!.membershipExpiresAt!);
    expect(expiresAt.getMonth()).toBe(3); // April
    expect(expiresAt.getDate()).toBe(30);
  });
});

// ── Satu user satu PENDING (ticket/08) ────────────────────────────────────────

describe("one-PENDING-per-user constraint (ticket/08)", () => {
  it("enforces exactly one PENDING purchase per user", async () => {
    asUser(FIXTURE_IDS.regularUser);

    const res1 = await membershipCheckout(checkoutRequest());
    expect(res1.status).toBe(200);

    const res2 = await membershipCheckout(checkoutRequest());
    expect(res2.status).toBe(409);
    expect((await res2.json()).code).toBe("PENDING_PURCHASE_EXISTS");

    const res3 = await membershipCheckout(checkoutRequest());
    expect(res3.status).toBe(409);

    // Only one purchase row should exist
    const purchases = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(
        and(
          eq(schema.membershipPurchases.userId, FIXTURE_IDS.regularUser),
          eq(schema.membershipPurchases.status, "PENDING"),
        ),
      );
    expect(purchases.length).toBe(1);
    expect(mockChargeCoreApi).toHaveBeenCalledOnce();
  });

  it("allows a new checkout after the previous purchase is PAID (webhook)", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const { data: d1 } = await (await membershipCheckout(checkoutRequest())).json();

    // Simulate payment via webhook
    const price = SETTINGS_SEED.find((s) => s.key === "membership_plus_price")!.value;
    await webhookHandler(
      webhookRequest(makeWebhookBody({
        order_id: `${d1.purchase_number}-1`,
        gross_amount: price,
      })),
    );

    // Now a second checkout should succeed (previous is PAID, not PENDING)
    mockChargeSuccess();
    const res2 = await membershipCheckout(checkoutRequest());
    expect(res2.status).toBe(200);
    const { data: d2 } = await res2.json();
    expect(d2.purchase_id).not.toBe(d1.purchase_id);
  });
});
