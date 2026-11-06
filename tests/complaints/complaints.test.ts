/**
 * Ticket 14 — POST /api/complaints + GET /api/complaints
 *
 * Acceptance criteria:
 *   - A customer can submit a complaint only for their own DELIVERED order items
 *   - Attachments are stored and returned
 *   - GET returns only the logged-in user's complaints with status
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { POST as submitComplaint, GET as listComplaints } from "@/app/api/complaints/route";
import { createSessionToken } from "@/src/lib/auth/session";
import * as schema from "@/src/db/schema";
import { testDb } from "@/tests/helpers/db";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── helpers ─────────────────────────────────────────────────────────────────

function cookie(userId: string) {
  return `roboedu_session=${createSessionToken(userId, false)}`;
}

function postRequest(userId: string, body: unknown) {
  return new Request("http://localhost/api/complaints", {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookie(userId) },
    body: JSON.stringify(body),
  });
}

function getRequest(userId: string) {
  return new Request("http://localhost/api/complaints", {
    headers: { cookie: cookie(userId) },
  });
}

// Upgrade the seeded fixture order to DELIVERED before each test so the
// complaint gate passes. resetData (called in global beforeEach) resets it
// back to "pending" between tests.
async function setOrderDelivered() {
  await testDb()
    .update(schema.orders)
    .set({ status: "DELIVERED" })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));
}

// ── POST /api/complaints ─────────────────────────────────────────────────────

describe("POST /api/complaints", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const res = await submitComplaint(
      new Request("http://localhost/api/complaints", { method: "POST" }) as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns 422 when required fields are missing", async () => {
    await setOrderDelivered();
    const res = await submitComplaint(
      postRequest(FIXTURE_IDS.regularUser, { reason: "Rusak" }) as any,
    );
    expect(res.status).toBe(422);
  });

  it("returns 404 when order_item_id belongs to a different user", async () => {
    await setOrderDelivered();
    // memberUser does not own the fixture order item
    const res = await submitComplaint(
      postRequest(FIXTURE_IDS.memberUser, {
        order_item_id: FIXTURE_IDS.orderItem,
        reason: "Produk rusak",
        description: "Layar tidak menyala sejak diterima.",
      }) as any,
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when the order is not DELIVERED", async () => {
    // order status remains "pending" (default from fixture)
    const res = await submitComplaint(
      postRequest(FIXTURE_IDS.regularUser, {
        order_item_id: FIXTURE_IDS.orderItem,
        reason: "Produk rusak",
        description: "Layar tidak menyala sejak diterima.",
      }) as any,
    );
    expect(res.status).toBe(409);
  });

  it("creates a complaint and returns 201 (no attachments)", async () => {
    await setOrderDelivered();

    const res = await submitComplaint(
      postRequest(FIXTURE_IDS.regularUser, {
        order_item_id: FIXTURE_IDS.orderItem,
        reason: "Produk rusak",
        description: "Layar tidak menyala sejak diterima.",
      }) as any,
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.order_item_id).toBe(FIXTURE_IDS.orderItem);
    expect(json.data.subject).toBe("Produk rusak");
    expect(json.data.description).toBe("Layar tidak menyala sejak diterima.");
    expect(json.data.status).toBe("open");
    expect(json.data.attachments).toEqual([]);

    // verify DB row
    const db = testDb();
    const [row] = await db
      .select()
      .from(schema.complaints)
      .where(eq(schema.complaints.id, json.data.id))
      .limit(1);
    expect(row?.subject).toBe("Produk rusak");
    expect(row?.userId).toBe(FIXTURE_IDS.regularUser);
    expect(row?.status).toBe("open");
  });

  it("creates a complaint with attachments and returns them", async () => {
    await setOrderDelivered();

    const attachments = [
      { file_url: "https://cdn.example.com/foto1.jpg", file_name: "foto1.jpg", file_type: "image/jpeg" },
      { file_url: "https://cdn.example.com/video.mp4", file_name: "video.mp4", file_type: "video/mp4" },
    ];

    const res = await submitComplaint(
      postRequest(FIXTURE_IDS.regularUser, {
        order_item_id: FIXTURE_IDS.orderItem,
        reason: "Layar retak",
        description: "Layar retak saat dikeluarkan dari kotak.",
        attachments,
      }) as any,
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.attachments).toHaveLength(2);
    expect(json.data.attachments[0].file_url).toBe("https://cdn.example.com/foto1.jpg");
    expect(json.data.attachments[0].file_name).toBe("foto1.jpg");
    expect(json.data.attachments[0].file_type).toBe("image/jpeg");

    // verify DB rows
    const db = testDb();
    const rows = await db
      .select()
      .from(schema.complaintAttachments)
      .where(eq(schema.complaintAttachments.complaintId, json.data.id));
    expect(rows).toHaveLength(2);
  });

  it("prevents filing a second complaint on the same order item", async () => {
    await setOrderDelivered();

    const body = {
      order_item_id: FIXTURE_IDS.orderItem,
      reason: "Produk cacat",
      description: "Ada retakan.",
    };

    const first = await submitComplaint(postRequest(FIXTURE_IDS.regularUser, body) as any);
    expect(first.status).toBe(201);

    const second = await submitComplaint(postRequest(FIXTURE_IDS.regularUser, body) as any);
    expect(second.status).toBe(409);
  });
});

// ── GET /api/complaints ──────────────────────────────────────────────────────

describe("GET /api/complaints", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const res = await listComplaints(
      new Request("http://localhost/api/complaints") as any,
    );
    expect(res.status).toBe(401);
  });

  it("returns an empty array when the user has no complaints", async () => {
    const res = await listComplaints(getRequest(FIXTURE_IDS.memberUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("returns only the logged-in user's complaints with status and attachments", async () => {
    await setOrderDelivered();

    // submit two complaints by regularUser (first succeeds, second will be rejected
    // by the duplicate guard — so we need two different items)
    // We only have one order item in fixtures, so just submit one complaint.
    await submitComplaint(
      postRequest(FIXTURE_IDS.regularUser, {
        order_item_id: FIXTURE_IDS.orderItem,
        reason: "Produk rusak",
        description: "Tidak berfungsi.",
        attachments: [{ file_url: "/uploads/a.jpg", file_name: "a.jpg", file_type: "image/jpeg" }],
      }) as any,
    );

    // regularUser sees their own complaint
    const res = await listComplaints(getRequest(FIXTURE_IDS.regularUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    const complaint = json.data[0];
    expect(complaint.status).toBe("open");
    expect(complaint.order_item_id).toBe(FIXTURE_IDS.orderItem);
    expect(complaint.attachments).toHaveLength(1);

    // memberUser sees nothing (no complaints)
    const memberRes = await listComplaints(getRequest(FIXTURE_IDS.memberUser) as any);
    const memberJson = await memberRes.json();
    expect(memberJson.data).toEqual([]);
  });
});
