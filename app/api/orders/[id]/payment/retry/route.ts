import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/src/db";
import { orders, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/orders/[id]/payment/retry
 *
 * Mock endpoint untuk retry / ganti metode pembayaran.
 * Menerima { paymentMethod, paymentChannel, ovoPhone? } dan
 * mengembalikan payment_instruction baru berdasarkan channel yang dipilih.
 *
 * Ketika backend Core API tersedia, cukup ganti implementasi ini dengan
 * proxy ke Core API — interface request/response tidak berubah.
 *
 * Error codes yang dikembalikan:
 *   - ORDER_NOT_FOUND   → 404
 *   - ORDER_ALREADY_PAID → 409
 *   - MAX_ATTEMPTS_REACHED → 422
 */
export async function POST(
  req: NextRequest,
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

  // ── Fetch order (must belong to this user) ───────────────────────────────
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
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

  // ── Fetch current payment row ────────────────────────────────────────────
  const [payment] = await db
    .select({
      status: payments.status,
      amount: payments.amount,
      expiryTime: payments.expiryTime,
    })
    .from(payments)
    .where(eq(payments.orderId, id))
    .limit(1);

  if (!payment) {
    return NextResponse.json(
      { success: false, code: "ORDER_NOT_FOUND", message: "Data pembayaran tidak ditemukan." },
      { status: 404 },
    );
  }

  // ── Guard: order already paid at payment level ───────────────────────────
  if (payment.status === "PAID") {
    return NextResponse.json(
      { success: false, code: "ORDER_ALREADY_PAID", message: "Pesanan ini sudah dibayar." },
      { status: 409 },
    );
  }

  // ── Parse request body ───────────────────────────────────────────────────
  let body: { paymentMethod?: string; paymentChannel?: string; ovoPhone?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { paymentChannel } = body;
  if (!paymentChannel) {
    return NextResponse.json(
      { success: false, message: "paymentChannel wajib diisi." },
      { status: 400 },
    );
  }

  // ── Build mock payment_instruction by channel ────────────────────────────
  const mockInstruction = buildMockInstruction(paymentChannel);

  // ── Build new expiry_time (24 hours from now for mock) ───────────────────
  const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return NextResponse.json({
    success: true,
    data: {
      payment: {
        status: "PENDING" as const,
        payment_type: body.paymentMethod ?? paymentChannel,
        payment_channel: paymentChannel,
        amount: Number(payment.amount),
        expiry_time: expiryTime,
        transaction_time: new Date().toISOString(),
        payment_instruction: mockInstruction,
      },
    },
  });
}

// ─── Mock instruction builder ─────────────────────────────────────────────────

function buildMockInstruction(channel: string): Record<string, unknown> {
  switch (channel) {
    case "bca_va":
      return { type: "va", bank_code: "BCA", va_number: "1234567890123" };
    case "bni_va":
      return { type: "va", bank_code: "BNI", va_number: "9876543219876" };
    case "bri_va":
      return { type: "va", bank_code: "BRI", va_number: "1122334455667" };
    case "permata_va":
      return { type: "va", bank_code: "Permata", va_number: "8800112233445" };
    case "cimb_va":
      return { type: "va", bank_code: "CIMB", va_number: "7700998877665" };
    case "mandiri_va":
    case "echannel":
      return { type: "echannel", company_code: "70012", bill_key: "9988776655443" };
    case "alfamart":
      return { type: "cstore", payment_code: "ALFA-9988-7766-5544", store_name: "Alfamart" };
    case "indomaret":
      return { type: "cstore", payment_code: "INDO-5544-3322-1100", store_name: "Indomaret" };
    case "gopay":
      return {
        type: "qr",
        qr_string:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "gojek://gopay/pay?token=mock_gopay_token",
      };
    case "shopeepay":
      return {
        type: "qr",
        qr_string:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "shopee://wallet/pay?token=mock_shopeepay_token",
      };
    case "qris":
      return {
        type: "qr",
        qr_string:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMDAnIGhlaWdodD0nMjAwJyB2aWV3Qm94PScwIDAgMjAwIDIwMCc+PHJlY3Qgd2lkdGg9JzIwMCcgaGVpZ2h0PScyMDAnIGZpbGw9JyNmM2VmZTQnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZG9taW5hbnQtYmFzZWxpbmU9J21pZGRsZScgdGV4dC1hbmNob3I9J21pZGRsZScgZm9udC1mYW1pbHk9J21vbm9zcGFjZScgZm9udC1zaXplPScxNCcgZmlsbD0nIzNkMjkwMCc+UVIgTW9jazwvdGV4dD48L3N2Zz4=",
        deeplink_url: "https://qris.id/pay?data=mock_qris_data",
      };
    case "dana":
      return { type: "dana", deeplink_url: "dana://pay?amount=50000&info=RoboEdu" };
    case "ovo":
      return { type: "ovo", status_message: "Periksa notifikasi push di aplikasi OVO Anda." };
    case "credit_card":
      return { type: "credit_card", redirect_url: "/payment/3ds-placeholder" };
    default:
      return { type: "va", bank_code: "Bank", va_number: "0000000000000" };
  }
}
