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
  userAddresses,
  voucherUsages,
  vouchers,
} from "@/src/db/schema";
import { getSnapClient } from "@/src/lib/payments/midtrans";

export type CreatePaymentTransactionInput = {
  /** Must come from the authenticated server session, never from a client request body. */
  userId: string;
  addressId: string;
  shippingCost: number;
  voucherCode?: string;
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
  price: number;
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
  const maximum = voucher.maximumDiscount === null ? base : Number(voucher.maximumDiscount);
  return Math.min(subtotal, base, maximum);
}

/**
 * Prices are read from the database, never trusted from the browser. Call this
 * from an authenticated checkout action after the shipping fee is calculated.
 */
export async function createPaymentTransaction(
  input: CreatePaymentTransactionInput,
): Promise<CreatePaymentTransactionResult> {
  const shippingCost = asRupiah(input.shippingCost, "Shipping cost");
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const address = await tx
      .select()
      .from(userAddresses)
      .where(and(eq(userAddresses.id, input.addressId), eq(userAddresses.userId, input.userId)))
      .limit(1);
    if (!address[0]) throw new Error("Shipping address was not found");

    const rows = await tx
      .select({
        productId: products.id,
        productName: products.name,
        variantId: productVariants.id,
        variantName: productVariants.variantName,
        sku: productVariants.sku,
        price: productVariants.price,
        stock: productVariants.stock,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(and(eq(carts.userId, input.userId), eq(products.status, "ACTIVE"), eq(productVariants.status, "ACTIVE")));

    if (rows.length === 0) throw new Error("Cart is empty or contains unavailable products");

    const items: PricedCartItem[] = rows.map((item) => ({
      ...item,
      price: asRupiah(Number(item.price), "Product price"),
    }));
    for (const item of items) {
      if (item.quantity < 1 || item.stock < item.quantity) {
        throw new Error(`${item.productName} does not have enough stock`);
      }
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      if (!voucher || (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit)) {
        throw new Error("Voucher is invalid or has reached its usage limit");
      }
      discountAmount = calculateDiscount(subtotal, voucher);
    }

    const total = subtotal - discountAmount + shippingCost;
    const id = crypto.randomUUID();
    const number = orderNumber();
    const recipient = address[0]!;

    await tx.insert(orders).values({
      id,
      orderNumber: number,
      userId: input.userId,
      addressId: recipient.id,
      voucherId: voucher?.id ?? null,
      voucherCodeSnapshot: voucher?.code ?? null,
      subtotal: String(subtotal),
      discountAmount: String(discountAmount),
      shippingCost: String(shippingCost),
      total: String(total),
      status: "PENDING",
      recipientName: recipient.recipientName,
      recipientPhone: recipient.phone,
      shippingAddress: recipient.address,
      shippingProvince: recipient.province,
      shippingCity: recipient.city,
      shippingDistrict: recipient.district,
      shippingVillage: recipient.village,
      shippingPostalCode: recipient.postalCode,
    });

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

    return { id, number, total, items, discountAmount, shippingCost };
  });

  const snap = getSnapClient();
  try {
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: result.number, gross_amount: result.total },
      item_details: [
        ...result.items.map((item) => ({
          id: item.sku,
          name: `${item.productName} - ${item.variantName}`.slice(0, 50),
          price: item.price,
          quantity: item.quantity,
        })),
        ...(result.shippingCost > 0
          ? [{ id: "SHIPPING", name: "Biaya pengiriman", price: result.shippingCost, quantity: 1 }]
          : []),
        ...(result.discountAmount > 0
          ? [{ id: "VOUCHER", name: "Diskon voucher", price: -result.discountAmount, quantity: 1 }]
          : []),
      ],
    });

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
        .set({ status: "FAILED", rawResponse: { snapError: error instanceof Error ? error.message : "Unknown Snap error" } })
        .where(eq(payments.orderId, result.id));
      await tx.update(orders).set({ status: "CANCELLED", cancelledAt: new Date() }).where(eq(orders.id, result.id));

      // A failed token request must not consume a limited-use voucher.
      const [failedOrder] = await tx.select().from(orders).where(eq(orders.id, result.id)).limit(1);
      if (failedOrder?.voucherId) {
        await tx.delete(voucherUsages).where(eq(voucherUsages.orderId, result.id));
        await tx
          .update(vouchers)
          .set({ usedCount: sql`GREATEST(${vouchers.usedCount} - 1, 0)` })
          .where(eq(vouchers.id, failedOrder.voucherId));
      }
    });
    throw error;
  }
}
