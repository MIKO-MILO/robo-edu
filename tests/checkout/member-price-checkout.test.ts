/**
 * Behavior tests for ticket 06: Member price in checkout + auto-shipment + dropship.
 *
 * Tests call the real route handler (POST /api/checkout/midtrans) against the
 * real test database. Midtrans Core API is mocked so no outbound calls are made.
 *
 * Covered criteria:
 *   1. MEMBER's Midtrans amount uses member pricing; non-member uses normal pricing.
 *   2. providerId and dropship fields are accepted, validated, and persisted.
 *   3. Every successful checkout creates exactly one shipments row with status PENDING.
 *   4. Member price is null-safe (variants without a member price use normal price).
 *   5. Tests cover member-vs-normal pricing and shipment creation.
 */
import { describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { POST as checkout } from "@/app/api/checkout/midtrans/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── Midtrans Core API mock ───────────────────────────────────────────────────
// Replace chargeCoreApi so tests never make real outbound requests.
vi.mock("@/src/lib/payments/midtrans", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/lib/payments/midtrans")>();
  return {
    ...original,
    chargeCoreApi: vi.fn().mockResolvedValue({
      instruction: { type: "va", bank_code: "BCA", va_number: "1234567890123" },
      expiryTime: new Date(Date.now() + 3600 * 1000),
      transactionStatus: "pending",
      raw: { transaction_status: "pending" },
    }),
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function asUser(userId: string) {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(userId, false));
}

function checkoutRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/checkout/midtrans", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
}

/** Minimum valid checkout body for a given user address. */
function baseBody(addressId = FIXTURE_IDS.address): Record<string, unknown> {
  return {
    addressId,
    shippingCost: 15000,
    providerId: FIXTURE_IDS.shippingProvider,
    paymentMethod: "bank_transfer",
    paymentChannel: "bca_va",
  };
}

/** Add the fixture variant to a user's cart directly via the test DB. */
async function addToCart(userId: string, variantId: string, quantity = 1) {
  const db = testDb();

  // Find or create a cart for this user
  let [cart] = await db
    .select({ id: schema.carts.id })
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .limit(1);

  if (!cart) {
    // Use a short, deterministic ID that fits varchar(36)
    const cartId = crypto.randomUUID();
    await db.insert(schema.carts).values({ id: cartId, userId });
    cart = { id: cartId };
  }

  // Insert cart item — use a fresh UUID each time so the id fits varchar(36)
  const existingItem = await db
    .select({ id: schema.cartItems.id })
    .from(schema.cartItems)
    .where(
      and(
        eq(schema.cartItems.cartId, cart.id),
        eq(schema.cartItems.variantId, variantId),
      ),
    )
    .limit(1);

  if (existingItem[0]) {
    await db
      .update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, existingItem[0].id));
  } else {
    await db.insert(schema.cartItems).values({
      id: crypto.randomUUID(),
      cartId: cart.id,
      productId: FIXTURE_IDS.product,
      variantId,
      quantity,
    });
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/checkout/midtrans — member pricing", () => {
  it("rejects unauthenticated request with 401", async () => {
    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(401);
  });

  it("rejects missing providerId with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    const res = await checkout(checkoutRequest({ ...baseBody(), providerId: "" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("Jasa pengiriman");
  });

  it("rejects an unknown providerId with 400", async () => {
    asUser(FIXTURE_IDS.regularUser);
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    const res = await checkout(checkoutRequest({ ...baseBody(), providerId: "no-such-provider" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("pengiriman");
  });

  it("non-MEMBER pays regular price (variantWithMemberPrice: 100000)", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);

    // subtotal = 100000 (regular); tax = floor(100000 * 0.08) = 8000; shipping = 15000 → total = 123000
    const expectedTotal = Math.floor(100000 * 1.08) + 15000;
    expect(json.data.total).toBe(expectedTotal);

    // Snapshot price on the order item must be the REGULAR price.
    const [item] = await testDb()
      .select({ priceSnapshot: schema.orderItems.priceSnapshot })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, json.data.orderId))
      .limit(1);
    expect(Number(item!.priceSnapshot)).toBe(100000);
  });

  it("active MEMBER pays member price (variantWithMemberPrice: 85000)", async () => {
    await addToCart(FIXTURE_IDS.memberUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.memberUser);

    const res = await checkout(checkoutRequest({ ...baseBody(), addressId: FIXTURE_IDS.memberAddress }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.success).toBe(true);

    // subtotal = 85000 (member); tax = floor(85000 * 0.08) = 6800; shipping = 15000 → total = 106800
    const expectedTotal = Math.floor(85000 * 1.08) + 15000;
    expect(json.data.total).toBe(expectedTotal);

    const [item] = await testDb()
      .select({ priceSnapshot: schema.orderItems.priceSnapshot })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, json.data.orderId))
      .limit(1);
    // Snapshot must record the MEMBER price.
    expect(Number(item!.priceSnapshot)).toBe(85000);
  });

  it("MEMBER buys variant with null member price — falls back to regular price (variantWithoutMemberPrice: 200000)", async () => {
    await addToCart(FIXTURE_IDS.memberUser, FIXTURE_IDS.variantWithoutMemberPrice, 1);
    asUser(FIXTURE_IDS.memberUser);

    const res = await checkout(checkoutRequest({ ...baseBody(), addressId: FIXTURE_IDS.memberAddress }));
    expect(res.status).toBe(201);
    const json = await res.json();

    const [item] = await testDb()
      .select({ priceSnapshot: schema.orderItems.priceSnapshot })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, json.data.orderId))
      .limit(1);
    // Must use regular price (200000) because resellerPrice is null.
    expect(Number(item!.priceSnapshot)).toBe(200000);
  });

  it("MEMBER buys mixed cart: member price applied per-variant correctly", async () => {
    // Add one variant WITH member price and one WITHOUT
    await addToCart(FIXTURE_IDS.memberUser, FIXTURE_IDS.variantWithMemberPrice, 1);    // 85000 member
    await addToCart(FIXTURE_IDS.memberUser, FIXTURE_IDS.variantWithoutMemberPrice, 1); // 200000 (no member price)
    asUser(FIXTURE_IDS.memberUser);

    const res = await checkout(checkoutRequest({ ...baseBody(), addressId: FIXTURE_IDS.memberAddress }));
    expect(res.status).toBe(201);
    const json = await res.json();

    const items = await testDb()
      .select({ variantId: schema.orderItems.variantId, priceSnapshot: schema.orderItems.priceSnapshot })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, json.data.orderId));

    const withPrice = items.find((i) => i.variantId === FIXTURE_IDS.variantWithMemberPrice);
    const withoutPrice = items.find((i) => i.variantId === FIXTURE_IDS.variantWithoutMemberPrice);

    expect(Number(withPrice!.priceSnapshot)).toBe(85000);   // member price applied
    expect(Number(withoutPrice!.priceSnapshot)).toBe(200000); // regular price (null fallback)
  });
});

