import { NextResponse } from "next/server";

/**
 * Shared date-range parsing for the three breakdown report endpoints
 * (payment-methods, order-status, category-sales).
 *
 * These endpoints accept `start_date` and `end_date` query params and
 * default to the current calendar month when neither is provided — per
 * ticket 19.
 */

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Parse `start_date` / `end_date` from URL search params.
 *
 * - If both are provided they must be valid ISO date strings.
 * - If one or both are omitted the range defaults to the current month
 *   (first day → end of today).
 *
 * Returns either `{ range }` on success or `{ error }` (a 400 NextResponse)
 * when the provided values cannot be parsed as dates.
 */
export function parseReportDateRange(
  searchParams: URLSearchParams,
): { range: ReportDateRange } | { error: NextResponse } {
  const startParam = searchParams.get("start_date");
  const endParam = searchParams.get("end_date");

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (startParam || endParam) {
    startDate = startParam ? new Date(startParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = endParam ? new Date(endParam) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: "Format tanggal tidak valid. Gunakan format ISO date (mis. 2026-01-01).",
          },
          { status: 400 },
        ),
      };
    }
  } else {
    // Default: current calendar month (1st → end of today)
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  // Make end date inclusive by setting time to end of day
  endDate.setHours(23, 59, 59, 999);

  return { range: { startDate, endDate } };
}
