/**
 * Ticket 15 — Admin complaint management
 *
 * GET /api/admin/complaints   — paginated list, filterable by status + date
 * GET /api/admin/complaints/[id] — detail + attachments
 * PATCH /api/admin/complaints/[id] — update status + resolution_note
 *
 * Acceptance criteria:
 *   - List is paginated and filterable by status and date.
 *   - Detail returns the complaint and its attachments.
 *   - PATCH updates status and resolution_note; status transitions validated.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import {
  GET as listComplaints,
} from "@/app/api/admin/complaints/route";
import {
  GET as getComplaintDetail,
  PATCH as patchComplaint,
} from "@/app/api/admin/complaints/[id]/route";
import { POST as submitComplaint } from "@/app/api/complaints/route";
import { createSessionToken } from "@/src/lib/auth/session";
import * as schema from "@/src/db/schema";
import { testDb } from "@/tests/helpers/db";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";
import crypto from "node:crypto";

// ── helpers ──────────────────────────────────────────────────────────────────

function cookie(userId: string) {
  return `roboedu_session=${createSessionToken(userId, false)}`;
}

function adminRequest(method: string, path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      cookie: cookie(FIXTURE_IDS.adminUser),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function customerRequest(method: string, path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      cookie: cookie(FIXTURE_IDS.regularUser),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function detailContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

/** Seed a DELIVERED order + a complaint, returns the complaint id. */
async function seedComplaint(opts: {
  subject?: string;
  attachments?: Array<{ file_url: string; file_name: string; file_type: string }>;
} = {}): Promise<string> {
  const db = testDb();
  // upgrade order to DELIVERED
  await db
    .update(schema.orders)
    .set({ status: "DELIVERED" })
    .where(eq(schema.orders.id, FIXTURE_IDS.order));

  const res = await submitComplaint(
    new Request("http://localhost/api/complaints", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: cookie(FIXTURE_IDS.regularUser),
      },
      body: JSON.stringify({
        order_item_id: FIXTURE_IDS.orderItem,
        reason: opts.subject ?? "Produk rusak",
        description: "Layar tidak menyala.",
        attachments: opts.attachments,
      }),
    }) as any,
  );
  const json = await res.json();
  if (res.status !== 201) throw new Error(`seedComplaint failed: ${JSON.stringify(json)}`);
  return json.data.id as string;
}

// ── Auth guards ───────────────────────────────────────────────────────────────

describe("auth guards", () => {
  it("list returns 401 for unauthenticated", async () => {
    const res = await listComplaints(
      new Request("http://localhost/api/admin/complaints") as any,
    );
    expect(res.status).toBe(401);
  });

  it("list returns 403 for non-admin", async () => {
    const res = await listComplaints(
      customerRequest("GET", "/api/admin/complaints") as any,
    );
    expect(res.status).toBe(403);
  });

  it("detail returns 401 for unauthenticated", async () => {
    const complaintId = await seedComplaint();
    const res = await getComplaintDetail(
      new Request(`http://localhost/api/admin/complaints/${complaintId}`) as any,
      detailContext(complaintId),
    );
    expect(res.status).toBe(401);
  });

  it("PATCH returns 403 for non-admin", async () => {
    const complaintId = await seedComplaint();
    const res = await patchComplaint(
      customerRequest("PATCH", `/api/admin/complaints/${complaintId}`, { status: "in_review" }) as any,
      detailContext(complaintId),
    );
    expect(res.status).toBe(403);
  });
});

// ── GET /api/admin/complaints ─────────────────────────────────────────────────

