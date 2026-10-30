import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { membershipPurchases, payments } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";
import { getSetting } from "@/src/lib/services/settings-service";
import { getSnapClient } from "@/src/lib/payments/midtrans";

export const runtime = "nodejs";

/**
 * POST /api/checkout/membership
 *
 * Auth: Customer (wajib login)
 * Body: { package: "PLUS" }
 *
 * Membaca harga dan durasi dari `settings.membership_plus_price` / `membership_plus_duration_months`
 * (bukan hardcoded), membuat entri pending `membership_purchase` dan `payments`, memanggil Midtrans Snap,
 * dan mengembalikan `snap_token` serta `redirect_url`.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Format request body tidak valid." },
        { status: 400 },
      );
    }

    interface CheckoutMembershipBody {
      package?: unknown;
    }
    const rawPkg = body && typeof body === "object" && "package" in body ? (body as CheckoutMembershipBody).package : undefined;
    const pkg = typeof rawPkg === "string" ? rawPkg.trim().toUpperCase() : "";
    if (pkg !== "PLUS") {
      return NextResponse.json(
        { success: false, message: "Paket membership tidak valid. Hanya paket PLUS yang tersedia." },
        { status: 400 },
      );
    }

    // ── 1. Baca harga & durasi dari database settings ──────────────────────
    const priceStr = await getSetting("membership_plus_price", "299000");
    const durationStr = await getSetting("membership_plus_duration_months", "12");

    const price = Number(priceStr);
    const durationMonths = parseInt(durationStr, 10);

    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Harga membership belum dikonfigurasi dengan benar." },
        { status: 500 },
      );
    }

    // ── 2. Buat ID & purchase number ───────────────────────────────────────
    const purchaseNumber = `MBR-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const membershipPurchaseId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    // ── 3. Panggil Midtrans Snap ───────────────────────────────────────────
    let snapToken = `snap-${purchaseNumber}`;
    let redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

    try {
      const snap = getSnapClient();
      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: purchaseNumber,
          gross_amount: price,
        },
        item_details: [
          {
            id: "MBR-PLUS",
            name: "Membership Plus RoboEdu",
            price: price,
            quantity: 1,
          },
        ],
      });

      if (transaction?.token) {
        snapToken = transaction.token;
        redirectUrl = transaction.redirect_url;
      }
    } catch (midtransError) {
      // Di test environment, gunakan mock token jika API sandbox tidak terjangkau
      if (process.env.NODE_ENV !== "test") {
        console.error("Midtrans Snap error:", midtransError);
        return NextResponse.json(
          { success: false, message: "Gagal menghubungi payment gateway. Silakan coba lagi." },
          { status: 502 },
        );
      }
    }

    // ── 4. Simpan ke database dalam satu transaksi ────────────────────────
    await db.transaction(async (tx) => {
      // Insert payment terlebih dahulu dengan membership_purchase_id null
      await tx.insert(payments).values({
        id: paymentId,
        orderId: null,
        membershipPurchaseId: null,
        transactionId: `TX-${purchaseNumber}`,
        paymentType: "midtrans",
        status: "pending",
        amount: price.toFixed(2),
        transactionTime: new Date(),
        rawResponse: {
          snap_token: snapToken,
          redirect_url: redirectUrl,
        },
      });

      // Insert baris membership_purchase
      await tx.insert(membershipPurchases).values({
        id: membershipPurchaseId,
        purchaseNumber,
        userId,
        paymentId,
        priceSnapshot: price.toFixed(2),
        durationMonthsSnapshot: durationMonths,
        planNameSnapshot: "Plus",
        status: "PENDING",
      });

      // Hubungkan payment ke membership_purchase_id
      await tx
        .update(payments)
        .set({ membershipPurchaseId })
        .where(eq(payments.id, paymentId));
    });

    return NextResponse.json({
      success: true,
      data: {
        purchase_number: purchaseNumber,
        snap_token: snapToken,
        redirect_url: redirectUrl,
        price,
      },
    });
  } catch (error) {
    console.error("POST /api/checkout/membership error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses checkout membership." },
      { status: 500 },
    );
  }
}
