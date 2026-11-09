/**
 * Ticket 16 — Admin logs: audit instrumentation + viewer endpoints
 *
 * Tests cover:
 *   - Order status change writes an audit_logs row
 *   - Review moderation writes an audit_logs row
 *   - User status update writes an audit_logs row
 *   - GET /api/admin/audit-log — paginated, filterable by action + actor
 *   - GET /api/admin/email-log — paginated
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq, and } from "drizzle-orm";
import { GET as getAuditLog } from "@/app/api/admin/audit-log/route";
import { GET as getEmailLog } from "@/app/api/admin/email-log/route";
import { PATCH as patchOrderStatus } from "@/app/api/admin/orders/[id]/status/route";
import { PATCH as patchReviewStatus } from "@/app/api/admin/reviews/[id]/status/route";
import { PATCH as patchUserStatus } from "@/app/api/admin/users/[id]/status/route";
import { createSessionToken } from "@/src/lib/auth/session";
import * as schema from "@/src/db/schema";
import { testDb } from "@/tests/helpers/db";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import crypto from "node:crypto";

// ── helpers ──────────────────────────────────────────────────────────────────

function adminCookie() {
  return `roboedu_session=${createSessionToken(FIXTURE_IDS.adminUser, false)}`;
}

function customerCookie() {
  return `roboedu_session=${createSessionToken(FIXTURE_IDS.regularUser, false)}`;
}

function adminRequest(method: string, path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      cookie: adminCookie(),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function makeCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

/** Seed the fixture order into PAID status so it can be advanced to PROCESSING. */
async function setOrderPaid() {
  await testDb()
    .update(schema.orders)
    .set({ status: "PAID" })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));
}

/** Seed a review for the fixture order item + return its id. */
async function seedReview(): Promise<string> {
  const id = crypto.randomUUID();
  await testDb().insert(schema.reviews).values({
    id,
    orderItemId: FIXTURE_IDS.orderItem,
    userId: FIXTURE_IDS.regularUser,
    productId: FIXTURE_IDS.product,
    rating: 4,
    comment: "Oke",
    status: "PUBLISHED",
  });
  return id;
}

/** Seed an email_log row and return its id. */
async function seedEmailLog(): Promise<string> {
  const id = crypto.randomUUID();
  await testDb().insert(schema.emailLogs).values({
    id,
    userId: FIXTURE_IDS.regularUser,
    orderId: FIXTURE_IDS.order,
    email: "regular.test@roboedu.test",
    type: "order_confirmation",
    subject: "Pesanan kamu sudah dikonfirmasi",
    status: "SENT",
    sentAt: new Date("2026-10-01T10:05:00Z"),
  });
  return id;
}

// ── Audit instrumentation ─────────────────────────────────────────────────────

describe("audit instrumentation — order status change", () => {
  it("writes an audit_logs row when order status is changed", async () => {
    await setOrderPaid();

    const res = await patchOrderStatus(
      adminRequest("PATCH", `/api/admin/orders/${FIXTURE_IDS.order}/status`, {
        status: "PROCESSING",
      }) as any,
      makeCtx(FIXTURE_IDS.order),
    );
    expect(res.status).toBe(200);

    const [row] = await testDb()
      .select()
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.targetType, "order"),
          eq(schema.auditLogs.targetId, FIXTURE_IDS.order),
        ),
      )
      .limit(1);

    expect(row).toBeDefined();
    expect(row!.actorId).toBe(FIXTURE_IDS.adminUser);
    expect(row!.action).toMatch(/order/);
    expect(row!.targetId).toBe(FIXTURE_IDS.order);
  });
});

describe("audit instrumentation — review moderation", () => {
  it("writes an audit_logs row when review status is changed", async () => {
    const reviewId = await seedReview();

    const res = await patchReviewStatus(
      adminRequest("PATCH", `/api/admin/reviews/${reviewId}/status`, {
        status: "HIDDEN",
      }) as any,
      makeCtx(reviewId),
    );
    expect(res.status).toBe(200);

    const [row] = await testDb()
      .select()
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.targetType, "review"),
          eq(schema.auditLogs.targetId, reviewId),
        ),
      )
      .limit(1);

    expect(row).toBeDefined();
    expect(row!.action).toMatch(/review/);
  });
});

describe("audit instrumentation — user status update", () => {
  it("writes an audit_logs row when user is_active is toggled", async () => {
    const res = await patchUserStatus(
      adminRequest("PATCH", `/api/admin/users/${FIXTURE_IDS.regularUser}/status`, {
        is_active: false,
      }) as any,
      makeCtx(FIXTURE_IDS.regularUser),
    );
    expect(res.status).toBe(200);

    const [row] = await testDb()
      .select()
      .from(schema.auditLogs)
      .where(
        and(
          eq(schema.auditLogs.targetType, "user"),
          eq(schema.auditLogs.targetId, FIXTURE_IDS.regularUser),
        ),
      )
      .limit(1);

    expect(row).toBeDefined();
    expect(row!.action).toMatch(/user/);
  });
});

