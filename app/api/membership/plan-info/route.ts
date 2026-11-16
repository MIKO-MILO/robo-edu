import { NextResponse } from "next/server";
import { getSetting } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/membership/plan-info
 *
 * Public (no-auth) endpoint that returns the current membership Plus plan
 * pricing sourced directly from the settings table. This is intentionally
 * separate from the admin-gated GET /api/admin/settings so the confirmation
 * screen can read live pricing without requiring admin privileges.
 *
 * Response:
 *   {
 *     success: true,
 *     data: {
 *       price: number,            // e.g. 299000
 *       duration_months: number,  // e.g. 12
 *     }
 *   }
 *
 * Returns 503 when settings have not been configured yet — the
 * confirmation page renders an error state in that case.
 *
 * Ticket 11, criterion 10: price always comes from settings DB —
 * changing it via the admin UI takes effect here with no redeploy.
 */
export async function GET() {
  const [rawPrice, rawDuration] = await Promise.all([
    getSetting("membership_plus_price"),
    getSetting("membership_plus_duration_months"),
  ]);

  if (!rawPrice || !rawDuration) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Konfigurasi harga membership belum tersedia. Hubungi administrator.",
      },
      { status: 503 },
    );
  }

  const price = Number(rawPrice);
  const durationMonths = Number(rawDuration);

  if (!Number.isFinite(price) || !Number.isFinite(durationMonths)) {
    return NextResponse.json(
      {
        success: false,
        message: "Konfigurasi harga membership tidak valid.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      price,
      duration_months: durationMonths,
    },
  });
}
