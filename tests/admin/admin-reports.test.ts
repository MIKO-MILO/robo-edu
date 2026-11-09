/**
 * Ticket 09 — Admin sales & top-products reports
 *
 * GET /api/admin/reports/sales
 * GET /api/admin/reports/top-products
 *
 * Acceptance criteria:
 *   - The sales report respects the date range and returns correct revenue +
 *     transaction count.
 *   - The top-products report ranks by units sold DESC and respects `limit` +
 *     the date range.
 *   - Tests assert both reports against the seeded fixture data.
 */
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { GET as getSalesReport } from "@/app/api/admin/reports/sales/route";
import { GET as getTopProducts } from "@/app/api/admin/reports/top-products/route";
import { createSessionToken } from "@/src/lib/auth/session";
import * as schema from "@/src/db/schema";
import { testDb } from "@/tests/helpers/db";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── Helpers ───────────────────────────────────────────────────────────────────

function cookie(userId: string) {
  return `roboedu_session=${createSessionToken(userId, false)}`;
}

/** Build a Request with admin auth and given search params. */
function salesRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/admin/reports/sales");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), {
    headers: { cookie: cookie(FIXTURE_IDS.adminUser) },
  });
}

function topProductsRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/admin/reports/top-products");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), {
    headers: { cookie: cookie(FIXTURE_IDS.adminUser) },
  });
}

function customerRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    headers: { cookie: cookie(FIXTURE_IDS.regularUser) },
  });
}

/** Wide date range that covers the entire test run (fixture orders use CURRENT_TIMESTAMP). */
const WIDE_RANGE = { from: "2020-01-01", to: "2099-12-31" };

/** Mark the fixture order as paid so it is counted in revenue/unit reports. */
async function markOrderPaid() {
  const db = testDb();
  await db
    .update(schema.orders)
    .set({ status: "PAID", paidAt: new Date() })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));
}

// ── Auth guards — sales ────────────────────────────────────────────────────────

