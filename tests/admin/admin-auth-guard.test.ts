/**
 * Ticket 13 — Consolidate admin auth: guard tests.
 *
 * Every admin route that used inline auth (inline `isAdminRole`, a hand-rolled
 * `assertAdminOr403`, or a bare `getSessionUserId` login-only check) was
 * migrated to the shared `requireAdmin()` helper (src/lib/auth/require-admin).
 * That helper resolves the caller's role from the DB user record — never from
 * the session payload — which fixes the latent `session.role` bug.
 *
 * This file proves the consolidation for *each* migrated handler with three
 * cases:
 *   - unauthenticated  → 401  (no session cookie)
 *   - CUSTOMER session → 403  (logged in, but role is not an admin role)
 *   - admin session    → the auth barrier is passed (the handler runs and
 *                        returns its normal, non-401/403 status)
 *
 * Auth goes through the real signed-session path: we seed an admin/CUSTOMER
 * `users` row (via the deterministic fixtures) and mint a real HMAC-signed
 * session token into the `next/headers` stub's cookie store, so `requireAdmin()`
 * runs its full DB-backed role + isActive check end-to-end.
 *
 * The DB is reset + reseeded before every test by tests/setup.ts, so each case
 * starts from the known fixtures (FIXTURE_IDS).
 */
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { createSessionToken, SESSION_COOKIE_NAME } from "@/src/lib/auth/session";
import { setSessionCookie } from "@/tests/stubs/next-headers";
import { FIXTURE_IDS } from "@/tests/helpers/fixtures";

// ── migrated route handlers ────────────────────────────────────────────────
import { GET as getReviews } from "@/app/api/admin/reviews/route";
import { DELETE as deleteReview } from "@/app/api/admin/reviews/[id]/route";
import {
  GET as getCategories,
  POST as postCategory,
} from "@/app/api/admin/categories/route";
import {
  GET as getCategory,
  PATCH as patchCategory,
  DELETE as deleteCategory,
} from "@/app/api/admin/categories/[id]/route";
import { GET as getProducts, POST as postProduct } from "@/app/api/admin/products/route";
import {
  GET as getProduct,
  PATCH as patchProduct,
  DELETE as deleteProduct,
} from "@/app/api/admin/products/[id]/route";
import { POST as postProductImage } from "@/app/api/admin/products/[id]/images/route";
import {
  GET as getProductVideos,
  POST as postProductVideo,
} from "@/app/api/admin/products/[id]/videos/route";
import { POST as postProductVariant } from "@/app/api/admin/products/[id]/variants/route";
import {
  GET as getProductTypes,
  POST as postProductType,
} from "@/app/api/admin/product-types/route";
import {
  GET as getProductType,
  PATCH as patchProductType,
  DELETE as deleteProductType,
} from "@/app/api/admin/product-types/[id]/route";
import {
  PATCH as patchProductVariant,
  DELETE as deleteProductVariant,
} from "@/app/api/admin/product-variants/[id]/route";
import {
  PATCH as patchProductVideo,
  DELETE as deleteProductVideo,
} from "@/app/api/admin/product-videos/[id]/route";
import { DELETE as deleteProductImage } from "@/app/api/admin/product-images/[id]/route";
import { PATCH as patchProductImageReorder } from "@/app/api/admin/product-images/[id]/reorder/route";
import { GET as getVouchers, POST as postVoucher } from "@/app/api/admin/vouchers/route";
import {
  GET as getVoucher,
  PATCH as patchVoucher,
  DELETE as deleteVoucher,
} from "@/app/api/admin/vouchers/[id]/route";
import { GET as getVoucherUsages } from "@/app/api/admin/vouchers/[id]/usages/route";
import { GET as getUsers } from "@/app/api/admin/users/route";
import { GET as getUser } from "@/app/api/admin/users/[id]/route";
import { GET as getUserOrders } from "@/app/api/admin/users/[id]/orders/route";
import { PATCH as patchUserResellerStatus } from "@/app/api/admin/users/[id]/reseller-status/route";

// ── auth helpers (real signed-session path via the next/headers stub) ───────

/** Seed an admin session cookie (fixtures seed a role:"admin", isActive user). */
function asAdmin() {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(FIXTURE_IDS.adminUser, false));
}

/** Seed a CUSTOMER session cookie (fixtures seed a role:"CUSTOMER" user). */
function asCustomer() {
  setSessionCookie(SESSION_COOKIE_NAME, createSessionToken(FIXTURE_IDS.regularUser, false));
}

// ── request builders ───────────────────────────────────────────────────────

/** Route params context expected by Next.js dynamic route handlers. */
function P(id: string) {
  return { params: Promise.resolve({ id }) };
}