// ── GET /api/admin/audit-log ──────────────────────────────────────────────────

describe("GET /api/admin/audit-log", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const res = await getAuditLog(
      new Request("http://localhost/api/admin/audit-log") as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    const res = await getAuditLog(
      new Request("http://localhost/api/admin/audit-log", {
        headers: { cookie: customerCookie() },
      }) as any,
    );
    expect(res.status).toBe(403);
  });

  it("returns an empty list when no audit rows exist", async () => {
    const res = await getAuditLog(
      adminRequest("GET", "/api/admin/audit-log") as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(json.meta.total_count).toBe(0);
  });

  it("returns audit rows after an order status change", async () => {
    await setOrderPaid();
    await patchOrderStatus(
      adminRequest("PATCH", `/api/admin/orders/${FIXTURE_IDS.order}/status`, {
        status: "PROCESSING",
      }) as any,
      makeCtx(FIXTURE_IDS.order),
    );

    const res = await getAuditLog(
      adminRequest("GET", "/api/admin/audit-log") as any,
    );
    const json = await res.json();
    expect(json.meta.total_count).toBeGreaterThan(0);
    const row = json.data[0];
    expect(typeof row.action).toBe("string");
    expect(typeof row.created_at).toBe("string");
  });

  it("filters by action", async () => {
    await setOrderPaid();
    await patchOrderStatus(
      adminRequest("PATCH", `/api/admin/orders/${FIXTURE_IDS.order}/status`, {
        status: "PROCESSING",
      }) as any,
      makeCtx(FIXTURE_IDS.order),
    );

    const res = await getAuditLog(
      adminRequest("GET", "/api/admin/audit-log?action=order.status_updated") as any,
    );
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    for (const row of json.data) {
      expect(row.action).toBe("order.status_updated");
    }
  });

  it("filters by actor_id", async () => {
    await setOrderPaid();
    await patchOrderStatus(
      adminRequest("PATCH", `/api/admin/orders/${FIXTURE_IDS.order}/status`, {
        status: "PROCESSING",
      }) as any,
      makeCtx(FIXTURE_IDS.order),
    );

    // Filter by the known admin actor
    const res = await getAuditLog(
      adminRequest("GET", `/api/admin/audit-log?actor_id=${FIXTURE_IDS.adminUser}`) as any,
    );
    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    for (const row of json.data) {
      expect(row.actor_id).toBe(FIXTURE_IDS.adminUser);
    }

    // Filter by unknown actor — should return 0
    const resNone = await getAuditLog(
      adminRequest("GET", "/api/admin/audit-log?actor_id=nonexistent") as any,
    );
    const jsonNone = await resNone.json();
    expect(jsonNone.data).toHaveLength(0);
  });

  it("returns pagination metadata", async () => {
    const res = await getAuditLog(
      adminRequest("GET", "/api/admin/audit-log?page=1&limit=5") as any,
    );
    const json = await res.json();
    expect(json.meta.current_page).toBe(1);
    expect(json.meta.per_page).toBe(5);
    expect(typeof json.meta.total_pages).toBe("number");
  });
});

// ── GET /api/admin/email-log ──────────────────────────────────────────────────

describe("GET /api/admin/email-log", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const res = await getEmailLog(
      new Request("http://localhost/api/admin/email-log") as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    const res = await getEmailLog(
      new Request("http://localhost/api/admin/email-log", {
        headers: { cookie: customerCookie() },
      }) as any,
    );
    expect(res.status).toBe(403);
  });

  it("returns an empty list when no email logs exist", async () => {
    const res = await getEmailLog(
      adminRequest("GET", "/api/admin/email-log") as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(json.meta.total_count).toBe(0);
  });

  it("returns seeded email log rows with correct fields", async () => {
    await seedEmailLog();

    const res = await getEmailLog(
      adminRequest("GET", "/api/admin/email-log") as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.total_count).toBe(1);
    const row = json.data[0];
    expect(row.email).toBe("regular.test@roboedu.test");
    expect(row.type).toBe("order_confirmation");
    expect(row.status).toBe("SENT");
    expect(typeof row.created_at).toBe("string");
  });

  it("returns pagination metadata", async () => {
    await seedEmailLog();

    const res = await getEmailLog(
      adminRequest("GET", "/api/admin/email-log?page=1&limit=5") as any,
    );
    const json = await res.json();
    expect(json.meta.current_page).toBe(1);
    expect(json.meta.per_page).toBe(5);
    expect(typeof json.meta.total_pages).toBe("number");
  });
});
