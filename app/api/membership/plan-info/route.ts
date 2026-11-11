import { NextResponse } from "next/server";
import { getSetting } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/membership/plan-info
 *
 * Public (no auth required) — returns the current membership plan details
 * so the confirmation screen can display the price before the user submits.
 *
 * Values are read live from the `settings` table so an admin price change
 * takes effect without a redeploy.
 */
export async function GET() {
  try {
    const [rawPrice, rawDuration] = await Promise.all([
      getSetting("membership_plus_price"),
      getSetting("membership_plus_duration_months"),
    ]);

    if (!rawPrice || !rawDuration) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi paket membership belum tersedia." },
        { status: 503 },
      );
    }

    const price = Number(rawPrice);
    const durationMonths = Number(rawDuration);

    return NextResponse.json({
      success: true,
      data: {
        plan_name: "Plus",
        price,
        duration_months: durationMonths,
        currency: "IDR",
      },
    });
  } catch (error) {
    console.error("GET /api/membership/plan-info error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat informasi paket." },
      { status: 500 },
    );
  }
}
