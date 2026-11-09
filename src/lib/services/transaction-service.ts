import "server-only";

import crypto from "node:crypto";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  cartItems,
  carts,
  orderItems,
  orders,
  payments,
  productVariants,
  products,
  shipments,
  shippingProviders,
  userAddresses,
  users,
  voucherUsages,
  vouchers,
} from "@/src/db/schema";
import { getSnapClient } from "@/src/lib/payments/midtrans";

export type CreatePaymentTransactionInput = {
  /** Must come from the authenticated server session, never from a client request body. */
  userId: string;
  addressId: string;
  shippingCost: number;
  /** ID of the shipping provider (e.g. JNE). Required so a shipments row can
   *  be created automatically after the order is placed. */
  providerId: string;
  voucherCode?: string;
  notes?: string;
  // ── Dropship ─────────────────────────────────────────────────────────────
  /** When true the order is a dropship — senderName + senderPhone are required. */
  isDropship?: boolean;
  /** Sender name shown on the package label (required when isDropship = true). */
  senderName?: string;
  /** Sender phone shown on the package label (required when isDropship = true). */
  senderPhone?: string;
};

export type CreatePaymentTransactionResult = {
  orderId: string;
  orderNumber: string;
  snapToken: string;
  redirectUrl: string;
  total: number;
};

type PricedCartItem = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  /** Effective unit price: member price when applicable, otherwise regular price. */
  price: number;
  /** True when the member price was used for this item. */
  isMemberPrice: boolean;
  quantity: number;
  stock: number;
};

