import "server-only";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  orders,
  payments,
  orderItems,
  productVariants,
  refunds,
} from "@/src/db/schema";
import { requireAdminFromRequest } from "@/src/lib/auth/require-admin-from-request";
import { writeAuditLog } from "@/src/lib/audit/write-audit-log";
import midtransClient from "midtrans-client";

export const runtime = "nodejs";

/** Payment channels that support the Midtrans Refund API. */
const MIDTRANS_REFUND_SUPPORTED = new Set([
  "credit_card",
  "card",
  "gopay",
  "shopeepay",
  "qris",
  "dana",
  "ovo",
]);

function isMidtransRefundSupported(paymentType: string, paymentChannel: string | null): boolean {
  const pt = paymentType.toLowerCase();
  const pc = (paymentChannel ?? "").toLowerCase();
  return (
    MIDTRANS_REFUND_SUPPORTED.has(pt) ||
    MIDTRANS_REFUND_SUPPORTED.has(pc)
  );
}

function getCoreApiClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

/**
 * POST /api/admin/orders/:id/refund
 *
 * Process a refund for an order. Admin-only.
 *
 * Request body:
 * {
 *   amount: number,          // Rupiah, must not exceed remaining refundable amount
 *   reason: string,          // required
 *   restore_quota: boolean,  // whether to restore product stock
 *   proof_url?: string,      // optional — only relevant for MANUAL refunds
 * }
 *
 * Flow:
 *   1. Auth — admin only.
 *   2. Load order + payment.
 *   3. Validate amount ≤ (payment.amount - sum of existing refunds).
 *   4. If paymentType/channel supports Midtrans Refund API → call it; method=MIDTRANS_API.
 *      Otherwise → method=MANUAL, proof_url=null (uploaded separately).
 *   5. If restore_quota=true → restore stock per order_item.quantity (atomic, inside DB tx).
 *   6. Insert refund row.
 *   7. If total refunds == payment.amount → set order.status = REFUNDED.
 *   8. Write audit log.
 *
 * Error codes:
 *   ORDER_NOT_FOUND      → 404
 *   PAYMENT_NOT_FOUND    → 404
 *   REFUND_EXCEEDS_PAYMENT → 422
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const auth = await requireAdminFromRequest(req);
  if (!auth.ok) return auth.response;

  const { id: orderId } = await params;

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    amount?: unknown;
    reason?: unknown;
    restore_quota?: unknown;
    proof_url?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const rawAmount = Number(body.amount);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const restoreQuota = body.restore_quota === true;
  const proofUrlFromBody =
    typeof body.proof_url === "string" && body.proof_url.trim()
      ? body.proof_url.trim()
      : null;

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return NextResponse.json(
      { success: false, message: "Nominal refund harus berupa angka positif." },
      { status: 400 },
    );
  }
  if (!reason) {
    return NextResponse.json(
      { success: false, message: "Alasan refund wajib diisi." },
      { status: 400 },
    );
  }

  // ── Fetch order ───────────────────────────────────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Fetch the latest PAID payment for this order ──────────────────────────
  const [payment] = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      paymentType: payments.paymentType,
      paymentChannel: payments.paymentChannel,
      midtransTransactionId: payments.midtransTransactionId,
      midtransOrderId: payments.midtransOrderId,
    })
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  if (!payment) {
    return NextResponse.json(
      { success: false, code: "PAYMENT_NOT_FOUND", message: "Data pembayaran tidak ditemukan." },
      { status: 404 },
    );
  }

  const paymentAmount = Number(payment.amount);

  // ── Sum existing successful refunds for this payment ─────────────────────
  const [sumRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(${refunds.amount}), 0)` })
    .from(refunds)
    .where(
      and(
        eq(refunds.paymentId, payment.id),
        eq(refunds.status, "SUCCESS"),
      ),
    );

  const alreadyRefunded = Number(sumRow?.total ?? 0);
  const remaining = paymentAmount - alreadyRefunded;

  if (rawAmount > remaining + 0.001) {
    return NextResponse.json(
      {
        success: false,
        code: "REFUND_EXCEEDS_PAYMENT",
        message: `Nominal refund (${rawAmount}) melebihi sisa yang dapat direfund (${remaining}).`,
      },
      { status: 422 },
    );
  }

  // ── Determine refund method ───────────────────────────────────────────────
  const usesMidtransApi = isMidtransRefundSupported(
    payment.paymentType,
    payment.paymentChannel,
  );

  const refundMethod = usesMidtransApi ? "MIDTRANS_API" : "MANUAL";
  let refundStatus: "SUCCESS" | "FAILED" | "PENDING" = usesMidtransApi ? "PENDING" : "PENDING";

  // For MANUAL, proof_url can be provided upfront (admin uploaded separately before calling)
  const proofUrl = refundMethod === "MANUAL" ? (proofUrlFromBody ?? null) : null;

  // ── Call Midtrans Refund API if supported ─────────────────────────────────
  let midtransRefundRaw: unknown = null;
  if (usesMidtransApi) {
    try {
      const coreApi = getCoreApiClient();
      const refundKey = `${payment.midtransOrderId}-refund-${crypto.randomUUID().slice(0, 8)}`;
      const result = await coreApi.transaction.refund(
        payment.midtransTransactionId ?? payment.midtransOrderId,
        {
          refund_key: refundKey,
          amount: rawAmount,
          reason,
        },
      );
      midtransRefundRaw = result;
      refundStatus = "SUCCESS";
    } catch (err) {
      // Midtrans refund call failed — record as FAILED so admin can retry
      midtransRefundRaw = {
        error: err instanceof Error ? err.message : "Unknown Midtrans error",
      };
      refundStatus = "FAILED";
    }
  } else {
    // MANUAL — always starts as PENDING until proof is uploaded (SUCCESS confirmed manually)
    refundStatus = "PENDING";
  }

  // ── Insert refund row + stock restore (atomic) ─────────────────────────────
  const refundId = crypto.randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    // Insert refund record
    await tx.insert(refunds).values({
      id: refundId,
      paymentId: payment.id,
      orderId,
      amount: String(rawAmount),
      reason,
      method: refundMethod,
      proofUrl,
      restoreQuota,
      processedBy: auth.userId,
      status: refundStatus,
      createdAt: now,
      updatedAt: now,
    });

    // Restore stock per order_item if requested
    if (restoreQuota) {
      const items = await tx
        .select({
          variantId: orderItems.variantId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      for (const item of items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
    }

    // Set order status = REFUNDED if total refunds (including this one) == payment.amount
    if (refundStatus === "SUCCESS" || refundMethod === "MANUAL") {
      // For MANUAL we include this refund in the total even though status is PENDING
      // because the ticket spec says "if total refund = payment.amount → set REFUNDED"
      // and the UI computes this after a successful POST.
      const newTotal = alreadyRefunded + rawAmount;
      if (newTotal >= paymentAmount - 0.001) {
        await tx
          .update(orders)
          .set({ status: "REFUNDED", updatedAt: now })
          .where(eq(orders.id, orderId));
      }
    }
  });

  // ── Audit log (fire-and-forget) ───────────────────────────────────────────
  await writeAuditLog({
    actorId: auth.userId,
    action: "order.refund_created",
    targetType: "order",
    targetId: orderId,
    description: `Refund Rp${rawAmount.toLocaleString("id-ID")} untuk pesanan ${order.orderNumber} oleh admin.`,
    metadata: {
      refund_id: refundId,
      order_id: orderId,
      order_number: order.orderNumber,
      payment_id: payment.id,
      amount: rawAmount,
      reason,
      method: refundMethod,
      status: refundStatus,
      restore_quota: restoreQuota,
      ...(midtransRefundRaw ? { midtrans_raw: midtransRefundRaw } : {}),
    },
  });

  // ── Fetch the inserted refund for the response ────────────────────────────
  const [insertedRefund] = await db
    .select()
    .from(refunds)
    .where(eq(refunds.id, refundId))
    .limit(1);

  // Determine the final order status (might have been updated to REFUNDED)
  const [updatedOrder] = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return NextResponse.json({
    success: true,
    data: {
      id: insertedRefund!.id,
      payment_id: insertedRefund!.paymentId,
      order_id: insertedRefund!.orderId,
      membership_purchase_id: insertedRefund!.membershipPurchaseId ?? null,
      amount: Number(insertedRefund!.amount),
      reason: insertedRefund!.reason,
      method: insertedRefund!.method,
      status: insertedRefund!.status,
      proof_url: insertedRefund!.proofUrl ?? null,
      restore_quota: insertedRefund!.restoreQuota,
      processed_by: insertedRefund!.processedBy,
      created_at: insertedRefund!.createdAt.toISOString(),
      updated_at: insertedRefund!.updatedAt.toISOString(),
      order_status: updatedOrder?.status ?? order.status,
    },
  });
}
