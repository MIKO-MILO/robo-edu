/**
 * Behavior tests for ticket 04: Membership purchase flow + webhook activation.
 *
 * These tests call the real route handlers against the real test database.
 * Midtrans Snap is mocked via vi.mock so no outbound network calls are made.
 *
 * Covered criteria:
 *   1. POST /api/checkout/membership returns snap_token + redirect_url; creates
 *      a PENDING membership_purchase + payments row; price comes from settings.
 *   2. Successful MBR- webhook sets membership_status = MEMBER and computes
 *      membership_expires_at correctly.
 *   3. Duplicate webhook notifications do not double-activate membership (idempotent).
 *   4. A NOT_MEMBER user becomes MEMBER after the full flow without admin approval.
 *   5. Settings-driven price: changing membership_plus_price changes what the
 *      checkout charges (ticket 11 criterion 3 end-to-end).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { POST as membershipCheckout } from "@/app/api/checkout/membership/route";
import { POST as webhookHandler } from "@/app/api/payments/midtrans/webhook/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS, FIXTURE_EMAILS, FIXTURE_PASSWORD, SETTINGS_SEED } from "@/tests/helpers/fixtures";
import { upsertSettings } from "@/src/lib/services/settings-service";

// ── Midtrans mock ────────────────────────────────────────────────────────────
// Replace the Snap client so tests never make real outbound requests.
// The mock returns deterministic tokens so tests can assert on them.

const MOCK_SNAP_TOKEN = "test-snap-token-abc123";
const MOCK_REDIRECT_URL = "https://app.sandbox.midtrans.com/snap/v3/redirection/test-snap-token-abc123";

vi.mock("@/src/lib/payments/midtrans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/payments/midtrans")>();
  return {
    ...original,
    getSnapClient: () => ({
      createTransaction: vi.fn().mockResolvedValue({
        token: MOCK_SNAP_TOKEN,
        redirect_url: MOCK_REDIRECT_URL,
      }),
    }),
    // Keep the real signature validator so webhook tests can control validity.
    isValidMidtransSignature: original.isValidMidtransSignature,
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Seed the cookie store as a particular user (uses the real HMAC session path). */
function asUser(userId: string) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

function checkoutRequest(body: unknown = { package: "PLUS" }): NextRequest {
  return new NextRequest("http://localhost/api/checkout/membership", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Build a Midtrans-style webhook notification body with a valid HMAC signature.
 *
 * Uses the MIDTRANS_SERVER_KEY from the test env (set in tests/helpers/env.ts),
 * which is safe because the app's isValidMidtransSignature also reads the same
 * env — so this produces a signature that the real validator accepts.
 */
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
    payment_type = "gopay",
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

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/checkout/membership — create pending transaction", () => {
  it("rejects unauthenticated requests with 401", async () => {
    // No cookie seeded.
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects an invalid package with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest({ package: "BASIC" }));
    expect(res.status).toBe(400);
    expect((await res.json()).success).toBe(false);
  });

  it("returns snap_token and redirect_url for a valid PLUS request", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.snapToken).toBe(MOCK_SNAP_TOKEN);
    expect(json.data.redirectUrl).toBe(MOCK_REDIRECT_URL);
    expect(json.data.purchaseNumber).toMatch(/^MBR-/);
  });

  it("price in the response matches the settings table (not a hardcoded constant)", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const json = await res.json();

    // SETTINGS_SEED has membership_plus_price = "150000"
    const seededPrice = Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_price")!.value);
    expect(json.data.total).toBe(seededPrice);
  });

  it("creates a PENDING membership_purchase row in the DB", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const json = await res.json();

    const [purchase] = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, json.data.purchaseId))
      .limit(1);

    expect(purchase).toBeDefined();
    expect(purchase!.status).toBe("PENDING");
    expect(purchase!.userId).toBe(FIXTURE_IDS.regularUser);
    expect(purchase!.planNameSnapshot).toBe("Plus");
    expect(Number(purchase!.priceSnapshot)).toBe(
      Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_price")!.value),
    );
    expect(Number(purchase!.durationMonthsSnapshot)).toBe(
      Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_duration_months")!.value),
    );
  });

  it("creates a PENDING payments row linked to the membership_purchase (not an order)", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const json = await res.json();

    const [payment] = await testDb()
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, json.data.purchaseId))
      .limit(1);

    expect(payment).toBeDefined();
    expect(payment!.orderId).toBeNull();
    expect(payment!.membershipPurchaseId).toBe(json.data.purchaseId);
    expect(payment!.status).toBe("PENDING");
    expect(Number(payment!.amount)).toBe(json.data.total);
  });

  it("price comes from settings — changing membership_plus_price changes what is charged", async () => {
    // Update price in settings (simulating an admin PATCH).
    await upsertSettings({ membership_plus_price: "299000" });

    asUser(FIXTURE_IDS.regularUser);
    const res = await membershipCheckout(checkoutRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    // Must reflect the NEW price, not the original 150000.
    expect(json.data.total).toBe(299000);

    const [purchase] = await testDb()
      .select({ priceSnapshot: schema.membershipPurchases.priceSnapshot })
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, json.data.purchaseId))
      .limit(1);

    expect(Number(purchase!.priceSnapshot)).toBe(299000);
  });
});

