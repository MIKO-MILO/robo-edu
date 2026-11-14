/**
 * Behavior tests for ticket payment/02: GET /api/payment-methods
 *
 * Pattern: call the real route handler against the real test DB (reset +
 * reseeded before every test via tests/setup.ts). The seed includes
 * `payment_methods_config` with all 14 PRD §11.4 channels active.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq } from "drizzle-orm";

import { GET } from "@/app/api/payment-methods/route";
import { PATCH } from "@/app/api/admin/settings/route";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { hashPassword } from "@/src/lib/auth/password";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { NextRequest } from "next/server";

const ADMIN_ID = "test-admin-pm";
const ADMIN_EMAIL = "admin.pm@roboedu.test";
const ADMIN_PASSWORD = "Password123!";

async function seedAdmin() {
  await testDb().insert(schema.users).values({
    id: ADMIN_ID,
    name: "PM Admin",
    email: ADMIN_EMAIL,
    password: await hashPassword(ADMIN_PASSWORD),
    role: "admin",
    membershipStatus: "NOT_MEMBER",
    isActive: true,
  });
}

function asAdmin() {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(ADMIN_ID, false));
}

function patchRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ──────────────────────────────────────────────────────────────────────────

describe("GET /api/payment-methods", () => {
  it("returns all 14 active channels with method, channel, label, is_active", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);

    // All 14 PRD §11.4 channels should be present (seed has all active).
    expect(json.data).toHaveLength(14);

    // Every entry has the required fields.
    for (const entry of json.data) {
      expect(entry).toHaveProperty("method");
      expect(entry).toHaveProperty("channel");
      expect(entry).toHaveProperty("label");
      expect(entry).toHaveProperty("is_active", true);
    }

    // Spot-check a few channels.
    const channels = json.data.map((e: { channel: string }) => e.channel);
    expect(channels).toContain("bca_va");
    expect(channels).toContain("mandiri_va");
    expect(channels).toContain("credit_card");
    expect(channels).toContain("gopay");
    expect(channels).toContain("qris");
    expect(channels).toContain("dana");
    expect(channels).toContain("ovo");
    expect(channels).toContain("alfamart");
    expect(channels).toContain("indomaret");
  });

  it("filters out channels where is_active=false in settings", async () => {
    // Disable BCA VA and OVO via direct DB write.
    const disabledConfig = JSON.stringify({
      bca_va: false,
      ovo: false,
    });

    await testDb()
      .update(schema.settings)
      .set({ value: disabledConfig })
      .where(eq(schema.settings.key, "payment_methods_config"));

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    const channels = json.data.map((e: { channel: string }) => e.channel);

    // BCA VA and OVO should be filtered out.
    expect(channels).not.toContain("bca_va");
    expect(channels).not.toContain("ovo");

    // Other channels should still be present (12 out of 14).
    expect(json.data).toHaveLength(12);
    expect(channels).toContain("bni_va");
    expect(channels).toContain("indomaret");
  });

  it("returns all channels when payment_methods_config is null", async () => {
    // Delete the config row.
    await testDb()
      .delete(schema.settings)
      .where(eq(schema.settings.key, "payment_methods_config"));

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    // Null config = all channels active (safe default).
    expect(json.data).toHaveLength(14);
  });

  it("returns all channels when config is malformed JSON", async () => {
    await testDb()
      .update(schema.settings)
      .set({ value: "not-json{{" })
      .where(eq(schema.settings.key, "payment_methods_config"));

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    // Malformed JSON = treat as all-active (safe default).
    expect(json.data).toHaveLength(14);
  });
});

// ──────────────────────────────────────────────────────────────────────────

describe("PATCH /api/admin/settings → GET /api/payment-methods integration", () => {
  beforeEach(seedAdmin);

  it("admin can disable a channel via PATCH and it reflects in GET /payment-methods", async () => {
    asAdmin();

    // Disable Dana via PATCH.
    const currentConfig = JSON.stringify({
      dana: false,
    });

    const patchRes = await PATCH(
      patchRequest({ payment_methods_config: currentConfig }),
    );
    expect(patchRes.status).toBe(200);

    // Now GET /payment-methods should not include Dana.
    const res = await GET();
    const json = await res.json();
    const channels = json.data.map((e: { channel: string }) => e.channel);

    expect(channels).not.toContain("dana");
    // Other 13 channels still present.
    expect(json.data).toHaveLength(13);
  });

  it("admin can update order_expires_hours via PATCH", async () => {
    asAdmin();

    const res = await PATCH(patchRequest({ order_expires_hours: "48" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.order_expires_hours).toBe("48");

    // Verify persisted.
    const [row] = await testDb()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "order_expires_hours"))
      .limit(1);
    expect(row?.value).toBe("48");
  });

  it("rejects invalid JSON for payment_methods_config", async () => {
    asAdmin();

    // Send raw invalid JSON string as the value.
    const res = await PATCH(
      patchRequest({ payment_methods_config: "not-json{{" }),
    );
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.message).toContain("JSON");
  });
});

// ──────────────────────────────────────────────────────────────────────────

describe("GET /api/admin/settings includes order_expires_hours", () => {
  beforeEach(seedAdmin);

  it("order_expires_hours is present in the settings response", async () => {
    asAdmin();

    // Import GET from admin settings route.
    const { GET: getSettings } = await import(
      "@/app/api/admin/settings/route"
    );

    const res = await getSettings();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toHaveProperty("order_expires_hours");
    expect(json.data.order_expires_hours).toBe("24");
  });
});
