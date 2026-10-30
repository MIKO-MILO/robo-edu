/**
 * Ticket 05 — GET /api/cart: member price subtotals + is_member_price
 *
 * For an active MEMBER:
 *   - items whose variant has a reseller_price use it for subtotal
 *   - is_member_price = true
 *   - the cart-level subtotal reflects member pricing
 *
 * For a non-MEMBER or a variant with null reseller_price:
 *   - regular price is used
 *   - is_member_price = false
 */
import { describe, expect, it } from "vitest";
import { GET as getCart, POST as addToCart } from "@/app/api/cart/route";
import { createSessionToken } from "@/src/lib/auth/session";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

function sessionCookie(userId: string) {
  const token = createSessionToken(userId, false);
  return `roboedu_session=${token}`;
}

function makeGetRequest(userId: string) {
  return new Request("http://localhost/api/cart", {
    headers: { cookie: sessionCookie(userId) },
  });
}

function makeAddRequest(userId: string, productId: string, variantId: string, quantity = 1) {
  return new Request("http://localhost/api/cart", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: sessionCookie(userId),
    },
    body: JSON.stringify({ productId, variantId, quantity }),
  });
}

describe("GET /api/cart — member price subtotals", () => {
  it("non-MEMBER: subtotal uses regular price, is_member_price false", async () => {
    // Add variantWithMemberPrice (price 100000, member 85000) to non-member cart
    const addRes = await addToCart(
      makeAddRequest(
        FIXTURE_IDS.regularUser,
        FIXTURE_IDS.product,
        FIXTURE_IDS.variantWithMemberPrice,
        2,
      ) as any,
    );
    expect(addRes.status).toBe(201);

    const res = await getCart(makeGetRequest(FIXTURE_IDS.regularUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    const item = json.data.items.find(
      (i: any) => i.variantId === FIXTURE_IDS.variantWithMemberPrice,
    );
    expect(item).toBeDefined();
    expect(item.price).toBe(100000);           // regular price
    expect(item.subtotal).toBe(200000);         // 100000 × 2
    expect(item.is_member_price).toBe(false);
    expect(json.data.subtotal).toBe(200000);
  });

  it("MEMBER: subtotal uses member price when variant has one, is_member_price true", async () => {
    // Add variantWithMemberPrice (price 100000, member 85000) to member cart
    const addRes = await addToCart(
      makeAddRequest(
        FIXTURE_IDS.memberUser,
        FIXTURE_IDS.product,
        FIXTURE_IDS.variantWithMemberPrice,
        2,
      ) as any,
    );
    expect(addRes.status).toBe(201);

    const res = await getCart(makeGetRequest(FIXTURE_IDS.memberUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    const item = json.data.items.find(
      (i: any) => i.variantId === FIXTURE_IDS.variantWithMemberPrice,
    );
    expect(item).toBeDefined();
    expect(item.price).toBe(85000);            // member price
    expect(item.subtotal).toBe(170000);         // 85000 × 2
    expect(item.is_member_price).toBe(true);
    expect(json.data.subtotal).toBe(170000);
  });

  it("MEMBER: variant with null member price falls back to regular price, is_member_price false", async () => {
    // Add variantWithoutMemberPrice (price 200000, member null) to member cart
    const addRes = await addToCart(
      makeAddRequest(
        FIXTURE_IDS.memberUser,
        FIXTURE_IDS.product,
        FIXTURE_IDS.variantWithoutMemberPrice,
        1,
      ) as any,
    );
    expect(addRes.status).toBe(201);

    const res = await getCart(makeGetRequest(FIXTURE_IDS.memberUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    const item = json.data.items.find(
      (i: any) => i.variantId === FIXTURE_IDS.variantWithoutMemberPrice,
    );
    expect(item).toBeDefined();
    expect(item.price).toBe(200000);            // regular price (no member discount)
    expect(item.subtotal).toBe(200000);
    expect(item.is_member_price).toBe(false);
  });

  it("MEMBER cart with mixed variants: per-item is_member_price and aggregate subtotal correct", async () => {
    // Add both variants
    await addToCart(
      makeAddRequest(
        FIXTURE_IDS.memberUser,
        FIXTURE_IDS.product,
        FIXTURE_IDS.variantWithMemberPrice,
        1, // 85000
      ) as any,
    );
    await addToCart(
      makeAddRequest(
        FIXTURE_IDS.memberUser,
        FIXTURE_IDS.product,
        FIXTURE_IDS.variantWithoutMemberPrice,
        1, // 200000 (no member discount)
      ) as any,
    );

    const res = await getCart(makeGetRequest(FIXTURE_IDS.memberUser) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    const items: any[] = json.data.items;

    const withPrice = items.find((i) => i.variantId === FIXTURE_IDS.variantWithMemberPrice);
    const withoutPrice = items.find((i) => i.variantId === FIXTURE_IDS.variantWithoutMemberPrice);

    expect(withPrice.price).toBe(85000);
    expect(withPrice.is_member_price).toBe(true);
    expect(withoutPrice.price).toBe(200000);
    expect(withoutPrice.is_member_price).toBe(false);

    // aggregate subtotal: 85000 + 200000 = 285000
    expect(json.data.subtotal).toBe(285000);
  });

  it("returns 401 for unauthenticated request", async () => {
    const res = await getCart(new Request("http://localhost/api/cart") as any);
    expect(res.status).toBe(401);
  });
});