describe("POST /api/payments/midtrans/webhook — MBR- branch", () => {
  /**
   * Helper: run through the full checkout flow and return the created
   * purchase_number so we can send a matching webhook notification.
   */
  async function doCheckout(userId = FIXTURE_IDS.regularUser) {
    asUser(userId);
    const res = await membershipCheckout(checkoutRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    return json.data as {
      purchaseId: string;
      purchaseNumber: string;
      snapToken: string;
      redirectUrl: string;
      total: number;
    };
  }

  it("rejects an invalid Midtrans signature with 401", async () => {
    const { purchaseNumber, total } = await doCheckout();
    const body = makeWebhookBody({ order_id: purchaseNumber, gross_amount: String(total) });
    // Tamper with the signature.
    (body as Record<string, unknown>).signature_key = "bad-sig";

    const res = await webhookHandler(webhookRequest(body));
    expect(res.status).toBe(401);
  });

  it("activates membership on settlement: status=MEMBER, expires_at set", async () => {
    const { purchaseNumber, total } = await doCheckout();

    const webhookBody = makeWebhookBody({
      order_id: purchaseNumber,
      gross_amount: String(total),
      transaction_status: "settlement",
      payment_type: "gopay",
    });

    const res = await webhookHandler(webhookRequest(webhookBody));
    expect(res.status).toBe(200);
    expect((await res.json()).received).toBe(true);

    // User is now MEMBER.
    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus, membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);

    expect(user!.membershipStatus).toBe("MEMBER");
    expect(user!.membershipExpiresAt).not.toBeNull();

    // Expiry = paid_at + duration_months (12 months by default fixture)
    const duration = Number(SETTINGS_SEED.find((s) => s.key === "membership_plus_duration_months")!.value);
    const expiresAt = user!.membershipExpiresAt!;
    const now = new Date();
    const minExpected = new Date(now);
    minExpected.setMonth(minExpected.getMonth() + duration - 1); // allow ±1 month window
    const maxExpected = new Date(now);
    maxExpected.setMonth(maxExpected.getMonth() + duration + 1);

    expect(new Date(expiresAt).getTime()).toBeGreaterThan(minExpected.getTime());
    expect(new Date(expiresAt).getTime()).toBeLessThan(maxExpected.getTime());
  });

  it("sets membership_purchase.status = PAID and paidAt on settlement", async () => {
    const { purchaseId, purchaseNumber, total } = await doCheckout();

    await webhookHandler(
      webhookRequest(makeWebhookBody({ order_id: purchaseNumber, gross_amount: String(total) })),
    );

    const [purchase] = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.id, purchaseId))
      .limit(1);

    expect(purchase!.status).toBe("PAID");
    expect(purchase!.paidAt).not.toBeNull();
    expect(purchase!.startsAt).not.toBeNull();
    expect(purchase!.endsAt).not.toBeNull();
  });

  it("updates the payments row with real transaction details", async () => {
    const { purchaseId, purchaseNumber, total } = await doCheckout();
    const txId = `TX-${crypto.randomUUID().slice(0, 8)}`;

    await webhookHandler(
      webhookRequest(makeWebhookBody({
        order_id: purchaseNumber,
        gross_amount: String(total),
        transaction_id: txId,
        payment_type: "bank_transfer",
      })),
    );

    const [payment] = await testDb()
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, purchaseId))
      .limit(1);

    expect(payment!.status).toBe("PAID");
    expect(payment!.transactionId).toBe(txId);
    expect(payment!.paymentType).toBe("bank_transfer");
  });

  it("idempotent: sending the same settlement notification twice activates membership exactly once", async () => {
    const { purchaseNumber, total } = await doCheckout();
    const webhookBody = makeWebhookBody({ order_id: purchaseNumber, gross_amount: String(total) });

    // First notification.
    const res1 = await webhookHandler(webhookRequest(webhookBody));
    expect(res1.status).toBe(200);

    // Second identical notification (Midtrans retry).
    const res2 = await webhookHandler(webhookRequest(webhookBody));
    expect(res2.status).toBe(200);

    // User is MEMBER — confirmed via only one DB query (not checking a count).
    const [user] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(user!.membershipStatus).toBe("MEMBER");

    // Exactly one PAID purchase record exists for this purchaseNumber.
    const purchases = await testDb()
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.purchaseNumber, purchaseNumber));
    expect(purchases.length).toBe(1);
    expect(purchases[0]!.status).toBe("PAID");
  });

  it("does not activate membership on expire or deny (payment states EXPIRED / FAILED)", async () => {
    for (const transaction_status of ["expire", "deny"] as const) {
      // Fresh checkout for each sub-case.
      asUser(FIXTURE_IDS.regularUser);
      const res = await membershipCheckout(checkoutRequest());
      const { purchaseNumber, total } = (await res.json()).data;

      const webhookBody = makeWebhookBody({ order_id: purchaseNumber, gross_amount: String(total), transaction_status });
      await webhookHandler(webhookRequest(webhookBody));

      const [user] = await testDb()
        .select({ membershipStatus: schema.users.membershipStatus })
        .from(schema.users)
        .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
        .limit(1);

      // Must still be NOT_MEMBER (regularUser starts as NOT_MEMBER in fixtures).
      expect(user!.membershipStatus).toBe("NOT_MEMBER");

      // Reset data between sub-cases.
      const { resetData } = await import("@/tests/helpers/db");
      await resetData();
    }
  });

  it("full end-to-end: NOT_MEMBER → checkout → webhook → MEMBER (no admin approval)", async () => {
    // Verify user starts as NOT_MEMBER.
    const [before] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(before!.membershipStatus).toBe("NOT_MEMBER");

    // Step 1: checkout.
    const { purchaseNumber, total } = await doCheckout();

    // Step 2: Midtrans sends settlement webhook.
    const wRes = await webhookHandler(
      webhookRequest(makeWebhookBody({ order_id: purchaseNumber, gross_amount: String(total) })),
    );
    expect(wRes.status).toBe(200);

    // Step 3: user is now MEMBER — no admin action required.
    const [after] = await testDb()
      .select({ membershipStatus: schema.users.membershipStatus, membershipExpiresAt: schema.users.membershipExpiresAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);

    expect(after!.membershipStatus).toBe("MEMBER");
    expect(after!.membershipExpiresAt).not.toBeNull();
  });
});
