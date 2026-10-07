import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { getSnapClient } from "@/src/lib/payments/midtrans";

export const runtime = "nodejs";

/** Snap token berlaku 24 jam. Kita anggap masih valid kalau < 23 jam. */
const TOKEN_VALID_MS = 23 * 60 * 60 * 1000;

interface StoredSnapMeta {
  snap_token?: string;
  redirect_url?: string;
  created_at?: string;
}

/**
 * GET /api/orders/[id]/snap-token
 *
 * Strategi:
 * 1. Ambil token yang sudah disimpan di payments.rawResponse.snap_token
 * 2. Kalau masih < 23 jam, kembalikan langsung — TIDAK panggil Midtrans lagi
 * 3. Kalau tidak ada / sudah > 23 jam, generate token baru dari Midtrans
 *
 * Ini menghindari error "Transaksi tidak ditemukan" yang terjadi saat
 * createTransaction dipanggil ulang dengan order_id yang sudah terdaftar
 * di Midtrans sandbox/production.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { id } = await params;

  // ── Fetch order — harus milik user ini ───────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Pesanan tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Hanya order PENDING yang boleh dibayar ───────────────────────────
  if (order.status !== "PENDING") {
    return NextResponse.json(
      {
        success: false,
        message: `Pesanan sudah berstatus ${order.status} dan tidak dapat dibayar.`,
        status: order.status,
      },
      { status: 409 },
    );
  }

  // ── Fetch payment record ──────────────────────────────────────────────
  const [payment] = await db
    .select({
      amount: payments.amount,
      rawResponse: payments.rawResponse,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  const grossAmount = payment ? Number(payment.amount) : Number(order.total);

  // ── Cek cached snap token ─────────────────────────────────────────────
  if (payment?.rawResponse) {
    const meta = payment.rawResponse as StoredSnapMeta;
    if (meta.snap_token && meta.created_at) {
      const age = Date.now() - new Date(meta.created_at).getTime();
      if (age < TOKEN_VALID_MS) {
        // Token masih valid — kembalikan tanpa panggil Midtrans
        return NextResponse.json({
          success: true,
          data: {
            snap_token: meta.snap_token,
            order_id: order.id,
            order_number: order.orderNumber,
            total: grossAmount,
          },
        });
      }
    }
  }

  // ── Token tidak ada / expired — generate baru dari Midtrans ──────────
  // Catatan: di sandbox, order_id yang sama bisa di-createTransaction lagi
  // selama transaksi sebelumnya sudah expire. Kalau masih pending di Midtrans
  // tapi token kita expired (edge case), Midtrans akan error — handled di catch.
  const snap = getSnapClient();
  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: grossAmount,
      },
      item_details: [
        {
          id: "ORDER",
          name: `Pesanan ${order.orderNumber}`,
          price: grossAmount,
          quantity: 1,
        },
      ],
    });

    // Simpan token baru ke rawResponse
    await db
      .update(payments)
      .set({
        rawResponse: {
          snap_token: transaction.token,
          redirect_url: transaction.redirect_url,
          created_at: new Date().toISOString(),
        },
      })
      .where(eq(payments.orderId, id));

    return NextResponse.json({
      success: true,
      data: {
        snap_token: transaction.token,
        order_id: order.id,
        order_number: order.orderNumber,
        total: grossAmount,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat token pembayaran.";
    return NextResponse.json(
      { success: false, message },
      { status: 502 },
    );
  }
}
