/**
 * Ticket 08 — Admin dashboard summary
 *
 * GET /api/admin/dashboard
 *
 * Acceptance criteria:
 *   - Returns total orders (this month + all-time), total revenue (from paid
 *     orders), total customers, pending order count, and 5 recent orders.
 *   - Numbers match the seeded fixture exactly.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { GET as getDashboard } from "@/app/api/admin/dashboard/route";
import { createSessionToken } from "@/src/lib/auth/session";
import * as schema from "@/src/db/schema";
import { testDb } from "@/tests/helpers/db";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── Helpers ───────────────────────────────────────────────────────────────────

function cookie(userId: string) {
  return `roboedu_session=${createSessionToken(userId, false)}`;
}

function adminRequest() {
  return new Request("http://localhost/api/admin/dashboard", {
    headers: { cookie: cookie(FIXTURE_IDS.adminUser) },
  });
}

function customerRequest() {
  return new Request("http://localhost/api/admin/dashboard", {
    headers: { cookie: cookie(FIXTURE_IDS.regularUser) },
  });
}

// ── Auth guards ───────────────────────────────────────────────────────────────

describe("auth guards", () => {
  it("returns 401 for an unauthenticated request", async () => {
    const res = await getDashboard(
      new Request("http://localhost/api/admin/dashboard") as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for a non-admin (CUSTOMER) user", async () => {
    const res = await getDashboard(customerRequest() as any);
    expect(res.status).toBe(403);
  });
});

// ── GET /api/admin/dashboard — fixture assertions ─────────────────────────────

describe("GET /api/admin/dashboard", () => {
  it("returns 200 with success:true for an admin", async () => {
    const res = await getDashboard(adminRequest() as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns the expected fixture aggregations", async () => {
    const res = await getDashboard(adminRequest() as any);
    const json = await res.json();
    const data = json.data;

    // Fixture seeds exactly 1 order (status=pending, paidAt=null)
    expect(data.total_orders_all_time).toBe(1);

    // The fixture order is inserted with CURRENT_TIMESTAMP, so it is in the
    // current month.
    expect(data.total_orders_this_month).toBe(1);

    // No order has paidAt set in the fixture → revenue = 0
    expect(data.total_revenue).toBe(0);

    // 2 CUSTOMER users seeded: regularUser + memberUser
    expect(data.total_customers).toBe(2);

    // 1 pending order
    expect(data.pending_orders).toBe(1);
  });

  it("recent_orders contains at most 5 entries", async () => {
    const res = await getDashboard(adminRequest() as any);
    const json = await res.json();
    expect(json.data.recent_orders.length).toBeLessThanOrEqual(5);
  });

  it("recent_orders has the required fields", async () => {
    const res = await getDashboard(adminRequest() as any);
    const json = await res.json();
    const recentOrders: unknown[] = json.data.recent_orders;

    // Fixture has 1 order
    expect(recentOrders).toHaveLength(1);

    const order = recentOrders[0] as Record<string, unknown>;
    expect(order.id).toBe(FIXTURE_IDS.order);
    expect(order.order_number).toBe("TEST-ORD-1");
    expect(order.status).toBe("pending");
    expect(order.total).toBe(215000);
    expect(typeof order.created_at).toBe("string");
    expect(order.customer_name).toBe("Regular User");
    expect(order.customer_email).toBe("regular.test@roboedu.test");
  });

  it("total_revenue increases when an order is marked as paid", async () => {
    const db = testDb();

    // Simulate the order being paid (set paidAt to now)
    await db
      .update(schema.orders)
      .set({ status: "PAID", paidAt: new Date() })
      .where(eq(schema.orders.id, FIXTURE_IDS.order));

    const res = await getDashboard(adminRequest() as any);
    const json = await res.json();

    // Now the paid order contributes its total to revenue
    expect(json.data.total_revenue).toBe(215000);

    // pending_orders should now be 0 (order is no longer "pending" status)
    expect(json.data.pending_orders).toBe(0);
  });

  it("total_orders_this_month is 0 for an order created last month", async () => {
    const db = testDb();

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Back-date the fixture order to last month
    await db
      .update(schema.orders)
      .set({ createdAt: lastMonth })
      .where(eq(schema.orders.id, FIXTURE_IDS.order));

    const res = await getDashboard(adminRequest() as any);
    const json = await res.json();

    expect(json.data.total_orders_this_month).toBe(0);
    // All-time count should still include it
    expect(json.data.total_orders_all_time).toBe(1);
  });
});
