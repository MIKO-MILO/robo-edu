/**
 * Behavior tests for ticket 10: GET /api/admin/inventory/low-stock.
 *
 * Pattern (see tests/admin/settings.test.ts):
 *   - Call the real route handler with a real Request against the real test DB.
 *   - Admin auth goes through the production path: seed an admin user, mint a
 *     real HMAC-signed session token, seed the `next/headers` stub's cookie
 *     store with it — so `requireAdmin()` runs its full DB-backed check.
 *   - Assert on the HTTP response (collection envelope) and the filtered rows.
 *
 * The DB is reset + reseeded before every test by tests/setup.ts, so each test
 * starts from the deterministic fixtures. The base fixtures intentionally have
 * NO low-stock variant (one variant at stock 50 / threshold 0 = disabled, one
 * at stock 30 / threshold 5 = above threshold), so each behavior test seeds
 * its own low-stock variants to exercise the filter.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/admin/inventory/low-stock/route";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { hashPassword } from "@/src/lib/auth/password";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

const ADMIN_ID = "test-admin-low-stock";
const ADMIN_EMAIL = "admin.lowstock@roboedu.test";
const ADMIN_PASSWORD = "Password123!";

/** Low-stock variants seeded onto the fixture product for behavior tests.
 *  ids/skus are fixed so assertions can reference them by constant. */
const LOW_STOCK_VARIANTS = [
  {
    id: "test-var-low-a",
    variantName: "Low Stock A",
    sku: "TEST-LS-A",
    stock: 2,
    lowStockThreshold: 5, // 2 <= 5 → flagged
  },
  {
    id: "test-var-oos",
    variantName: "Out Of Stock",
    sku: "TEST-LS-OOS",
    stock: 0,
    lowStockThreshold: 3, // 0 <= 3 → flagged
  },
  {
    id: "test-var-at",
    variantName: "At Threshold",
    sku: "TEST-LS-AT",
    stock: 5,
    lowStockThreshold: 5, // 5 <= 5 → flagged (at the boundary)
  },
  {
    id: "test-var-disabled",
    variantName: "Disabled Zero",
    sku: "TEST-LS-DIS",
    stock: 0,
    lowStockThreshold: 0, // threshold 0 = alerts disabled → NOT flagged
  },
] as const;

