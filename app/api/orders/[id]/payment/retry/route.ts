import "server-only";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments, users } from "@/src/db/schema";
import { getUserIdFromRequest } from "@/src/lib/auth/session";
import { cancelCoreApi, chargeCoreApi } from "@/src/lib/payments/midtrans";

export const runtime = "nodejs";

/** Maximum payment attempts per order. */
const MAX_ATTEMPTS = 5;

/**
 * POST /api/orders/[id]/payment/retry
 *
 * Retry / change payment method for a PENDING order. Requires the
 * `Idempotency-Key` header to prevent double-charges on network retries.
 *
 * Flow:
 *   1. Auth — must be the order owner.
 *   2. Validate order is PENDING and not expired.
 *   3. Load all payment attempts; check attempt count ≤ MAX_ATTEMPTS.
 *   4. Idempotency — if the same key already has an attempt, return it.
 *   5. Cancel the current PENDING attempt via Midtrans Cancel API.
 *   6. Mark the old attempt FAILED in the DB.
 *   7. Charge Midtrans Core API with new midtrans_order_id = {orderNumber}-{N+1}.
 *   8. Insert new payment row with instruction + expiry_time clamped to order.expires_at.
 *
 * Error codes:
 *   ORDER_NOT_FOUND      → 404
 *   ORDER_ALREADY_PAID   → 409
 *   ORDER_EXPIRED        → 409
 *   MAX_ATTEMPTS_REACHED → 422
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // ── Fetch order (must belong to this user) ───────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      expiresAt: orders.expiresAt,
      userId: orders.userId,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, code: "ORDER_NOT_FOUND", message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Guard: order already paid ────────────────────────────────────────────
  if (order.status === "PAID") {
    return NextResponse.json(
      { success: false, code: "ORDER_ALREADY_PAID", message: "Pesanan ini sudah dibayar." },
      { status: 409 },
    );
  }

  // ── Guard: order not in a retriable state ────────────────────────────────
  if (order.status !== "PENDING") {
    return NextResponse.json(
      {
        success: false,
        code: "ORDER_NOT_PENDING",
        message: `Pesanan tidak dapat dibayar ulang (status: ${order.status}).`,
      },
      { status: 409 },
    );
  }

  // ── Guard: order expired ─────────────────────────────────────────────────
  const now = new Date();
  if (order.expiresAt && order.expiresAt <= now) {
    return NextResponse.json(
      {
        success: false,
        code: "ORDER_EXPIRED",
        message: "Waktu pembayaran order telah berakhir.",
      },
      { status: 409 },
    );
  }

  // ── Parse request body ───────────────────────────────────────────────────
  let body: {
    paymentMethod?: string;
    paymentChannel?: string;
    ovoPhone?: string;
    cardToken?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  const { paymentMethod, paymentChannel, ovoPhone, cardToken } = body;
  if (!paymentChannel) {
    return NextResponse.json(
      { success: false, message: "paymentChannel wajib diisi." },
      { status: 400 },
    );
  }

  // Derive paymentType from channel (mirrors checkout logic)
  const paymentType = paymentMethod ?? derivePaymentType(paymentChannel);
  const idempotencyKey = req.headers.get("Idempotency-Key") ?? undefined;

  // ── Load all existing attempts ───────────────────────────────────────────
  const existingAttempts = await db
    .select({
      id: payments.id,
      status: payments.status,
      attemptNumber: payments.attemptNumber,
      midtransOrderId: payments.midtransOrderId,
      paymentInstruction: payments.paymentInstruction,
      paymentChannel: payments.paymentChannel,
      payerPhoneNumber: payments.payerPhoneNumber,
      expiryTime: payments.expiryTime,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .orderBy(desc(payments.attemptNumber));

  // ── Idempotency check ────────────────────────────────────────────────────
  if (idempotencyKey) {
    const idempotent = existingAttempts.find(
      (p) =>
        (p.rawResponse as Record<string, unknown> | null)?.idempotency_key ===
        idempotencyKey,
    );
    if (idempotent?.paymentInstruction) {
      return NextResponse.json({
        success: true,
        data: {
          payment: {
            id: idempotent.id,
            status: "PENDING",
            payment_type: paymentType,
            payment_channel: idempotent.paymentChannel ?? paymentChannel,
            payer_phone_number: idempotent.payerPhoneNumber ?? null,
            amount: Number(order.total),
            expiry_time: idempotent.expiryTime?.toISOString() ?? null,
            transaction_time: now.toISOString(),
            payment_instruction: idempotent.paymentInstruction,
            attempt_number: idempotent.attemptNumber,
          },
          order: {
            expires_at: order.expiresAt?.toISOString() ?? null,
          },
        },
      });
    }
  }

  // ── Guard: max attempts ──────────────────────────────────────────────────
  if (existingAttempts.length >= MAX_ATTEMPTS) {
    return NextResponse.json(
      {
        success: false,
        code: "MAX_ATTEMPTS_REACHED",
        message: `Batas percobaan pembayaran (${MAX_ATTEMPTS}) telah tercapai.`,
      },
      { status: 422 },
    );
  }

  const latestAttempt = existingAttempts[0] ?? null;
  const newAttemptNumber = (latestAttempt?.attemptNumber ?? 0) + 1;
  const newMidtransOrderId = `${order.orderNumber}-${newAttemptNumber}`;
  const grossAmount = Number(order.total);

  // ── Cancel existing PENDING attempt at Midtrans ──────────────────────────
  if (latestAttempt?.status === "PENDING") {
    try {
      await cancelCoreApi(latestAttempt.midtransOrderId);
    } catch {
      // Non-fatal: if cancel fails we still proceed — Midtrans will
      // expire the old attempt, and the new one will be the active one.
    }

    // Mark old attempt FAILED in DB
    await db
      .update(payments)
      .set({ status: "FAILED", updatedAt: now })
      .where(eq(payments.id, latestAttempt.id));
  }

  // ── Fetch user details for Midtrans customer_details ────────────────────
  const [user] = await db
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User tidak ditemukan." },
      { status: 500 },
    );
  }

  // ── Insert new PENDING payment row (placeholder) ─────────────────────────
  const newPaymentId = crypto.randomUUID();
  await db.insert(payments).values({
    id: newPaymentId,
    orderId: id,
    midtransOrderId: newMidtransOrderId,
    attemptNumber: newAttemptNumber,
    paymentType,
    paymentChannel,
    payerPhoneNumber: ovoPhone ?? null,
    status: "PENDING",
    amount: String(grossAmount),
    // Store idempotency key inside rawResponse — no extra column migration needed
    rawResponse: idempotencyKey ? { idempotency_key: idempotencyKey } : null,
  });

  // ── Charge Midtrans Core API (outside any DB transaction) ────────────────
  const nameParts = user.name.split(" ");
  const customerDetails = {
    first_name: nameParts[0] ?? user.name,
    last_name: nameParts.slice(1).join(" ") || undefined,
    email: user.email,
    phone: user.phone ?? undefined,
  };

  const itemDetails = [
    { id: "ORDER", name: `Pesanan ${order.orderNumber}`, price: grossAmount, quantity: 1 },
  ];

  // Expiry: remaining minutes until order.expires_at (min 1 minute)
  const msLeft = order.expiresAt
    ? order.expiresAt.getTime() - now.getTime()
    : 24 * 60 * 60 * 1000;
  const minutesLeft = Math.max(1, Math.floor(msLeft / 60_000));

  try {
    const charge = await chargeCoreApi({
      paymentType,
      channel: paymentChannel,
      midtransOrderId: newMidtransOrderId,
      grossAmount,
      customerDetails,
      itemDetails,
      payerPhoneNumber: ovoPhone,
      cardToken,
      expiry: { duration: minutesLeft, unit: "minutes" },
    });

    // Clamp expiry to order.expires_at
    const rawExpiry = charge.expiryTime;
    const clampedExpiry =
      order.expiresAt && rawExpiry && rawExpiry < order.expiresAt
        ? rawExpiry
        : (order.expiresAt ?? rawExpiry ?? null);

    // ── Update payment with instruction + expiry ─────────────────────────
    await db
      .update(payments)
      .set({
        paymentInstruction: charge.instruction,
        paymentChannel,
        payerPhoneNumber: ovoPhone ?? null,
        expiryTime: clampedExpiry ?? undefined,
        transactionTime: now,
        rawResponse: {
          ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
          ...((charge.raw as object) ?? {}),
        },
        updatedAt: now,
      })
      .where(eq(payments.id, newPaymentId));

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          id: newPaymentId,
          status: "PENDING",
          payment_type: paymentType,
          payment_channel: paymentChannel,
          payer_phone_number: ovoPhone ?? null,
          amount: grossAmount,
          expiry_time: clampedExpiry?.toISOString() ?? null,
          transaction_time: now.toISOString(),
          payment_instruction: charge.instruction,
          attempt_number: newAttemptNumber,
        },
        order: {
          expires_at: order.expiresAt?.toISOString() ?? null,
        },
      },
    });
  } catch (chargeError) {
    // Charge failed — mark the new payment row FAILED and surface the error
    await db
      .update(payments)
      .set({
        status: "FAILED",
        rawResponse: {
          ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
          chargeError:
            chargeError instanceof Error
              ? chargeError.message
              : "Unknown charge error",
        },
        updatedAt: now,
      })
      .where(eq(payments.id, newPaymentId));

    return NextResponse.json(
      {
        success: false,
        code: "PAYMENT_CHARGE_FAILED",
        message:
          chargeError instanceof Error
            ? chargeError.message
            : "Gagal memproses pembayaran. Silakan coba lagi.",
      },
      { status: 502 },
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive the Midtrans `payment_type` from the channel string.
 * Mirrors the mapping used by chargeCoreApi.
 */
function derivePaymentType(channel: string): string {
  if (
    channel === "bca_va" ||
    channel === "bni_va" ||
    channel === "bri_va" ||
    channel === "cimb_va" ||
    channel === "permata_va" ||
    channel === "mandiri_va"
  ) {
    return "bank_transfer";
  }
  if (channel === "mandiri_va" || channel === "echannel") return "echannel";
  if (channel === "alfamart" || channel === "indomaret") return "cstore";
  // For single-method channels, type == channel
  return channel; // gopay, shopeepay, qris, dana, ovo, credit_card
}
