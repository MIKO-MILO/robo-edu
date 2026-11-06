/**
 * Ticket 05 — GET /api/product/[slug]: member_price per variant
 *
 * Each variant in the detail response should carry member_price.
 * For MEMBERs: the actual reseller_price (or null if no discount for that variant).
 * For guests / non-members: always null.
 */
import { describe, expect, it } from "vitest";
import { GET as getProduct } from "@/app/api/product/[slug]/route";
import { createSessionToken } from "@/src/lib/auth/session";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

const TEST_SLUG = "test-line-follower-robot-kit";

function makeContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

function makeRequest(cookie?: string) {
  return new Request(`http://localhost/api/product/${TEST_SLUG}`, {
    headers: cookie ? { cookie } : {},
  });
}

function sessionCookie(userId: string) {
  const token = createSessionToken(userId, false);
  return `roboedu_session=${token}`;
}

describe("GET /api/product/[slug] — member_price per variant", () => {
  it("guest sees null member_price on all variants", async () => {
    const res = await getProduct(makeRequest() as any, makeContext(TEST_SLUG));
    expect(res.status).toBe(200);
    const json = await res.json();
    const variants: any[] = json.data.variants;
    expect(variants.length).toBeGreaterThan(0);
    for (const v of variants) {
      expect(v.member_price ?? null).toBeNull();
    }
  });

  it("non-MEMBER sees null member_price on all variants", async () => {
    const res = await getProduct(
      makeRequest(sessionCookie(FIXTURE_IDS.regularUser)) as any,
      makeContext(TEST_SLUG),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const variants: any[] = json.data.variants;
    for (const v of variants) {
      expect(v.member_price ?? null).toBeNull();
    }
  });

  it("active MEMBER sees correct member_price per variant", async () => {
    const res = await getProduct(
      makeRequest(sessionCookie(FIXTURE_IDS.memberUser)) as any,
      makeContext(TEST_SLUG),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const variants: any[] = json.data.variants;
    expect(variants.length).toBe(2);

    const withPrice = variants.find(
      (v: any) => v.id === FIXTURE_IDS.variantWithMemberPrice,
    );
    const withoutPrice = variants.find(
      (v: any) => v.id === FIXTURE_IDS.variantWithoutMemberPrice,
    );

    // Fixture: variantWithMemberPrice has reseller_price = 85000
    expect(withPrice).toBeDefined();
    expect(withPrice.member_price).toBe(85000);

    // Fixture: variantWithoutMemberPrice has reseller_price = null → no discount
    expect(withoutPrice).toBeDefined();
    expect(withoutPrice.member_price).toBeNull();
  });

  it("returns 404 for unknown slug", async () => {
    const res = await getProduct(
      makeRequest() as any,
      makeContext("no-such-product"),
    );
    expect(res.status).toBe(404);
  });
});
