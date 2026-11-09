import { NextRequest, NextResponse } from "next/server";
import { createMembershipTransaction } from "@/src/lib/services/membership-transaction-service";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * POST /api/checkout/membership
 *
 * Creates a pending membership_purchase + payments row and returns a
 * Midtrans Snap token for the client to redirect to.
 *
 * Body: { package: "PLUS" }
 *
 * The price and duration are ALWAYS read from the `settings` table at request
 * time — never hardcoded — so an admin price change takes effect immediately
 * without a redeploy (ticket 11, criterion 3).
 *
 * PRD Bab 6.8 | FR-022 | US-011
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body tidak valid." },
        { status: 400 },
      );
    }

    const pkg = typeof body.package === "string" ? body.package.toUpperCase() : "";
    if (pkg !== "PLUS") {
      return NextResponse.json(
        {
          success: false,
          message: "Paket tidak valid. Saat ini hanya paket \"PLUS\" yang tersedia.",
        },
        { status: 400 },
      );
    }

    const result = await createMembershipTransaction({
      userId,
      package: "PLUS",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/checkout/membership error:", error);

    const raw = error instanceof Error ? error.message : "";
    let userMessage = "Gagal membuat transaksi membership. Silakan coba lagi.";

    if (raw.includes("not configured") || raw.includes("invalid")) {
      userMessage =
        "Konfigurasi harga membership belum tersedia. Hubungi administrator.";
    } else if (raw.includes("MIDTRANS") || raw.includes("Snap")) {
      userMessage =
        "Gagal menghubungi payment gateway. Transaksi belum dibuat — silakan coba lagi.";
    }

    return NextResponse.json(
      { success: false, message: userMessage },
      { status: 400 },
    );
  }
}
