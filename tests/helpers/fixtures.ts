import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";

/**
 * Deterministic test fixtures.
 *
 * Every row uses a FIXED string id so tests can reference fixtures by stable
 * constants (see FIXTURE_IDS). Passwords are hashed with the app's real
 * `hashPassword` so login tests exercise the real `verifyPassword` path.
 *
 * Fixture coverage (per ticket 02 acceptance criteria):
 *   - one MEMBER user and one non-MEMBER user
 *   - one variant WITH a member price (reseller_price set) and one WITHOUT (null)
 *   - an order + order item + a payment linked to that order
 *   - a membership purchase + its payment (exercises the nullable order_id /
 *     membership_purchase_id "exactly one" invariant on the payment side)
 *   - the six settings keys from ticket 01
 */

/** Shared password for all fixture users (tests know this value). */
export const FIXTURE_PASSWORD = "Password123!";

/** Cached scrypt hash of FIXTURE_PASSWORD, computed once per worker. */
let _passwordHash: string | null = null;

/** Stable fixture IDs tests can rely on. */
export const FIXTURE_IDS = {
  memberUser: "test-user-member",
  regularUser: "test-user-regular",
  category: "test-cat-robot",
  productType: "test-pt-physical",
  product: "test-prod-line-follower",
  variantWithMemberPrice: "test-var-with-member-price",
  variantWithoutMemberPrice: "test-var-without-member-price",
  address: "test-addr-regular",
  order: "test-order-1",
  orderItem: "test-order-item-1",
  orderPayment: "test-payment-order",
  membershipPurchase: "test-mbr-1",
  membershipPayment: "test-payment-mbr",
} as const;

export const FIXTURE_EMAILS = {
  member: "member.test@roboedu.test",
  regular: "regular.test@roboedu.test",
} as const;

/** Settings rows seeded by ticket 01 (kept here so tests can rely on them). */
const SETTINGS_SEED: Array<{ key: string; value: string }> = [
  { key: "membership_plus_price", value: "150000" },
  { key: "membership_plus_duration_months", value: "12" },
  { key: "store_name", value: "RoboEdu Test Store" },
  { key: "store_phone", value: "0812000000" },
  { key: "store_email", value: "store@roboedu.test" },
  { key: "store_address", value: "Jl. Test No. 1, Jakarta" },
];

/** Far-future date used for active membership expiry. */
const MEMBERSHIP_EXPIRES_AT = new Date("2026-12-31T23:59:59Z");

/**
 * Insert all fixtures in dependency order.
 *
 * Assumes the relevant tables already exist and are empty (resetData truncates
 * first). Idempotent given a clean slate.
 */