function asRupiah(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative whole Rupiah amount`);
  }
  return value;
}

function orderNumber() {
  return `RE-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function calculateDiscount(
  subtotal: number,
  voucher: {
    discountType: string;
    discountValue: string;
    minimumPurchase: string;
    maximumDiscount: string | null;
  },
) {
  if (subtotal < Number(voucher.minimumPurchase)) return 0;

  const base =
    voucher.discountType === "PERCENTAGE"
      ? Math.floor((subtotal * Number(voucher.discountValue)) / 100)
      : Number(voucher.discountValue);
  const maximum =
    voucher.maximumDiscount === null ? base : Number(voucher.maximumDiscount);
  return Math.min(subtotal, base, maximum);
}

/**
 * Returns true when the user is an active MEMBER right now.
 * Both conditions must hold:
 *   1. membership_status = "MEMBER"
 *   2. membership_expires_at is in the future (or the column is null, which
 *      should not happen for a MEMBER but we guard against it defensively)
 */
function isActiveMember(user: {
  membershipStatus: string;
  membershipExpiresAt: Date | null;
}): boolean {
  if (user.membershipStatus !== "MEMBER") return false;
  if (!user.membershipExpiresAt) return false;
  return new Date(user.membershipExpiresAt) > new Date();
}

/**
 * Prices are read from the database, never trusted from the browser. Call this
 * from an authenticated checkout action after the shipping fee is calculated.
 *
 * Member pricing: when the calling user is an active MEMBER and a variant has a
 * non-null `resellerPrice` (the member price column), that price is used instead
 * of the regular `price`. Variants with a null `resellerPrice` always fall back
 * to the regular price regardless of membership status.
 *
 * Shipment: a single `shipments` row with status PENDING is created atomically
 * inside the same DB transaction as the order, so admin never needs to create
 * shipments manually.
 */
export async function createPaymentTransaction(
  input: CreatePaymentTransactionInput,
): Promise<CreatePaymentTransactionResult> {
  const shippingCost = asRupiah(input.shippingCost, "Shipping cost");
  const now = new Date();

  // ── Validate dropship fields up front ────────────────────────────────────
  const isDropship = input.isDropship === true;
  if (isDropship) {
    if (!input.senderName?.trim()) {
      throw new Error("Dropship orders require a sender name (senderName).");
    }
    if (!input.senderPhone?.trim()) {
      throw new Error("Dropship orders require a sender phone (senderPhone).");
    }
  }

  const result = await db.transaction(async (tx) => {
    // ── Validate address ────────────────────────────────────────────────────
    const address = await tx
      .select()
      .from(userAddresses)
      .where(
        and(
          eq(userAddresses.id, input.addressId),
          eq(userAddresses.userId, input.userId),
        ),
      )
      .limit(1);
    if (!address[0]) throw new Error("Shipping address was not found");

    // ── Validate shipping provider ──────────────────────────────────────────
    const [provider] = await tx
      .select({ id: shippingProviders.id, name: shippingProviders.name })
      .from(shippingProviders)
      .where(
        and(
          eq(shippingProviders.id, input.providerId),
          eq(shippingProviders.isActive, true),
        ),
      )
      .limit(1);
    if (!provider) throw new Error("Shipping provider not found or inactive");

    // ── Look up user membership status ──────────────────────────────────────
    const [user] = await tx
      .select({
        membershipStatus: users.membershipStatus,
        membershipExpiresAt: users.membershipExpiresAt,
      })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);
    if (!user) throw new Error("User not found");

    const memberActive = isActiveMember(user);

    // ── Fetch cart items with both prices ───────────────────────────────────
    const rows = await tx
      .select({
        productId: products.id,
        productName: products.name,
        variantId: productVariants.id,
        variantName: productVariants.variantName,
        sku: productVariants.sku,
        regularPrice: productVariants.price,
        memberPrice: productVariants.resellerPrice, // nullable; null = no member discount
        stock: productVariants.stock,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(
        and(
          eq(carts.userId, input.userId),
          eq(products.status, "ACTIVE"),
          eq(productVariants.status, "ACTIVE"),
        ),
      );

    if (rows.length === 0)
      throw new Error("Cart is empty or contains unavailable products");

    // ── Determine effective price per item ──────────────────────────────────
    const items: PricedCartItem[] = rows.map((row) => {
      // Use member price only when: user is active MEMBER AND variant has a
      // non-null member price. Null member price = no discount for this variant.
      const useMemberPrice =
        memberActive &&
        row.memberPrice !== null &&
        row.memberPrice !== undefined;

      const effectivePrice = useMemberPrice
        ? asRupiah(Number(row.memberPrice), `Member price for ${row.sku}`)
        : asRupiah(Number(row.regularPrice), `Regular price for ${row.sku}`);

      return {
        productId: row.productId,
        productName: row.productName,
        variantId: row.variantId,
        variantName: row.variantName,
        sku: row.sku,
        price: effectivePrice,
        isMemberPrice: useMemberPrice,
        quantity: row.quantity,
        stock: row.stock,
      };
    });

    for (const item of items) {
      if (item.quantity < 1 || item.stock < item.quantity) {
        throw new Error(`${item.productName} does not have enough stock`);
      }
    }

    // ── Subtotal uses effective (member-aware) prices ───────────────────────
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let voucher: typeof vouchers.$inferSelect | undefined;
    let discountAmount = 0;
    if (input.voucherCode?.trim()) {
      const found = await tx
        .select()
        .from(vouchers)
        .where(
          and(
            eq(vouchers.code, input.voucherCode.trim().toUpperCase()),
            eq(vouchers.isActive, true),
            lte(vouchers.startAt, now),
            gte(vouchers.endAt, now),
          ),
        )
        .limit(1);
      voucher = found[0];
      if (
        !voucher ||
        (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit)
      ) {
        throw new Error("Voucher is invalid or has reached its usage limit");
      }
      discountAmount = calculateDiscount(subtotal, voucher);
    }

    const taxableAmount = subtotal - discountAmount;
    // Pajak 8% dibulatkan ke bawah agar tidak ada selisih desimal
    const taxAmount = Math.floor(taxableAmount * 0.08);
    const total = taxableAmount + shippingCost + taxAmount;
    const id = crypto.randomUUID();
    const number = orderNumber();
    const recipient = address[0]!;

    // ── Insert order ────────────────────────────────────────────────────────
    await tx.insert(orders).values({
      id,
      orderNumber: number,
      userId: input.userId,
      addressId: recipient.id,
      voucherId: voucher?.id ?? null,
      voucherCodeSnapshot: voucher?.code ?? null,
      subtotal: String(subtotal),
      discountAmount: String(discountAmount),
      taxAmount: String(taxAmount),
      shippingCost: String(shippingCost),
      total: String(total),
      status: "PENDING",
      recipientName: recipient.recipientName,
      recipientPhone: recipient.phone,
      shippingAddress: recipient.address,
      shippingProvince: recipient.province,
      shippingCity: recipient.city,
      shippingDistrict: recipient.district,
      shippingVillage: recipient.village ?? "",
      shippingPostalCode: recipient.postalCode ?? "",
      isDropship,
      senderName: isDropship ? (input.senderName?.trim() ?? null) : null,
      senderPhone: isDropship ? (input.senderPhone?.trim() ?? null) : null,
    });

    // ── Insert order items (snapshot prices at checkout time) ───────────────
    await tx.insert(orderItems).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        orderId: id,
        productId: item.productId,
        variantId: item.variantId,
        productNameSnapshot: item.productName,
        variantNameSnapshot: item.variantName,
        skuSnapshot: item.sku,
        priceSnapshot: String(item.price),  // effective price (member or regular)
        quantity: item.quantity,
        subtotal: String(item.price * item.quantity),
      })),
    );

    // ── Insert pending payment ──────────────────────────────────────────────
    await tx.insert(payments).values({
      id: crypto.randomUUID(),
      orderId: id,
      // Midtrans sends its transaction ID later through the webhook. The order
      // number is a stable unique placeholder while the payment is pending.
      transactionId: number,
      paymentType: "MIDTRANS_SNAP",
      status: "PENDING",
      amount: String(total),
    });

    // ── Auto-create shipment row (status PENDING) ───────────────────────────
    // Admin never creates shipments manually — the shipment record exists from
    // the moment an order is placed so tracking can start immediately.
    await tx.insert(shipments).values({
      id: crypto.randomUUID(),
      orderId: id,
      shippingProviderId: provider.id,
      service: provider.name,  // default service = provider name; admin can update
      status: "pending",
    });

    if (voucher) {
      await tx.insert(voucherUsages).values({
        id: crypto.randomUUID(),
        voucherId: voucher.id,
        userId: input.userId,
        orderId: id,
        discountAmount: String(discountAmount),
      });
      await tx
        .update(vouchers)
        .set({ usedCount: sql`${vouchers.usedCount} + 1` })
        .where(eq(vouchers.id, voucher.id));
    }

    // ── Clear cart ──────────────────────────────────────────────────────────
    const [userCart] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, input.userId))
      .limit(1);

    if (userCart) {
      await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    }

    return { id, number, total, items, discountAmount, shippingCost };
  });

  // ── Call Midtrans Snap (outside DB transaction) ──────────────────────────
  const snap = getSnapClient();
  try {
    const baseItems = result.items.map((item) => ({
      id: item.sku,
      name: `${item.productName} - ${item.variantName}`.slice(0, 50),
      price: item.price,
      quantity: item.quantity,
    }));
    const extras: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }> = [];
    if (result.shippingCost > 0) {
      extras.push({
        id: "SHIPPING",
        name: "Biaya pengiriman",
        price: result.shippingCost,
        quantity: 1,
      });
    }

    const subtotalItems = baseItems.reduce(
      (s, it) => s + it.price * it.quantity,
      0,
    );
    const discountApplied = result.discountAmount;
    const shippingApplied = result.shippingCost;
    const expectedSubtotalBeforeTax =
      subtotalItems - discountApplied + shippingApplied;
    const taxExpected = Math.floor(expectedSubtotalBeforeTax * 0.08);
    const computedTotalFromBranch = expectedSubtotalBeforeTax + taxExpected;

    const useAggregate =
      discountApplied > 0 ||
      Math.abs(computedTotalFromBranch - Number(result.total)) > 1;

    let itemDetails: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    if (useAggregate) {
      itemDetails = [
        {
          id: "ORDER",
          name: "Pembayaran RoboEdu",
          price: Number(result.total),
          quantity: 1,
        },
      ];
    } else {
      const taxFromTotal = Number(result.total) - expectedSubtotalBeforeTax;
      itemDetails = [...baseItems, ...extras];
      if (taxFromTotal > 0) {
        itemDetails.push({
          id: "TAX",
          name: "Pajak PPN",
          price: taxFromTotal,
          quantity: 1,
        });
      }
    }

    const sumCheck = itemDetails.reduce(
      (s, it) => s + it.price * it.quantity,
      0,
    );
    if (sumCheck !== Number(result.total)) {
      itemDetails = [
        {
          id: "ORDER",
          name: "Pembayaran RoboEdu",
          price: Number(result.total),
          quantity: 1,
        },
      ];
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: result.number,
        gross_amount: Number(result.total),
      },
      item_details: itemDetails,
    });

    // Simpan snap token ke rawResponse agar bisa dipakai ulang tanpa
    // memanggil Midtrans lagi (token berlaku 24 jam).
    await db
      .update(payments)
      .set({
        rawResponse: {
          snap_token: transaction.token,
          redirect_url: transaction.redirect_url,
          created_at: new Date().toISOString(),
        },
      })
      .where(eq(payments.orderId, result.id));

    return {
      orderId: result.id,
      orderNumber: result.number,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      total: result.total,
    };
  } catch (error) {
    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          status: "FAILED",
          rawResponse: {
            snapError:
              error instanceof Error ? error.message : "Unknown Snap error",
          },
        })
        .where(eq(payments.orderId, result.id));
      await tx
        .update(orders)
        .set({ status: "CANCELLED", cancelledAt: new Date() })
        .where(eq(orders.id, result.id));

      // A failed token request must not consume a limited-use voucher.
      const [failedOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, result.id))
        .limit(1);
      if (failedOrder?.voucherId) {
        await tx
          .delete(voucherUsages)
          .where(eq(voucherUsages.orderId, result.id));
        await tx
          .update(vouchers)
          .set({ usedCount: sql`GREATEST(${vouchers.usedCount} - 1, 0)` })
          .where(eq(vouchers.id, failedOrder.voucherId));
      }
    });
    throw error;
  }
}