describe("auth guards — /api/admin/reports/sales", () => {
  it("returns 401 for an unauthenticated request", async () => {
    const res = await getSalesReport(
      new Request(
        "http://localhost/api/admin/reports/sales?from=2020-01-01&to=2099-12-31",
      ) as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for a CUSTOMER user", async () => {
    const res = await getSalesReport(
      customerRequest(
        "/api/admin/reports/sales?from=2020-01-01&to=2099-12-31",
      ) as any,
    );
    expect(res.status).toBe(403);
  });
});

// ── Auth guards — top-products ────────────────────────────────────────────────

describe("auth guards — /api/admin/reports/top-products", () => {
  it("returns 401 for an unauthenticated request", async () => {
    const res = await getTopProducts(
      new Request(
        "http://localhost/api/admin/reports/top-products?from=2020-01-01&to=2099-12-31",
      ) as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for a CUSTOMER user", async () => {
    const res = await getTopProducts(
      customerRequest(
        "/api/admin/reports/top-products?from=2020-01-01&to=2099-12-31",
      ) as any,
    );
    expect(res.status).toBe(403);
  });
});

// ── Validation — sales ────────────────────────────────────────────────────────

describe("validation — /api/admin/reports/sales", () => {
  it("returns 400 when from/to are missing", async () => {
    const res = await getSalesReport(salesRequest() as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when from/to are not valid dates", async () => {
    const res = await getSalesReport(
      salesRequest({ from: "not-a-date", to: "also-bad" }) as any,
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

// ── Validation — top-products ─────────────────────────────────────────────────

describe("validation — /api/admin/reports/top-products", () => {
  it("returns 400 when from/to are missing", async () => {
    const res = await getTopProducts(topProductsRequest() as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });
});

// ── GET /api/admin/reports/sales — fixture assertions ─────────────────────────

describe("GET /api/admin/reports/sales", () => {
  it("returns 200 with success:true for an admin", async () => {
    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns summary with revenue 0 and 0 transactions when no paid order exists", async () => {
    // Fixture order has paidAt=null → excluded
    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();
    expect(json.data.summary.total_revenue).toBe(0);
    expect(json.data.summary.transaction_count).toBe(0);
  });

  it("counts revenue and transactions once the fixture order is marked paid", async () => {
    await markOrderPaid();

    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();

    // Fixture order total = 215000
    expect(json.data.summary.total_revenue).toBe(215000);
    expect(json.data.summary.transaction_count).toBe(1);
  });

  it("by_day contains one entry for the paid order", async () => {
    await markOrderPaid();

    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.by_day).toHaveLength(1);
    const day = json.data.by_day[0] as Record<string, unknown>;
    expect(typeof day.date).toBe("string");
    expect(day.revenue).toBe(215000);
    expect(day.transaction_count).toBe(1);
  });

  it("by_week contains one entry for the paid order", async () => {
    await markOrderPaid();

    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.by_week).toHaveLength(1);
    const week = json.data.by_week[0] as Record<string, unknown>;
    expect(typeof week.week).toBe("string");
    // Week label format: YYYY-Www
    expect((week.week as string)).toMatch(/^\d{4}-W\d{2}$/);
    expect(week.revenue).toBe(215000);
  });

  it("by_month contains one entry for the paid order", async () => {
    await markOrderPaid();

    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.by_month).toHaveLength(1);
    const month = json.data.by_month[0] as Record<string, unknown>;
    expect(typeof month.month).toBe("string");
    // Month label format: YYYY-MM
    expect((month.month as string)).toMatch(/^\d{4}-\d{2}$/);
    expect(month.revenue).toBe(215000);
  });

  it("excludes paid orders outside the date range", async () => {
    await markOrderPaid();

    // Use a narrow range in the past that excludes the current-timestamp fixture
    const pastRange = { from: "2000-01-01", to: "2000-01-31" };
    const res = await getSalesReport(salesRequest(pastRange) as any);
    const json = await res.json();

    expect(json.data.summary.transaction_count).toBe(0);
    expect(json.data.summary.total_revenue).toBe(0);
    expect(json.data.by_day).toHaveLength(0);
  });

  it("unpaid orders are always excluded regardless of date range", async () => {
    // paidAt remains null (default fixture state — no markOrderPaid call here)
    const res = await getSalesReport(salesRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.summary.transaction_count).toBe(0);
    expect(json.data.summary.total_revenue).toBe(0);
  });
});

// ── GET /api/admin/reports/top-products — fixture assertions ──────────────────

describe("GET /api/admin/reports/top-products", () => {
  it("returns 200 with success:true and an empty products array when no paid orders", async () => {
    // Fixture order is pending → no paid items
    const res = await getTopProducts(topProductsRequest(WIDE_RANGE) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.products).toHaveLength(0);
  });

  it("returns the fixture product once its order is marked paid", async () => {
    await markOrderPaid();

    const res = await getTopProducts(topProductsRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.products).toHaveLength(1);
    const top = json.data.products[0] as Record<string, unknown>;

    // Fixture: product = "test-prod-line-follower", qty = 1
    expect(top.product_id).toBe(FIXTURE_IDS.product);
    expect(top.product_name).toBe("Line Follower Robot Kit (Test)");
    expect(top.total_sold).toBe(1);
    // subtotal in the order item = 200000
    expect(top.total_revenue).toBe(200000);
  });

  it("respects the limit parameter — limit=1 returns at most 1 product", async () => {
    await markOrderPaid();

    const res = await getTopProducts(
      topProductsRequest({ ...WIDE_RANGE, limit: "1" }) as any,
    );
    const json = await res.json();

    expect(json.data.products.length).toBeLessThanOrEqual(1);
  });

  it("respects the date range — orders outside the range are excluded", async () => {
    await markOrderPaid();

    const pastRange = { from: "2000-01-01", to: "2000-01-31" };
    const res = await getTopProducts(topProductsRequest(pastRange) as any);
    const json = await res.json();

    expect(json.data.products).toHaveLength(0);
  });

  it("only includes items from paid orders — unpaid order items are excluded", async () => {
    // paidAt = null (default fixture) — should not appear
    const res = await getTopProducts(topProductsRequest(WIDE_RANGE) as any);
    const json = await res.json();

    expect(json.data.products).toHaveLength(0);
  });
});
