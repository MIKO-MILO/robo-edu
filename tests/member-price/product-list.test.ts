/**
 * Ticket 05 — GET /api/product: member_price in product list
 *
 * The list endpoint returns a `price` object per product.
 * For MEMBERs it should also include member_price ranges.
 * For guests / non-members member_price should be null / absent.
 */
import { describe, expect, it } from "vitest";
import { GET as getProducts } from "@/app/api/product/route";
import { createSessionToken } from "@/src/lib/auth/session";
import { FIXTURE_IDS, FIXTURE_EMAILS } from "@/tests/helpers/fixtures";

function makeRequest(cookie?: string) {
  const url = "http://localhost/api/product?limit=100";
  return new Request(url, {
    headers: cookie ? { cookie } : {},
  });
}

function sessionCookie(userId: string) {
  const token = createSessionToken(userId, false);
  return `roboedu_session=${token}`;
}

describe("GET /api/product — member_price visibility", () => {
  it("guest sees null member_price in the product list", async () => {
    const res = await getProducts(makeRequest() as any);
    expect(res.status).toBe(200);
    const json = await res.json();

    const product = json.data.find((p: any) => p.id === FIXTURE_IDS.product);
    expect(product).toBeDefined();
    // guest: member_price should be null or omitted
    expect(product.price.member_min ?? null).toBeNull();
    expect(product.price.member_max ?? null).toBeNull();
  });

  it("non-MEMBER sees null member_price in the product list", async () => {
    const res = await getProducts(
      makeRequest(sessionCookie(FIXTURE_IDS.regularUser)) as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();

    const product = json.data.find((p: any) => p.id === FIXTURE_IDS.product);
    expect(product).toBeDefined();
    expect(product.price.member_min ?? null).toBeNull();
    expect(product.price.member_max ?? null).toBeNull();
  });

  it("active MEMBER sees non-null member_price in the product list", async () => {
    const res = await getProducts(
      makeRequest(sessionCookie(FIXTURE_IDS.memberUser)) as any,
    );
    expect(res.status).toBe(200);
    const json = await res.json();

    const product = json.data.find((p: any) => p.id === FIXTURE_IDS.product);
    expect(product).toBeDefined();
    // The fixture has one variant WITH member price (85000) and one WITHOUT (null).
    // min member_price across active variants should be 85000 (the only one set).
    expect(product.price.member_min).toBe(85000);
    // max should also be 85000 (only variant that has one)
    expect(product.price.member_max).toBe(85000);
  });
});