export async function seedFixtures(
  db: MySql2Database<typeof schema>,
): Promise<void> {
  // Hash once per worker and reuse — scrypt is relatively expensive and the
  // hash is re-inserted on every resetData(). verifyPassword accepts any
  // valid scrypt$salt$hash, so a stable hash is fine.
  if (!_passwordHash) _passwordHash = await hashPassword(FIXTURE_PASSWORD);
  const memberPasswordHash = _passwordHash;
  const regularPasswordHash = _passwordHash;

  // --- users: one MEMBER, one NOT_MEMBER ---
  await db.insert(schema.users).values([
    {
      id: FIXTURE_IDS.memberUser,
      name: "Member User",
      email: FIXTURE_EMAILS.member,
      password: memberPasswordHash,
      phone: "08120000001",
      role: "CUSTOMER",
      membershipStatus: "MEMBER",
      membershipExpiresAt: MEMBERSHIP_EXPIRES_AT,
      isActive: true,
    },
    {
      id: FIXTURE_IDS.regularUser,
      name: "Regular User",
      email: FIXTURE_EMAILS.regular,
      password: regularPasswordHash,
      phone: "08120000002",
      role: "CUSTOMER",
      membershipStatus: "NOT_MEMBER",
      isActive: true,
    },
  ]);

  // --- settings (six keys from ticket 01) ---
  await db.insert(schema.settings).values(SETTINGS_SEED);

  // --- catalog: category -> product type -> product -> variants ---
  await db.insert(schema.categories).values({
    id: FIXTURE_IDS.category,
    name: "Robot Kit",
    slug: "test-robot-kit",
    description: "Test category for robot kits",
    isActive: true,
  });

  await db.insert(schema.productTypes).values({
    id: FIXTURE_IDS.productType,
    name: "Barang Fisik",
    slug: "test-physical-goods",
    description: "Test physical product type",
    isActive: true,
  });

  await db.insert(schema.products).values({
    id: FIXTURE_IDS.product,
    categoryId: FIXTURE_IDS.category,
    productTypeId: FIXTURE_IDS.productType,
    name: "Line Follower Robot Kit (Test)",
    slug: "test-line-follower-robot-kit",
    sku: "TEST-ROBOT-LINE",
    description: "Test product with two variants.",
    status: "active",
  });

  await db.insert(schema.productVariants).values([
    {
      id: FIXTURE_IDS.variantWithMemberPrice,
      productId: FIXTURE_IDS.product,
      variantName: "With Member Price",
      sku: "TEST-ROBOT-LINE-MEMBER",
      price: "100000.00",
      // member price present (reseller_price column exposed as member_price)
      resellerPrice: "85000.00",
      stock: 50,
      weight: 800,
      status: "active",
    },
    {
      id: FIXTURE_IDS.variantWithoutMemberPrice,
      productId: FIXTURE_IDS.product,
      variantName: "No Member Price",
      sku: "TEST-ROBOT-LINE-NOPRICE",
      price: "200000.00",
      // no member discount for this variant
      resellerPrice: null,
      stock: 30,
      lowStockThreshold: 5,
      weight: 800,
      status: "active",
    },
  ]);

  // --- address for the regular (non-MEMBER) user, used by the order ---
  await db.insert(schema.userAddresses).values({
    id: FIXTURE_IDS.address,
    userId: FIXTURE_IDS.regularUser,
    label: "Rumah",
    recipientName: "Regular User",
    phone: "08120000002",
    address: "Jl. Test No. 2",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Kebayoran",
    village: "Test Village",
    postalCode: "12345",
    isPrimary: true,
  });

  // --- order + order item for the regular user ---
  await db.insert(schema.orders).values({
    id: FIXTURE_IDS.order,
    orderNumber: "TEST-ORD-1",
    userId: FIXTURE_IDS.regularUser,
    addressId: FIXTURE_IDS.address,
    subtotal: "200000.00",
    discountAmount: "0",
    taxAmount: "0",
    shippingCost: "15000.00",
    total: "215000.00",
    status: "pending",
    recipientName: "Regular User",
    recipientPhone: "08120000002",
    shippingAddress: "Jl. Test No. 2",
    shippingProvince: "DKI Jakarta",
    shippingCity: "Jakarta Selatan",
    shippingDistrict: "Kebayoran",
    shippingVillage: "Test Village",
    shippingPostalCode: "12345",
  });

  await db.insert(schema.orderItems).values({
    id: FIXTURE_IDS.orderItem,
    orderId: FIXTURE_IDS.order,
    productId: FIXTURE_IDS.product,
    variantId: FIXTURE_IDS.variantWithoutMemberPrice,
    productNameSnapshot: "Line Follower Robot Kit (Test)",
    variantNameSnapshot: "No Member Price",
    skuSnapshot: "TEST-ROBOT-LINE-NOPRICE",
    priceSnapshot: "200000.00",
    quantity: 1,
    subtotal: "200000.00",
  });

  // --- payment for the order (order_id set, membership_purchase_id null) ---
  await db.insert(schema.payments).values({
    id: FIXTURE_IDS.orderPayment,
    orderId: FIXTURE_IDS.order,
    membershipPurchaseId: null,
    transactionId: "TEST-TX-ORDER-1",
    paymentType: "bank_transfer",
    status: "settlement",
    amount: "215000.00",
    transactionTime: new Date("2026-10-01T10:00:00Z"),
  });

  // --- membership purchase + payment for the MEMBER user ---
  // Insert the payment first (with no membership link yet) so the FK
  // membership_purchase.payment_id can reference it, then back-link the payment.
  await db.insert(schema.payments).values({
    id: FIXTURE_IDS.membershipPayment,
    orderId: null,
    membershipPurchaseId: null,
    transactionId: "TEST-TX-MBR-1",
    paymentType: "bank_transfer",
    status: "settlement",
    amount: "150000.00",
    transactionTime: new Date("2026-10-01T09:00:00Z"),
  });

  await db.insert(schema.membershipPurchases).values({
    id: FIXTURE_IDS.membershipPurchase,
    purchaseNumber: "MBR-TEST-1",
    userId: FIXTURE_IDS.memberUser,
    paymentId: FIXTURE_IDS.membershipPayment,
    priceSnapshot: "150000.00",
    durationMonthsSnapshot: 12,
    planNameSnapshot: "Plus",
    startsAt: new Date("2026-01-01T00:00:00Z"),
    endsAt: MEMBERSHIP_EXPIRES_AT,
    paidAt: new Date("2026-01-01T00:05:00Z"),
    status: "PAID",
  });

  await db
    .update(schema.payments)
    .set({ membershipPurchaseId: FIXTURE_IDS.membershipPurchase })
    .where(eq(schema.payments.id, FIXTURE_IDS.membershipPayment));
}
