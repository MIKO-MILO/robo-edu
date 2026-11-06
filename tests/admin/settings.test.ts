/**
 * Behavior tests for ticket 11: Admin settings (GET / PATCH /api/admin/settings).
 *
 * Pattern (see tests/example/auth-login.example.test.ts):
 *   - Call the real route handlers with a real Request against the real test DB.
 *   - Admin auth goes through the production path: we seed an admin user, mint a
 *     real HMAC-signed session token, and seed the `next/headers` stub's cookie
 *     store with it — so `requireAdmin()` runs its full DB-backed check.
 *   - Assert on the HTTP response and the resulting DB state.
 *
 * The DB is reset + reseeded before every test by tests/setup.ts, so each test
 * starts from the deterministic fixtures (which include the six seed settings).
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { GET, PATCH } from "@/app/api/admin/settings/route";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { hashPassword } from "@/src/lib/auth/password";
import { getSetting } from "@/src/lib/services/settings-service";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import {
  FIXTURE_IDS,
  SETTINGS_SEED,
} from "@/tests/helpers/fixtures";

const ADMIN_ID = "test-admin-settings";
const ADMIN_EMAIL = "admin.settings@roboedu.test";
const ADMIN_PASSWORD = "Password123!";

/** The seed settings as a flat record, sourced from the single fixture
 *  definition so the test stays correct if the seed changes. */
const SEED_SETTINGS: Record<string, string> = Object.fromEntries(
  SETTINGS_SEED.map((s) => [s.key, s.value]),
);

async function seedAdmin(overrides: Partial<typeof schema.users.$inferInsert> = {}) {
  await testDb().insert(schema.users).values({
    id: ADMIN_ID,
    name: "Settings Admin",
    email: ADMIN_EMAIL,
    password: await hashPassword(ADMIN_PASSWORD),
    role: "admin",
    membershipStatus: "NOT_MEMBER",
    isActive: true,
    ...overrides,
  });
}

/** Authenticate as the seeded admin via the real signed-session path. */
function asAdmin() {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(ADMIN_ID, false));
}

/** Authenticate as a regular (CUSTOMER) user via the real session path. */
function asCustomer(userId: string) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

function patchRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/admin/settings", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ──────────────────────────────────────────────────────────────────────────
// Criterion 1 — GET returns all settings as a flat object
// ──────────────────────────────────────────────────────────────────────────
describe("GET /api/admin/settings", () => {
  beforeEach(seedAdmin);

  it("returns all settings as a flat key-value object", async () => {
    asAdmin();

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    // Flat object: every value is a string, matching the key-value storage.
    expect(json.data).toEqual(SEED_SETTINGS);
    for (const v of Object.values(json.data as Record<string, unknown>)) {
      expect(typeof v).toBe("string");
    }
  });

  it("rejects an unauthenticated request with 401", async () => {
    // No cookie seeded → requireAdmin() returns 401.
    const res = await GET();
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects a non-admin (CUSTOMER) session with 403", async () => {
    asCustomer(FIXTURE_IDS.regularUser);

    const res = await GET();
    expect(res.status).toBe(403);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects an inactive admin with 403", async () => {
    // seedAdmin already inserted an active admin; overwrite to inactive here.
    await testDb()
      .update(schema.users)
      .set({ isActive: false })
      .where(eq(schema.users.id, ADMIN_ID));
    asAdmin();

    const res = await GET();
    expect(res.status).toBe(403);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Criterion 2 — PATCH updates only the sent keys and returns updated state
// ──────────────────────────────────────────────────────────────────────────
describe("PATCH /api/admin/settings", () => {
  beforeEach(seedAdmin);

  it("updates only the sent keys and returns the full updated state", async () => {
    asAdmin();

    const res = await PATCH(
      patchRequest({
        store_name: "RoboEdu Baru",
        membership_plus_price: "250000",
      }),
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      ...SEED_SETTINGS,
      store_name: "RoboEdu Baru",
      membership_plus_price: "250000",
    });

    // Untouched keys are still the seed values.
    const db = testDb();
    const [phone] = await db
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "store_phone"))
      .limit(1);
    expect(phone?.value).toBe(SEED_SETTINGS.store_phone);

    // Sent keys are persisted.
    const [name] = await db
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "store_name"))
      .limit(1);
    expect(name?.value).toBe("RoboEdu Baru");
  });

  it("normalizes numeric values and stores them as strings", async () => {
    asAdmin();

    const res = await PATCH(
      patchRequest({ membership_plus_price: 299000 }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.membership_plus_price).toBe("299000");
  });

  it("rejects an unknown key with 422 and lists allowed keys", async () => {
    asAdmin();

    const res = await PATCH(patchRequest({ bogus_key: "x" }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.allowed_keys).toEqual(expect.arrayContaining(Object.keys(SEED_SETTINGS)));
  });

  it("rejects an empty body with 422", async () => {
    asAdmin();

    const res = await PATCH(patchRequest({}));
    expect(res.status).toBe(422);
  });

  it("rejects a non-object body with 400", async () => {
    asAdmin();

    const res = await PATCH(patchRequest([1, 2, 3]));
    expect(res.status).toBe(400);
  });

  it("rejects a negative price with 422", async () => {
    asAdmin();

    const res = await PATCH(patchRequest({ membership_plus_price: "-100" }));
    expect(res.status).toBe(422);
  });

  it("rejects a non-integer membership duration with 422", async () => {
    asAdmin();

    const res = await PATCH(
      patchRequest({ membership_plus_duration_months: "6.5" }),
    );
    expect(res.status).toBe(422);
  });

  it("rejects an invalid store email with 422", async () => {
    asAdmin();

    const res = await PATCH(patchRequest({ store_email: "not-an-email" }));
    expect(res.status).toBe(422);
  });

  it("rejects a shipping default provider that does not exist", async () => {
    asAdmin();

    const res = await PATCH(
      patchRequest({ shipping_default_provider_id: "no-such-provider" }),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).message).toContain("Provider");
  });

  it("writes nothing when any field is invalid (no partial update)", async () => {
    asAdmin();

    // One valid field + one invalid FK in the same request. Every field is
    // validated before any write, so the valid field must not persist either.
    const res = await PATCH(
      patchRequest({
        store_name: "Should Not Persist",
        shipping_default_provider_id: "no-such-provider",
      }),
    );
    expect(res.status).toBe(422);

    const [row] = await testDb()
      .select({ value: schema.settings.value })
      .from(schema.settings)
      .where(eq(schema.settings.key, "store_name"))
      .limit(1);
    expect(row?.value).toBe(SEED_SETTINGS.store_name);
  });

  it("accepts a real shipping provider id and stores it", async () => {
    asAdmin();
    const db = testDb();
    await db.insert(schema.shippingProviders).values({
      id: "prov-jne",
      name: "JNE",
    });

    const res = await PATCH(
      patchRequest({ shipping_default_provider_id: "prov-jne" }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).data.shipping_default_provider_id).toBe("prov-jne");
  });

  it("rejects a non-admin with 403 (no write happens)", async () => {
    asCustomer(FIXTURE_IDS.regularUser);

    const res = await PATCH(
      patchRequest({ membership_plus_price: "999999" }),
    );
    expect(res.status).toBe(403);

    // Price unchanged in the DB.
    expect(await getSetting("membership_plus_price")).toBe(
      SEED_SETTINGS.membership_plus_price,
    );
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Criterion 3 — changing membership_plus_price changes the price readers see
// (the membership checkout reads the price live from settings, not from code)
// ──────────────────────────────────────────────────────────────────────────
describe("membership_plus_price is read live from settings", () => {
  beforeEach(seedAdmin);

  it("a PATCH is immediately visible to a subsequent read (no redeploy)", async () => {
    asAdmin();

    // The price a checkout would read before the change.
    expect(await getSetting("membership_plus_price")).toBe("150000");

    const res = await PATCH(
      patchRequest({ membership_plus_price: "399000" }),
    );
    expect(res.status).toBe(200);

    // The same read path the membership checkout will use now sees the new
    // price — proving a price change takes effect immediately, with no code or
    // env change required.
    expect(await getSetting("membership_plus_price")).toBe("399000");

    // And the GET endpoint surfaces it too.
    const getRes = await GET();
    expect((await getRes.json()).data.membership_plus_price).toBe("399000");
  });
});
