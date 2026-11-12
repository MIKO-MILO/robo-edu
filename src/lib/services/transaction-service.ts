import "server-only";

import crypto from "node:crypto";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
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
import { chargeCoreApi, type PaymentInstruction } from "@/src/lib/payments/midtrans";
import { getSetting } from "@/src/lib/services/settings-service";

// ── Input / output types ─────────────────────────────────────────────────────

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
  // ── Payment method (Core API) ──────────────────────────────────────────────
  /** Midtrans payment_type, e.g. "bank_transfer", "gopay", "echannel", "cstore" */
  paymentMethod: string;
  /** Channel within the method, e.g. "bca_va", "qris", "ovo", "alfamart" */
  paymentChannel: string;
  /** Required for OVO — the payer's registered mobile number */
  payerPhoneNumber?: string;
  /** Required for credit_card — the card token from Midtrans Card.js */
  cardToken?: string;
  /** Idempotency key from the checkout request's Idempotency-Key header */
  idempotencyKey?: string;
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
  total: number;
  paymentMethod: string;
  paymentChannel: string;
  paymentInstruction: PaymentInstruction;
  expiryTime: string | null;
  status: string;
};

// ── Internal helpers ─────────────────────────────────────────────────────────

type PricedCartItem = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  /** Effective unit price: member price when applicable, otherwise regular price. */
  price: number;
  isMemberPrice: boolean;
  quantity: number;
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

function isActiveMember(user: {
  membershipStatus: string;
  membershipExpiresAt: Date | null;
}): boolean {
  if (user.membershipStatus !== "MEMBER") return false;
  if (!user.membershipExpiresAt) return false;
  return new Date(user.membershipExpiresAt) > new Date();
}

// ── Main service ─────────────────────────────────────────────────────────────

/**
 * Create a Core API checkout transaction end-to-end:
 *
 * 1. (Idempotency) If `idempotencyKey` already exists on an order for this
 *    user, return the previous result — no second charge.
 * 2. Validate address, provider, dropship fields.
 * 3. Validate max 3 PENDING orders per user (PENDING_ORDER_LIMIT).
 * 4. Look up membership → determine effective pricing.
 * 5. Atomically reserve stock (UPDATE WHERE stock >= qty).
 * 6. Build order totals (subtotal + discount + tax + shipping).
 * 7. Insert order (expires_at from settings.order_expires_hours), order items,
 *    pending payment (midtrans_order_id = {number}-1), shipment — all in one tx.
 * 8. Charge Midtrans Core API outside the tx.
 * 9. On success: update payment with instruction + channel + expiry (clamped).
 * 10. On failure: compensate (restore stock, cancel order/payment, restore voucher).
 */
