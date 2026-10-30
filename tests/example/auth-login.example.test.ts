/**
 * Example behavior test (the pattern later tickets should follow).
 *
 * What this demonstrates:
 *   - Invoke a real Next.js route handler with a real `Request` (no mocking of
 *     the handler or the database).
 *   - Assert on the HTTP response (status + body).
 *   - Assert on the resulting database row (lastLoginAt is now set).
 *   - Assert the deterministic fixtures are present (MEMBER / non-MEMBER users,
 *     variants with and without a member price).
 *
 * The DB is reset + reseeded before every test by the global beforeEach in
 * tests/setup.ts, so each test starts from a known state.
 */
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { POST as login } from "@/app/api/auth/login/route";
import { SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { testDb } from "@/tests/helpers/db";
import * as schema from "@/src/db/schema";
import { FIXTURE_EMAILS, FIXTURE_IDS, FIXTURE_PASSWORD } from "@/tests/helpers/fixtures";

function loginRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login — example behavior test", () => {
  it("logs in the seeded MEMBER user and updates lastLoginAt in the DB", async () => {
    // Fixture user starts with lastLoginAt = null.
    const db = testDb();
    const [before] = await db
      .select({ lastLoginAt: schema.users.lastLoginAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);
    expect(before?.lastLoginAt).toBeNull();

    // Act: call the real route handler with a real Request.
    const res = await login(
      loginRequest({
        email: FIXTURE_EMAILS.member,
        password: FIXTURE_PASSWORD,
        rememberMe: false,
      }),
    );

    // Assert: API response (status + body).
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      success: true,
      data: { email: FIXTURE_EMAILS.member, role: "CUSTOMER" },
    });
    expect(json.data.id).toBe(FIXTURE_IDS.memberUser);

    // Assert: a session cookie is set on the response boundary.
    expect(res.cookies.get(SESSION_COOKIE_NAME)?.value).toBeTruthy();

    // Assert: resulting DB row — lastLoginAt is now populated.
    const [after] = await db
      .select({ lastLoginAt: schema.users.lastLoginAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);
    expect(after?.lastLoginAt).toBeInstanceOf(Date);
  });

  it("rejects an incorrect password with 401 and leaves lastLoginAt null", async () => {
    const res = await login(
      loginRequest({
        email: FIXTURE_EMAILS.member,
        password: "wrong-password",
      }),
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);

    const db = testDb();
    const [row] = await db
      .select({ lastLoginAt: schema.users.lastLoginAt })
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);
    expect(row?.lastLoginAt).toBeNull();
  });

  it("rejects a non-existent email with 401", async () => {
    const res = await login(
      loginRequest({ email: "nobody@roboedu.test", password: "whatever" }),
    );
    expect(res.status).toBe(401);
  });
});

describe("seeded fixtures — acceptance criteria for ticket 02", () => {
  it("includes a MEMBER user and a non-MEMBER user", async () => {
    const db = testDb();
    const [member] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.memberUser))
      .limit(1);
    expect(member?.membershipStatus).toBe("MEMBER");
    expect(member?.membershipExpiresAt).toBeInstanceOf(Date);

    const [regular] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, FIXTURE_IDS.regularUser))
      .limit(1);
    expect(regular?.membershipStatus).toBe("NOT_MEMBER");
    expect(regular?.membershipExpiresAt).toBeNull();
  });

  it("includes a variant WITH a member price and one WITHOUT", async () => {
    const db = testDb();
    const [withPrice] = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithMemberPrice))
      .limit(1);
    expect(withPrice?.resellerPrice).not.toBeNull();

    const [withoutPrice] = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.id, FIXTURE_IDS.variantWithoutMemberPrice))
      .limit(1);
    expect(withoutPrice?.resellerPrice).toBeNull();
  });

  it("includes an order with a linked payment", async () => {
    const db = testDb();
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, FIXTURE_IDS.order))
      .limit(1);
    expect(order).toBeDefined();

    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, FIXTURE_IDS.orderPayment))
      .limit(1);
    expect(payment?.orderId).toBe(FIXTURE_IDS.order);
    expect(payment?.membershipPurchaseId).toBeNull();
  });
});