describe("GET /api/admin/complaints", () => {
  it("returns an empty list when no complaints exist", async () => {
    const res = await listComplaints(
      adminRequest("GET", "/api/admin/complaints") as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
    expect(json.meta.total_count).toBe(0);
  });

  it("returns all complaints with required fields", async () => {
    const id = await seedComplaint({ subject: "Rusak parah" });

    const res = await listComplaints(
      adminRequest("GET", "/api/admin/complaints") as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.meta.total_count).toBe(1);
    const row = json.data[0];
    expect(row.id).toBe(id);
    expect(row.subject).toBe("Rusak parah");
    expect(row.status).toBe("open");
    expect(row.customer).toBeDefined();
    expect(row.customer.id).toBe(FIXTURE_IDS.regularUser);
  });

  it("filters by status", async () => {
    const id = await seedComplaint();
    // patch to in_review
    await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "in_review" }) as any,
      detailContext(id),
    );

    const openRes = await listComplaints(
      adminRequest("GET", "/api/admin/complaints?status=open") as any,
    );
    const openJson = await openRes.json();
    expect(openJson.data).toHaveLength(0); // none left as open

    const reviewRes = await listComplaints(
      adminRequest("GET", "/api/admin/complaints?status=in_review") as any,
    );
    const reviewJson = await reviewRes.json();
    expect(reviewJson.data).toHaveLength(1);
    expect(reviewJson.data[0].id).toBe(id);
  });

  it("returns pagination metadata", async () => {
    await seedComplaint();
    const res = await listComplaints(
      adminRequest("GET", "/api/admin/complaints?page=1&limit=5") as any,
    );
    const json = await res.json();
    expect(json.meta.current_page).toBe(1);
    expect(json.meta.per_page).toBe(5);
    expect(typeof json.meta.total_pages).toBe("number");
  });
});

// ── GET /api/admin/complaints/[id] ───────────────────────────────────────────

describe("GET /api/admin/complaints/[id]", () => {
  it("returns 404 for unknown id", async () => {
    const res = await getComplaintDetail(
      adminRequest("GET", "/api/admin/complaints/no-such-id") as any,
      detailContext("no-such-id"),
    );
    expect(res.status).toBe(404);
  });

  it("returns the complaint with attachments and customer info", async () => {
    const attachments = [
      { file_url: "https://cdn.example.com/foto.jpg", file_name: "foto.jpg", file_type: "image/jpeg" },
    ];
    const id = await seedComplaint({ attachments });

    const res = await getComplaintDetail(
      adminRequest("GET", `/api/admin/complaints/${id}`) as any,
      detailContext(id),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(id);
    expect(json.data.status).toBe("open");
    expect(json.data.attachments).toHaveLength(1);
    expect(json.data.attachments[0].file_url).toBe("https://cdn.example.com/foto.jpg");
    expect(json.data.customer.id).toBe(FIXTURE_IDS.regularUser);
    expect(json.data.order_item).toBeDefined();
  });
});

// ── PATCH /api/admin/complaints/[id] ─────────────────────────────────────────

describe("PATCH /api/admin/complaints/[id]", () => {
  it("returns 404 for unknown id", async () => {
    const res = await patchComplaint(
      adminRequest("PATCH", "/api/admin/complaints/no-such-id", { status: "in_review" }) as any,
      detailContext("no-such-id"),
    );
    expect(res.status).toBe(404);
  });

  it("updates status from open to in_review", async () => {
    const id = await seedComplaint();

    const res = await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "in_review" }) as any,
      detailContext(id),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe("in_review");

    // verify DB
    const [row] = await testDb()
      .select({ status: schema.complaints.status })
      .from(schema.complaints)
      .where(eq(schema.complaints.id, id))
      .limit(1);
    expect(row?.status).toBe("in_review");
  });

  it("updates status to resolved and sets resolution + resolved_at", async () => {
    const id = await seedComplaint();
    // move to in_review first
    await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "in_review" }) as any,
      detailContext(id),
    );

    const res = await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, {
        status: "resolved",
        resolution_note: "Produk telah diganti.",
      }) as any,
      detailContext(id),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe("resolved");
    expect(json.data.resolution).toBe("Produk telah diganti.");
    expect(json.data.resolved_at).toBeTruthy();
  });

  it("rejects an invalid status value", async () => {
    const id = await seedComplaint();
    const res = await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "flying" }) as any,
      detailContext(id),
    );
    expect(res.status).toBe(422);
  });

  it("rejects a backward transition (resolved → open)", async () => {
    const id = await seedComplaint();
    await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "in_review" }) as any,
      detailContext(id),
    );
    await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "resolved" }) as any,
      detailContext(id),
    );

    const res = await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "open" }) as any,
      detailContext(id),
    );
    expect(res.status).toBe(409);
  });

  it("allows closing from any non-terminal state", async () => {
    const id = await seedComplaint();
    const res = await patchComplaint(
      adminRequest("PATCH", `/api/admin/complaints/${id}`, { status: "closed" }) as any,
      detailContext(id),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.status).toBe("closed");
  });
});
