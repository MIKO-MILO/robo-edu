import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { getCoreApiClient } from "@/src/lib/payments/midtrans";

export const runtime = "nodejs";

/**
 * POST /api/membership/payment/check/[purchaseId]
 *
 * Manually poll Midtrans for the latest status of the active payment attempt,
 * sync the result to the DB, and return the updated status.
 *
 * Analog to POST /api/orders/[id]/payment/check for product orders.
 *
 * Authentication: must be the purchase owner (userId from session cookie).
 *
 * Returns:
 *   { success: true, data: { status: PaymentStatus, payment_id } }
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { purchaseId } = await params;

  // ── Fetch purchase — must belong to this user ─────────────────────────────
  const [purchase] = await db
    .select({
      id: membershipPurchases.id,
      status: membershipPurchases.status,
    })
    .from(membershipPurchases)
    .where(
      and(
        eq(membershipPurchases.id, purchaseId),
        eq(membershipPurchases.userId, userId),
      ),
    )
    .limit(1);

  if (!purchase) {
    return NextResponse.json(
      { success: false, message: "Pembelian membership tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Fetch latest payment attempt ──────────────────────────────────────────
  const [payment] = await db
    .select({
      id: payments.id,
      status: payments.status,
      midtransOrderId: payments.midtransOrderId,
    })
    .from(payments)
    .where(eq(payments.membershipPurchaseId, purchaseId))
    .orderBy(desc(payments.attemptNumber))
    .limit(1);

  if (!payment) {
    return NextResponse.json(
      { success: false, message: "Tidak ada data pembayaran untuk pembelian ini." },
      { status: 404 },
    );
  }

  // Skip polling if already in a terminal state
  const TERMINAL_STATES = new Set(["PAID", "FAILED", "EXPIRED", "REFUNDED"]);
  if (TERMINAL_STATES.has(payment.status)) {
    return NextResponse.json({
      success: true,
      data: { status: payment.status, payment_id: payment.id },
    });
  }

  // ── Call Midtrans Get Status ───────────────────────────────────────────────
  try {
    const coreApi = getCoreApiClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notification = await (coreApi as any).transaction.status(
      payment.midtransOrderId,
    ) as {
      transaction_status: string;
      fraud_status?: string;
      transaction_id?: string;
      settlement_time?: string;
      expiry_time?: string;
    };

    const txStatus = notification.transaction_status ?? "";
    const fraudStatus = notification.fraud_status ?? "";

    // Resolve our internal payment state
    let newStatus: string | null = null;
    if (txStatus === "settlement" || txStatus === "capture") {
      if (fraudStatus === "" || fraudStatus === "accept") {
        newStatus = "PAID";
      } else {
        newStatus = "FAILED";
      }
    } else if (txStatus === "pending") {
      newStatus = "PENDING";
    } else if (
      txStatus === "deny" ||
      txStatus === "cancel" ||
      txStatus === "failure"
    ) {
      newStatus = "FAILED";
    } else if (txStatus === "expire") {
      newStatus = "EXPIRED";
    } else if (txStatus === "refund" || txStatus === "partial_refund") {
      newStatus = "REFUNDED";
    }

    if (!newStatus || newStatus === payment.status) {
      // No change — return current status
      return NextResponse.json({
        success: true,
        data: { status: payment.status, payment_id: payment.id },
      });
    }

    const now = new Date();

    // ── Update payment row ──────────────────────────────────────────────────
    await db
      .update(payments)
      .set({
        status: newStatus,
        midtransTransactionId: notification.transaction_id ?? undefined,
        rawResponse: notification,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id));

    // ── If PAID, update membership purchase ──────────────────────────────────
    if (newStatus === "PAID") {
      await db
        .update(membershipPurchases)
        .set({ status: "PAID", paidAt: now })
        .where(eq(membershipPurchases.id, purchaseId));
    } else if (newStatus === "FAILED" || newStatus === "EXPIRED") {
      await db
        .update(membershipPurchases)
        .set({ status: newStatus })
        .where(eq(membershipPurchases.id, purchaseId));
    }

    return NextResponse.json({
      success: true,
      data: { status: newStatus, payment_id: payment.id },
    });
  } catch (error) {
    console.error("POST /api/membership/payment/check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memeriksa status pembayaran. Silakan coba lagi.",
      },
      { status: 502 },
    );
  }
}