/** Insert the admin user the auth guard will resolve. */
async function seedAdmin(
  overrides: Partial<typeof schema.users.$inferInsert> = {},
) {
  await testDb().insert(schema.users).values({
    id: ADMIN_ID,
    name: "Low-Stock Admin",
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

/** Seed the low-stock variants onto the existing fixture product. */
async function seedLowStockVariants() {
  await testDb().insert(schema.productVariants).values(
    LOW_STOCK_VARIANTS.map((v) => ({
      id: v.id,
      productId: FIXTURE_IDS.product,
      variantName: v.variantName,
      sku: v.sku,
      price: "100000.00",
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      weight: 800,
      status: "active",
    })),
  );
}

function lowStockRequest(query?: Record<string, string | number>): NextRequest {
  const url = new URL("http://localhost/api/admin/inventory/low-stock");
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  }
  return new NextRequest(url, { method: "GET" });
}

// ──────────────────────────────────────────────────────────────────────────
// Auth — requireAdmin() guards the route (ticket 07 dependency)
// ──────────────────────────────────────────────────────────────────────────
describe("GET /api/admin/inventory/low-stock — auth", () => {
  beforeEach(seedAdmin);

  it("rejects an unauthenticated request with 401", async () => {
    const res = await GET(lowStockRequest());
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects a non-admin (CUSTOMER) session with 403", async () => {
    asCustomer(FIXTURE_IDS.regularUser);
    const res = await GET(lowStockRequest());
    expect(res.status).toBe(403);
    expect((await res.json()).success).toBe(false);
  });

  it("rejects an inactive admin with 403", async () => {
    await testDb()
      .update(schema.users)
      .set({ isActive: false })
      .where(eq(schema.users.id, ADMIN_ID));
    asAdmin();
    const res = await GET(lowStockRequest());
    expect(res.status).toBe(403);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Criterion 1 — only variants at or below their low_stock_threshold
// Criterion 2 — each row carries product name, variant name, stock, threshold
// ──────────────────────────────────────────────────────────────────────────
describe("GET /api/admin/inventory/low-stock — low-stock filter", () => {
  beforeEach(async () => {
    await seedAdmin();
    await seedLowStockVariants();
  });

  it("returns only variants at or below their own threshold", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    // Flagged: Low Stock A (2<=5), Out Of Stock (0<=3), At Threshold (5<=5).
    // Not flagged: Disabled Zero (threshold 0 = disabled) and both base
    // fixture variants (stock 50/threshold 0, stock 30/threshold 5).
    const names = json.data.map((r: { variant_name: string }) => r.variant_name);
    expect(names.sort()).toEqual(
      ["At Threshold", "Low Stock A", "Out Of Stock"].sort(),
    );
  });

  it("excludes threshold-0 (alerts-disabled) variants even at stock 0", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    const json = await res.json();
    const names = json.data.map((r: { variant_name: string }) => r.variant_name);
    expect(names).not.toContain("Disabled Zero");
    // The base fixture variant with threshold 0 and stock 50 is also disabled.
    expect(names).not.toContain("With Member Price");
  });

  it("includes variants sitting exactly at their threshold (at or below)", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    const json = await res.json();
    const atThreshold = json.data.find(
      (r: { variant_name: string }) => r.variant_name === "At Threshold",
    );
    expect(atThreshold).toBeDefined();
    expect(atThreshold.stock).toBe(5);
    expect(atThreshold.threshold).toBe(5);
  });

  it("returns each row with the required fields and correct values", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    const json = await res.json();

    const oos = json.data.find(
      (r: { variant_name: string }) => r.variant_name === "Out Of Stock",
    );
    expect(oos).toEqual({
      product_id: FIXTURE_IDS.product,
      product_name: "Line Follower Robot Kit (Test)",
      variant_id: "test-var-oos",
      variant_name: "Out Of Stock",
      stock: 0,
      threshold: 3,
    });
  });

  it("orders the most-depleted variants first (stock ascending)", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    const json = await res.json();
    const stocks = json.data.map((r: { stock: number }) => r.stock);
    expect(stocks).toEqual([...stocks].sort((a, b) => a - b));
  });

  it("returns an empty collection when nothing is low on stock", async () => {
    // Remove the seeded low-stock variants so only the base fixtures remain
    // (none of which are low stock), then expect an empty result.
    await testDb()
      .delete(schema.productVariants)
      .where(
        inArray(
          schema.productVariants.id,
          LOW_STOCK_VARIANTS.map((v) => v.id),
        ),
      );
    asAdmin();

    const res = await GET(lowStockRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.meta.total_count).toBe(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Pagination meta (collection envelope contract)
// ──────────────────────────────────────────────────────────────────────────
describe("GET /api/admin/inventory/low-stock — pagination", () => {
  beforeEach(async () => {
    await seedAdmin();
    await seedLowStockVariants();
  });

  it("returns pagination meta reflecting the full filtered set", async () => {
    asAdmin();
    const res = await GET(lowStockRequest());
    const json = await res.json();
    expect(json.meta).toEqual({
      current_page: 1,
      per_page: 50,
      total_pages: 1,
      total_count: 3,
    });
  });

  it("paginates with page/limit query params", async () => {
    asAdmin();
    const res = await GET(lowStockRequest({ page: 1, limit: 2 }));
    const json = await res.json();
    expect(json.data).toHaveLength(2);
    expect(json.meta).toEqual({
      current_page: 1,
      per_page: 2,
      total_pages: 2,
      total_count: 3,
    });
  });

  it("returns an empty page (not an error) past the last page", async () => {
    asAdmin();
    const res = await GET(lowStockRequest({ page: 2, limit: 50 }));
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.meta.total_count).toBe(3);
    expect(json.meta.current_page).toBe(2);
  });
});