function req(path: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${path}`, init);
}

function jsonReq(method: string, path: string, body: unknown) {
  return req(path, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ISO timestamps for voucher create (start < end).
const NOW = "2026-01-01T00:00:00Z";
const LATER = "2026-12-31T23:59:59Z";

/**
 * Run the three auth-guard cases for one handler invocation.
 *
 * @param name        describe label
 * @param invoke      builds a fresh request and calls the handler (auth comes
 *                    from the cookie stub, so the same factory is reused)
 * @param adminStatus optional exact status an admin gets after passing the
 *                    guard (asserted in addition to "not 401 / not 403")
 */
function guard(name: string, invoke: () => Promise<Response>, adminStatus?: number) {
  describe(name, () => {
    it("rejects an unauthenticated request with 401", async () => {
      const res = await invoke();
      expect(res.status).toBe(401);
    });

    it("rejects a non-admin (CUSTOMER) session with 403", async () => {
      asCustomer();
      const res = await invoke();
      expect(res.status).toBe(403);
    });

    it("lets an admin through the guard", async () => {
      asAdmin();
      const res = await invoke();
      // The auth barrier is passed for an admin: never a 401/403 rejection.
      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      if (adminStatus !== undefined) {
        expect(res.status).toBe(adminStatus);
      }
    });
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────────────────────────────────
describe("admin auth guard (ticket 13)", () => {
  guard("GET /api/admin/reviews", () => getReviews(req("/api/admin/reviews")), 200);
  guard(
    "DELETE /api/admin/reviews/[id]",
    () => deleteReview(req("/api/admin/reviews/no-such-review"), P("no-such-review")),
    404,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Categories
  // ──────────────────────────────────────────────────────────────────────────
  guard("GET /api/admin/categories", () => getCategories(req("/api/admin/categories")), 200);
  guard(
    "POST /api/admin/categories",
    () => postCategory(jsonReq("POST", "/api/admin/categories", { name: "Guard Cat", slug: "guard-cat-slug" })),
    201,
  );
  guard(
    "GET /api/admin/categories/[id]",
    () => getCategory(req(`/api/admin/categories/${FIXTURE_IDS.category}`), P(FIXTURE_IDS.category)),
    200,
  );
  guard(
    "PATCH /api/admin/categories/[id]",
    () => patchCategory(jsonReq("PATCH", `/api/admin/categories/${FIXTURE_IDS.category}`, { name: "Updated" }), P(FIXTURE_IDS.category)),
    200,
  );
  guard(
    "DELETE /api/admin/categories/[id]",
    () => deleteCategory(req("/api/admin/categories/no-such-category"), P("no-such-category")),
    404,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Products
  // ──────────────────────────────────────────────────────────────────────────
  guard("GET /api/admin/products", () => getProducts(req("/api/admin/products")), 200);
  guard(
    "POST /api/admin/products",
    () =>
      postProduct(
        jsonReq("POST", "/api/admin/products", {
          category_id: FIXTURE_IDS.category,
          product_type_id: FIXTURE_IDS.productType,
          name: "Guard Product",
          slug: "guard-product-slug",
          sku: "GUARD-PROD-SKU",
        }),
      ),
    201,
  );
  guard(
    "GET /api/admin/products/[id]",
    () => getProduct(req(`/api/admin/products/${FIXTURE_IDS.product}`), P(FIXTURE_IDS.product)),
    200,
  );
  guard(
    "PATCH /api/admin/products/[id]",
    () => patchProduct(jsonReq("PATCH", `/api/admin/products/${FIXTURE_IDS.product}`, { name: "Updated" }), P(FIXTURE_IDS.product)),
    200,
  );
  guard(
    "DELETE /api/admin/products/[id]",
    () => deleteProduct(req("/api/admin/products/no-such-product"), P("no-such-product")),
    404,
  );
  guard(
    "POST /api/admin/products/[id]/images",
    () => postProductImage(req(`/api/admin/products/${FIXTURE_IDS.product}/images`, { method: "POST" }), P(FIXTURE_IDS.product)),
  );
  guard(
    "GET /api/admin/products/[id]/videos",
    () => getProductVideos(req(`/api/admin/products/${FIXTURE_IDS.product}/videos`), P(FIXTURE_IDS.product)),
    200,
  );
  guard(
    "POST /api/admin/products/[id]/videos",
    () => postProductVideo(req(`/api/admin/products/${FIXTURE_IDS.product}/videos`, { method: "POST" }), P(FIXTURE_IDS.product)),
  );
  guard(
    "POST /api/admin/products/[id]/variants",
    () =>
      postProductVariant(
        jsonReq("POST", `/api/admin/products/${FIXTURE_IDS.product}/variants`, {
          variant_name: "Guard Variant",
          sku: "GUARD-VARIANT-SKU",
          price: 10000,
        }),
        P(FIXTURE_IDS.product),
      ),
    201,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Product types
  // ──────────────────────────────────────────────────────────────────────────
  guard("GET /api/admin/product-types", () => getProductTypes(req("/api/admin/product-types")), 200);
  guard(
    "POST /api/admin/product-types",
    () => postProductType(jsonReq("POST", "/api/admin/product-types", { name: "Guard PT", slug: "guard-pt-slug" })),
    201,
  );
  guard(
    "GET /api/admin/product-types/[id]",
    () => getProductType(req(`/api/admin/product-types/${FIXTURE_IDS.productType}`), P(FIXTURE_IDS.productType)),
    200,
  );
  guard(
    "PATCH /api/admin/product-types/[id]",
    () => patchProductType(jsonReq("PATCH", `/api/admin/product-types/${FIXTURE_IDS.productType}`, { description: "updated" }), P(FIXTURE_IDS.productType)),
    200,
  );
  guard(
    "DELETE /api/admin/product-types/[id]",
    () => deleteProductType(req("/api/admin/product-types/no-such-type"), P("no-such-type")),
    404,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Product variants / videos / images (sub-resource mutations)
  // ──────────────────────────────────────────────────────────────────────────
  guard(
    "PATCH /api/admin/product-variants/[id]",
    () => patchProductVariant(jsonReq("PATCH", `/api/admin/product-variants/${FIXTURE_IDS.variantWithoutMemberPrice}`, { stock: 99 }), P(FIXTURE_IDS.variantWithoutMemberPrice)),
    200,
  );
  guard(
    "DELETE /api/admin/product-variants/[id]",
    () => deleteProductVariant(req("/api/admin/product-variants/no-such-variant"), P("no-such-variant")),
    404,
  );
  guard(
    "PATCH /api/admin/product-videos/[id]",
    () => patchProductVideo(jsonReq("PATCH", "/api/admin/product-videos/no-such-video", { title: "x" }), P("no-such-video")),
    404,
  );
  guard(
    "DELETE /api/admin/product-videos/[id]",
    () => deleteProductVideo(req("/api/admin/product-videos/no-such-video"), P("no-such-video")),
    404,
  );
  guard(
    "DELETE /api/admin/product-images/[id]",
    () => deleteProductImage(req("/api/admin/product-images/no-such-image"), P("no-such-image")),
    404,
  );
  guard(
    "PATCH /api/admin/product-images/[id]/reorder",
    () => patchProductImageReorder(jsonReq("PATCH", "/api/admin/product-images/no-such-image/reorder", { sort_order: 1 }), P("no-such-image")),
    404,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Vouchers
  // ──────────────────────────────────────────────────────────────────────────
  guard("GET /api/admin/vouchers", () => getVouchers(req("/api/admin/vouchers")), 200);
  guard(
    "POST /api/admin/vouchers",
    () =>
      postVoucher(
        jsonReq("POST", "/api/admin/vouchers", {
          code: "GUARD-VC",
          name: "Guard Voucher",
          discount_type: "PERCENTAGE",
          discount_value: 10,
          start_at: NOW,
          end_at: LATER,
        }),
      ),
    201,
  );
  guard(
    "GET /api/admin/vouchers/[id]",
    () => getVoucher(req("/api/admin/vouchers/no-such-voucher"), P("no-such-voucher")),
    404,
  );
  guard(
    "PATCH /api/admin/vouchers/[id]",
    () => patchVoucher(jsonReq("PATCH", "/api/admin/vouchers/no-such-voucher", { name: "x" }), P("no-such-voucher")),
    404,
  );
  guard(
    "DELETE /api/admin/vouchers/[id]",
    () => deleteVoucher(req("/api/admin/vouchers/no-such-voucher"), P("no-such-voucher")),
    404,
  );
  guard(
    "GET /api/admin/vouchers/[id]/usages",
    () => getVoucherUsages(req("/api/admin/vouchers/no-such-voucher/usages"), P("no-such-voucher")),
    404,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────────────────────────────────
  guard("GET /api/admin/users", () => getUsers(req("/api/admin/users")), 200);
  guard(
    "GET /api/admin/users/[id]",
    () => getUser(req(`/api/admin/users/${FIXTURE_IDS.regularUser}`), P(FIXTURE_IDS.regularUser)),
    200,
  );
  guard(
    "GET /api/admin/users/[id]/orders",
    () => getUserOrders(req(`/api/admin/users/${FIXTURE_IDS.regularUser}/orders`), P(FIXTURE_IDS.regularUser)),
    200,
  );
  guard(
    "PATCH /api/admin/users/[id]/reseller-status",
    () =>
      patchUserResellerStatus(
        jsonReq("PATCH", `/api/admin/users/${FIXTURE_IDS.regularUser}/reseller-status`, {
          membership_status: "MEMBER",
        }),
        P(FIXTURE_IDS.regularUser),
      ),
    200,
  );
});
