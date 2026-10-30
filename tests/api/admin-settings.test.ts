import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET as getSettings, PATCH as patchSettings } from "@/app/api/admin/settings/route";
import { POST as checkoutMembership } from "@/app/api/checkout/membership/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { createMockSession } from "@/lib/auth/session";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { eq } from "drizzle-orm";

function createAdminRequest(
  method: string,
  authType: "cookie" | "mock" | "customer" | "none" = "cookie",
  body?: unknown,
): NextRequest {
  const headers: Record<string, string> = {};

  if (authType === "cookie") {
    const token = createSessionToken(FIXTURE_IDS.adminUser, false);
    headers["cookie"] = `${SESSION_COOKIE_NAME}=${token}`;
  } else if (authType === "mock") {
    const token = createMockSession("ADMIN");
    headers["cookie"] = `${SESSION_COOKIE_NAME}=${token}`;
  } else if (authType === "customer") {
    const token = createSessionToken(FIXTURE_IDS.memberUser, false);
    headers["cookie"] = `${SESSION_COOKIE_NAME}=${token}`;
  }

  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }

  return new NextRequest("http://localhost/api/admin/settings", {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/admin/settings", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const req = createAdminRequest("GET", "none");
    const res = await getSettings(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toMatchObject({
      success: false,
      message: "Silakan login terlebih dahulu.",
    });
  });

  it("rejects non-admin (customer) requests with 403", async () => {
    const req = createAdminRequest("GET", "customer");
    const res = await getSettings(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toMatchObject({
      success: false,
      message: "Anda tidak memiliki izin akses admin.",
    });
  });

  it("returns all settings as a flat object for admin with session cookie", async () => {
    const req = createAdminRequest("GET", "cookie");
    const res = await getSettings(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(typeof json.data).toBe("object");

    // Must cover store info
    expect(json.data.store_name).toBe("RoboEdu Test Store");
    expect(json.data.store_phone).toBe("0812000000");
    expect(json.data.store_email).toBe("store@roboedu.test");
    expect(json.data.store_address).toBe("Jl. Test No. 1, Jakarta");

    // Must cover membership price + duration
    expect(json.data.membership_plus_price).toBe("150000");
    expect(json.data.membership_plus_duration_months).toBe("12");

    // Must cover shipping config
    expect(json.data.shipping_min_weight).toBe("1000");
    expect(json.data.shipping_cost).toBe("20000");
    expect(json.data.shipping_default_provider).toBe("J&T");
  });

  it("returns all settings for admin with backward-compatible mock token", async () => {
    const req = createAdminRequest("GET", "mock");
    const res = await getSettings(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.store_name).toBe("RoboEdu Test Store");
  });
});

describe("PATCH /api/admin/settings", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const req = createAdminRequest("PATCH", "none", { store_name: "Test" });
    const res = await patchSettings(req);

    expect(res.status).toBe(401);
  });

  it("rejects non-admin requests with 403", async () => {
    const req = createAdminRequest("PATCH", "customer", { store_name: "Test" });
    const res = await patchSettings(req);

    expect(res.status).toBe(403);
  });

  it("rejects invalid request body (empty or non-object) with 400", async () => {
    const req = createAdminRequest("PATCH", "cookie", {});
    const res = await patchSettings(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("rejects invalid numeric values with 400", async () => {
    const req = createAdminRequest("PATCH", "cookie", { membership_plus_price: -5000 });
    const res = await patchSettings(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("updates only the sent keys, leaves other keys unchanged, and returns updated state", async () => {
    // Before patch: check existing values
    const db = testDb();
    const [nameBefore] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "store_name"));
    expect(nameBefore?.value).toBe("RoboEdu Test Store");

    // Act: update store_name and shipping_cost only
    const req = createAdminRequest("PATCH", "cookie", {
      store_name: "RoboEdu Official Indonesia",
      shipping_cost: "25000",
    });
    const res = await patchSettings(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Updated keys
    expect(json.data.store_name).toBe("RoboEdu Official Indonesia");
    expect(json.data.shipping_cost).toBe("25000");

    // Unsent keys remain untouched
    expect(json.data.store_phone).toBe("0812000000");
    expect(json.data.store_email).toBe("store@roboedu.test");
    expect(json.data.membership_plus_price).toBe("150000");
    expect(json.data.membership_plus_duration_months).toBe("12");

    // Assert: Database rows are updated
    const [nameAfter] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "store_name"));
    expect(nameAfter?.value).toBe("RoboEdu Official Indonesia");

    const [costAfter] = await db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, "shipping_cost"));
    expect(costAfter?.value).toBe("25000");
  });
});

function createCustomerRequest(body?: unknown): NextRequest {
  const token = createSessionToken(FIXTURE_IDS.regularUser, false);
  const headers: Record<string, string> = {
    cookie: `${SESSION_COOKIE_NAME}=${token}`,
  };
  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }
  return new NextRequest("http://localhost/api/checkout/membership", {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe("End-to-end: Changing membership_plus_price changes checkout price", () => {
  it("changes the price charged by POST /api/checkout/membership without redeploy", async () => {
    const db = testDb();

    // 1. First checkout: Uses seeded price (150,000)
    const checkoutReq1 = createCustomerRequest({ package: "PLUS" });
    const res1 = await checkoutMembership(checkoutReq1);

    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.success).toBe(true);
    expect(json1.data.snap_token).toBeDefined();

    // Verify DB snapshot for first purchase
    const [purchase1] = await db
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.purchaseNumber, json1.data.purchase_number));
    expect(purchase1).toBeDefined();
    expect(Number(purchase1.priceSnapshot)).toBe(150000);
    expect(purchase1.durationMonthsSnapshot).toBe(12);
    expect(purchase1.status).toBe("PENDING");

    // Verify payment record
    const [payment1] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, purchase1.id));
    expect(payment1).toBeDefined();
    expect(payment1.orderId).toBeNull();
    expect(Number(payment1.amount)).toBe(150000);

    // 2. Admin updates the price to 350,000 via PATCH /api/admin/settings
    const patchReq = createAdminRequest("PATCH", "cookie", {
      membership_plus_price: "350000",
    });
    const patchRes = await patchSettings(patchReq);
    expect(patchRes.status).toBe(200);

    // 3. Second checkout: Immediately uses updated price (350,000) without redeploy
    const checkoutReq2 = createCustomerRequest({ package: "PLUS" });
    const res2 = await checkoutMembership(checkoutReq2);

    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.success).toBe(true);

    // Verify DB snapshot for second purchase
    const [purchase2] = await db
      .select()
      .from(schema.membershipPurchases)
      .where(eq(schema.membershipPurchases.purchaseNumber, json2.data.purchase_number));
    expect(purchase2).toBeDefined();
    expect(Number(purchase2.priceSnapshot)).toBe(350000);

    // Verify payment record for second purchase
    const [payment2] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.membershipPurchaseId, purchase2.id));
    expect(payment2).toBeDefined();
    expect(payment2.orderId).toBeNull();
    expect(Number(payment2.amount)).toBe(350000);
  });
});


