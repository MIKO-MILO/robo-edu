/**
 * Ticket 12 — GET /api/admin/resellers + GET /api/admin/resellers/[id]
 *
 * Acceptance criteria:
 *   - List returns only MEMBERs, paginated, with expires_at + purchase count.
 *   - Detail returns the member profile and all their membership_purchase rows.
 *   - Non-members are excluded from the list.
 */
import { describe, expect, it } from "vitest";
import {
  GET as listMembers,
} from "@/app/api/admin/resellers/route";
import {
  GET as getMemberDetail,
} from "@/app/api/admin/resellers/[id]/route";
import { createSessionToken } from "@/src/lib/auth/session";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── helpers ─────────────────────────────────────────────────────────────────

function cookie(userId: string) {
  return `roboedu_session=${createSessionToken(userId, false)}`;
}

function makeListRequest(userId: string, params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/admin/resellers");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString(), { headers: { cookie: cookie(userId) } });
}

function makeDetailRequest(userId: string, memberId: string) {
  return new Request(`http://localhost/api/admin/resellers/${memberId}`, {
    headers: { cookie: cookie(userId) },
  });
}

function makeDetailContext(memberId: string) {
  return { params: Promise.resolve({ id: memberId }) };
}

// ── Auth guards ──────────────────────────────────────────────────────────────

describe("auth guards", () => {
  it("list returns 401 for unauthenticated requests", async () => {
    const res = await listMembers(
      new Request("http://localhost/api/admin/resellers") as any,
    );
    expect(res.status).toBe(401);
  });

  it("list returns 403 for a non-admin user", async () => {
    const res = await listMembers(
      makeListRequest(FIXTURE_IDS.memberUser) as any,
    );
    expect(res.status).toBe(403);
  });

  it("detail returns 401 for unauthenticated requests", async () => {
    const res = await getMemberDetail(
      new Request(`http://localhost/api/admin/resellers/${FIXTURE_IDS.memberUser}`) as any,
      makeDetailContext(FIXTURE_IDS.memberUser),
    );
    expect(res.status).toBe(401);
  });

  it("detail returns 403 for a non-admin user", async () => {
    const res = await getMemberDetail(
      makeDetailRequest(FIXTURE_IDS.memberUser, FIXTURE_IDS.memberUser) as any,
      makeDetailContext(FIXTURE_IDS.memberUser),
    );
    expect(res.status).toBe(403);
  });
});

// ── GET /api/admin/resellers ─────────────────────────────────────────────────

describe("GET /api/admin/resellers", () => {
  it("returns only MEMBER users (excludes non-members)", async () => {
    const res = await listMembers(
      makeListRequest(FIXTURE_IDS.adminUser) as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Only the MEMBER fixture user should appear
    const ids = json.data.map((u: any) => u.id);
    expect(ids).toContain(FIXTURE_IDS.memberUser);
    expect(ids).not.toContain(FIXTURE_IDS.regularUser); // NOT_MEMBER
    expect(ids).not.toContain(FIXTURE_IDS.adminUser);   // NOT_MEMBER admin
  });

  it("each row has the required fields including expires_at and purchase_count", async () => {
    const res = await listMembers(
      makeListRequest(FIXTURE_IDS.adminUser) as any,
    );
    const json = await res.json();
    const member = json.data.find((u: any) => u.id === FIXTURE_IDS.memberUser);

    expect(member).toBeDefined();
    expect(typeof member.name).toBe("string");
    expect(typeof member.email).toBe("string");
    expect(member.membership_status).toBe("MEMBER");
    // expires_at from the fixture (far future)
    expect(member.membership_expires_at).toBeTruthy();
    // The fixture seeds one membership_purchase for the member user
    expect(typeof member.purchase_count).toBe("number");
    expect(member.purchase_count).toBe(1);
  });

  it("returns pagination metadata", async () => {
    const res = await listMembers(
      makeListRequest(FIXTURE_IDS.adminUser, { limit: "10", page: "1" }) as any,
    );
    const json = await res.json();
    expect(json.meta).toBeDefined();
    expect(typeof json.meta.total_count).toBe("number");
    expect(typeof json.meta.total_pages).toBe("number");
    expect(json.meta.current_page).toBe(1);
  });

  it("search filters by name/email", async () => {
    // searching for a non-existent name should return empty
    const res = await listMembers(
      makeListRequest(FIXTURE_IDS.adminUser, { search: "XYZZY_NOT_EXIST" }) as any,
    );
    const json = await res.json();
    expect(json.data).toHaveLength(0);
  });
});

// ── GET /api/admin/resellers/[id] ────────────────────────────────────────────

describe("GET /api/admin/resellers/[id]", () => {
  it("returns 404 for an unknown id", async () => {
    const res = await getMemberDetail(
      makeDetailRequest(FIXTURE_IDS.adminUser, "no-such-user") as any,
      makeDetailContext("no-such-user"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when the user exists but is not a MEMBER", async () => {
    const res = await getMemberDetail(
      makeDetailRequest(FIXTURE_IDS.adminUser, FIXTURE_IDS.regularUser) as any,
      makeDetailContext(FIXTURE_IDS.regularUser),
    );
    expect(res.status).toBe(404);
  });

  it("returns the member profile with all membership_purchase rows", async () => {
    const res = await getMemberDetail(
      makeDetailRequest(FIXTURE_IDS.adminUser, FIXTURE_IDS.memberUser) as any,
      makeDetailContext(FIXTURE_IDS.memberUser),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    const data = json.data;
    expect(data.id).toBe(FIXTURE_IDS.memberUser);
    expect(data.membership_status).toBe("MEMBER");
    expect(data.membership_expires_at).toBeTruthy();
    expect(data.email).toBeTruthy();

    // membership_purchases array — fixture seeds one row
    expect(Array.isArray(data.membership_purchases)).toBe(true);
    expect(data.membership_purchases).toHaveLength(1);

    const purchase = data.membership_purchases[0];
    expect(purchase.id).toBeTruthy();
    expect(purchase.purchase_number).toBe("MBR-TEST-1");
    expect(purchase.status).toBe("PAID");
    expect(typeof purchase.price_snapshot).toBe("number");
    expect(typeof purchase.duration_months_snapshot).toBe("number");
  });
});
