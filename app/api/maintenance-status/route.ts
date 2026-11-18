import { NextResponse } from "next/server";
import { getSetting } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * GET /api/maintenance-status
 *
 * Public endpoint (no auth) — returns whether maintenance mode is active.
 * Used by middleware to decide whether to redirect guests.
 *
 * Response: { active: boolean }
 */
export async function GET() {
  const value = await getSetting("maintenance_mode");
  return NextResponse.json(
    { active: value === "true" },
    {
      headers: {
        // Allow middleware to cache this for a short period to avoid
        // hitting the DB on every single request edge-side.
        "Cache-Control": "no-store",
      },
    },
  );
}