export async function createPaymentTransaction(
  input: CreatePaymentTransactionInput,
): Promise<CreatePaymentTransactionResult> {
  const shippingCost = asRupiah(input.shippingCost, "Shipping cost");
  const now = new Date();

  // ── 0. Idempotency check ──────────────────────────────────────────────────
  if (input.idempotencyKey) {
    const [existing] = await db
      .select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total })
      .from(orders)
      .where(
        and(
          eq(orders.idempotencyKey, input.idempotencyKey),
          eq(orders.userId, input.userId),
        ),
      )
      .limit(1);

    if (existing) {
      // Fetch the latest payment for this order
      const [existingPayment] = await db
        .select({
          paymentType: payments.paymentType,
          paymentChannel: payments.paymentChannel,
          paymentInstruction: payments.paymentInstruction,
          expiryTime: payments.expiryTime,
          status: payments.status,
        })
        .from(payments)
        .where(eq(payments.orderId, existing.id))
        .orderBy(sql`${payments.attemptNumber} DESC`)
        .limit(1);

      if (existingPayment?.paymentInstruction) {
        return {
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          total: Number(existing.total),
          paymentMethod: existingPayment.paymentType,
          paymentChannel: existingPayment.paymentChannel ?? input.paymentChannel,
          paymentInstruction: existingPayment.paymentInstruction as PaymentInstruction,
          expiryTime: existingPayment.expiryTime?.toISOString() ?? null,
          status: existingPayment.status,
        };
      }
    }
  }

  // ── 1. Validate dropship fields ───────────────────────────────────────────
  const isDropship = input.isDropship === true;
  if (isDropship) {
    if (!input.senderName?.trim()) {
      throw new Error("Dropship orders require a sender name (senderName).");
    }
    if (!input.senderPhone?.trim()) {
      throw new Error("Dropship orders require a sender phone (senderPhone).");
    }
  }

  // Variables set inside the DB transaction, used outside for the Core API call
  let txResult!: {
    id: string;
    number: string;
    total: number;
    items: PricedCartItem[];
    discountAmount: number;
    shippingCost: number;
    expiresAt: Date;
    paymentId: string;
  };

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

    // ── 2. Validate max 3 PENDING orders ───────────────────────────────────
    const [pendingCount] = await tx
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          eq(orders.userId, input.userId),
          eq(orders.status, "PENDING"),
        ),
      );
    if ((pendingCount?.count ?? 0) >= 3) {
      throw new Error("PENDING_ORDER_LIMIT: user already has 3 pending orders");
    }

    // ── 3. Look up user membership ──────────────────────────────────────────
    const [user] = await tx
      .select({
        membershipStatus: users.membershipStatus,
        membershipExpiresAt: users.membershipExpiresAt,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);
    if (!user) throw new Error("User not found");

    const memberActive = isActiveMember(user);

    // ── 4. Fetch cart items with both prices ────────────────────────────────
    const rows = await tx
      .select({
        productId: products.id,
        productName: products.name,
        variantId: productVariants.id,
        variantName: productVariants.variantName,
        sku: productVariants.sku,
        regularPrice: productVariants.price,
        memberPrice: productVariants.resellerPrice,
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

    // ── 5. Determine effective prices ───────────────────────────────────────
    const items: PricedCartItem[] = rows.map((row) => {
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
      };
    });

    // ── 6. Atomically reserve stock ─────────────────────────────────────────
    for (const item of items) {
      const qty = item.quantity;
      if (qty < 1) throw new Error(`Invalid quantity for ${item.productName}`);

      const [updateResult] = await tx.execute(
        sql`UPDATE ${productVariants}
            SET ${productVariants.stock} = ${productVariants.stock} - ${qty}
            WHERE ${productVariants.id} = ${item.variantId}
              AND ${productVariants.stock} >= ${qty}`,
      );
      // The result is a ResultSetHeader; affectedRows === 0 means stock was insufficient
      const affectedRows = (updateResult as { affectedRows?: number }).affectedRows ?? 0;
      if (affectedRows === 0) {
        throw new Error(
          `STOCK_INSUFFICIENT: ${item.productName} does not have enough stock`,
        );
      }
    }

    // ── 7. Compute totals ───────────────────────────────────────────────────
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
    const taxAmount = Math.floor(taxableAmount * 0.08);
    const total = taxableAmount + shippingCost + taxAmount;

    // ── 8. expires_at from settings ─────────────────────────────────────────
    const rawHours = await getSetting("order_expires_hours");
    const expiryHours = rawHours ? (Number(rawHours) || 24) : 24;
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

    const id = crypto.randomUUID();
    const number = orderNumber();
    const paymentId = crypto.randomUUID();
    const recipient = address[0]!;

    // ── 9. Insert order ─────────────────────────────────────────────────────
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
      expiresAt,
      idempotencyKey: input.idempotencyKey ?? null,
    });

    // ── 10. Insert order items ───────────────────────────────────────────────
    await tx.insert(orderItems).values(
      items.map((item) => ({
        id: crypto.randomUUID(),
        orderId: id,
        productId: item.productId,
        variantId: item.variantId,
        productNameSnapshot: item.productName,
        variantNameSnapshot: item.variantName,
        skuSnapshot: item.sku,
        priceSnapshot: String(item.price),
        quantity: item.quantity,
        subtotal: String(item.price * item.quantity),
      })),
    );

    // ── 11. Insert PENDING payment (midtrans_order_id = {number}-1) ─────────
    const midtransOrderId = `${number}-1`;
    await tx.insert(payments).values({
      id: paymentId,
      orderId: id,
      midtransOrderId,
      attemptNumber: 1,
      paymentType: input.paymentMethod,
      paymentChannel: input.paymentChannel,
      payerPhoneNumber: input.payerPhoneNumber ?? null,
      status: "PENDING",
      amount: String(total),
    });

    // ── 12. Insert PENDING shipment ──────────────────────────────────────────
    await tx.insert(shipments).values({
      id: crypto.randomUUID(),
      orderId: id,
      shippingProviderId: provider.id,
      service: provider.name,
      status: "pending",
    });

    // ── 13. Voucher usage + clear cart ───────────────────────────────────────
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

    const [userCart] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, input.userId))
      .limit(1);

    if (userCart) {
      await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    }

    return {
      id,
      number,
      total,
      items,
      discountAmount,
      shippingCost,
      expiresAt,
      paymentId,
      midtransOrderId,
      userEmail: user.email,
      userName: user.name,
      userPhone: user.phone,
      recipientPhone: recipient.phone,
    };
  });

  txResult = result;
  const { id, number, total, items, expiresAt, paymentId } = result;
  const midtransOrderId = result.midtransOrderId;

  // ── 14. Charge Midtrans Core API (outside DB tx) ──────────────────────────
  // Build item details — if discount/tax/shipping make sum ambiguous, use aggregate
  const baseItems = items.map((item) => ({
    id: item.sku,
    name: `${item.productName} - ${item.variantName}`.slice(0, 50),
    price: item.price,
    quantity: item.quantity,
  }));

  const subtotalFromItems = baseItems.reduce(
    (s, it) => s + it.price * it.quantity,
    0,
  );
  const discountApplied = result.discountAmount;
  const shippingApplied = result.shippingCost;
  const expectedBase = subtotalFromItems - discountApplied + shippingApplied;
  const taxExpected = Math.floor(expectedBase * 0.08);
  const computedFromParts = expectedBase + taxExpected;
  const useAggregate =
    discountApplied > 0 || Math.abs(computedFromParts - Number(total)) > 1;

  let itemDetails: Array<{ id: string; name: string; price: number; quantity: number }>;
  if (useAggregate) {
    itemDetails = [{ id: "ORDER", name: "Pembayaran RoboEdu", price: total, quantity: 1 }];
  } else {
    const taxLine = Number(total) - expectedBase;
    itemDetails = [...baseItems];
    if (shippingApplied > 0) {
      itemDetails.push({ id: "SHIPPING", name: "Biaya pengiriman", price: shippingApplied, quantity: 1 });
    }
    if (taxLine > 0) {
      itemDetails.push({ id: "TAX", name: "Pajak PPN", price: taxLine, quantity: 1 });
    }
    const sumCheck = itemDetails.reduce((s, it) => s + it.price * it.quantity, 0);
    if (sumCheck !== Number(total)) {
      itemDetails = [{ id: "ORDER", name: "Pembayaran RoboEdu", price: total, quantity: 1 }];
    }
  }

  const nameParts = result.userName.split(" ");
  const customerDetails = {
    first_name: nameParts[0] ?? result.userName,
    last_name: nameParts.slice(1).join(" ") || undefined,
    email: result.userEmail,
    phone: result.recipientPhone || result.userPhone || undefined,
  };

  // Compute expiry as remaining minutes until order.expires_at
  const msLeft = expiresAt.getTime() - Date.now();
  const minutesLeft = Math.max(1, Math.floor(msLeft / 60_000));
  const expiryParam = { duration: minutesLeft, unit: "minutes" as const };

  try {
    const charge = await chargeCoreApi({
      paymentType: input.paymentMethod,
      channel: input.paymentChannel,
      midtransOrderId,
      grossAmount: total,
      customerDetails,
      itemDetails,
      payerPhoneNumber: input.payerPhoneNumber,
      cardToken: input.cardToken,
      expiry: expiryParam,
    });

    // Clamp expiry: must not exceed order.expires_at
    const rawExpiry = charge.expiryTime;
    const clampedExpiry =
      rawExpiry && rawExpiry < expiresAt ? rawExpiry : expiresAt;

    // ── 15. Update payment with instruction + channel + expiry ────────────
    await db
      .update(payments)
      .set({
        paymentInstruction: charge.instruction,
        paymentChannel: input.paymentChannel,
        payerPhoneNumber: input.payerPhoneNumber ?? null,
        expiryTime: clampedExpiry,
        transactionTime: now,
        rawResponse: charge.raw,
      })
      .where(eq(payments.id, paymentId));

    return {
      orderId: id,
      orderNumber: number,
      total,
      paymentMethod: input.paymentMethod,
      paymentChannel: input.paymentChannel,
      paymentInstruction: charge.instruction,
      expiryTime: clampedExpiry.toISOString(),
      status: "PENDING",
    };
  } catch (chargeError) {
    // ── 16. Compensation: restore stock, cancel order, fail payment ────────
    await db.transaction(async (tx) => {
      // Restore stock for each item
      for (const item of txResult.items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }

      // Mark payment FAILED
      await tx
        .update(payments)
        .set({
          status: "FAILED",
          rawResponse: {
            chargeError:
              chargeError instanceof Error
                ? chargeError.message
                : "Unknown charge error",
          },
        })
        .where(eq(payments.id, paymentId));

      // Cancel order
      await tx
        .update(orders)
        .set({ status: "CANCELLED", cancelledAt: new Date() })
        .where(eq(orders.id, id));

      // Restore voucher usage if any
      const [cancelledOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);
      if (cancelledOrder?.voucherId) {
        await tx.delete(voucherUsages).where(eq(voucherUsages.orderId, id));
        await tx
          .update(vouchers)
          .set({ usedCount: sql`GREATEST(${vouchers.usedCount} - 1, 0)` })
          .where(eq(vouchers.id, cancelledOrder.voucherId));
      }
    });

    // Re-throw as PAYMENT_CHARGE_FAILED so the route returns 422
    const msg =
      chargeError instanceof Error ? chargeError.message : "Charge failed";
    throw new Error(`PAYMENT_CHARGE_FAILED: ${msg}`);
  }
}