describe("POST /api/checkout/midtrans — auto shipment creation", () => {
  it("creates exactly one PENDING shipments row after a successful checkout", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const shipmentRows = await testDb()
      .select()
      .from(schema.shipments)
      .where(eq(schema.shipments.orderId, data.orderId));

    expect(shipmentRows.length).toBe(1);
    expect(shipmentRows[0]!.status).toBe("pending");
    expect(shipmentRows[0]!.shippingProviderId).toBe(FIXTURE_IDS.shippingProvider);
  });
});

describe("POST /api/checkout/midtrans — dropship", () => {
  it("rejects dropship order with missing senderName with 400", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest({ ...baseBody(), isDropship: true, senderPhone: "08123456789" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("Nama pengirim");
  });

  it("rejects dropship order with missing senderPhone with 400", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest({ ...baseBody(), isDropship: true, senderName: "Toko ABC" }));
    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain("Telepon pengirim");
  });

  it("persists dropship fields on the order row", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest({
      ...baseBody(),
      isDropship: true,
      senderName: "Toko Robotik ABC",
      senderPhone: "081234567890",
    }));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const [order] = await testDb()
      .select({ isDropship: schema.orders.isDropship, senderName: schema.orders.senderName, senderPhone: schema.orders.senderPhone })
      .from(schema.orders)
      .where(eq(schema.orders.id, data.orderId))
      .limit(1);

    expect(order!.isDropship).toBe(true);
    expect(order!.senderName).toBe("Toko Robotik ABC");
    expect(order!.senderPhone).toBe("081234567890");
  });

  it("non-dropship order has isDropship=false and null sender fields", async () => {
    await addToCart(FIXTURE_IDS.regularUser, FIXTURE_IDS.variantWithMemberPrice, 1);
    asUser(FIXTURE_IDS.regularUser);

    const res = await checkout(checkoutRequest(baseBody()));
    expect(res.status).toBe(201);
    const { data } = await res.json();

    const [order] = await testDb()
      .select({ isDropship: schema.orders.isDropship, senderName: schema.orders.senderName, senderPhone: schema.orders.senderPhone })
      .from(schema.orders)
      .where(eq(schema.orders.id, data.orderId))
      .limit(1);

    expect(order!.isDropship).toBe(false);
    expect(order!.senderName).toBeNull();
    expect(order!.senderPhone).toBeNull();
  });
});
