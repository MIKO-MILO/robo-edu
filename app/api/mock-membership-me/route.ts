import { NextResponse } from "next/server";
import type { MembershipStatusData } from "@/types";

/**
 * Mock API Route: GET /api/mock-membership-me
 * -------------------------------------------
 * FASE FRONTEND-ONLY: mengembalikan data statis untuk pengembangan UI.
 *
 * TODO(backend): Hapus file ini ketika endpoint GET /membership/me tersedia di backend.
 * Update hook di hooks/user/reseller/use-reseller-status.ts:
 *   - Ganti: fetch("/api/mock-membership-me")
 *   - Dengan: membershipService.getMembershipStatus()
 * Tidak ada perubahan yang diperlukan di komponen atau page.tsx.
 *
 * Untuk mengganti tampilan yang dirender:
 *   Ubah nilai MOCK_STATUS di bawah ini.
 *
 * PRD Bab 6.8 | FR-023
 */

// ─── KONFIGURASI MOCK ────────────────────────────────────────────
// Ubah nilai ini untuk mensimulasikan tampilan status berbeda:
const MOCK_STATUS: "NOT_MEMBER" | "MEMBER" = "MEMBER";
// ─────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse<MembershipStatusData>> {
  if (MOCK_STATUS === "NOT_MEMBER") {
    return NextResponse.json({
      membership_status: "NOT_MEMBER",
      membership_expires_at: null,
      purchases: [],
    });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return NextResponse.json({
    membership_status: "MEMBER",
    membership_expires_at: expiresAt.toISOString(),
    purchases: [
      {
        id: "mp-001",
        purchase_number: "MBR-20261026-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 99000,
        duration_months_snapshot: 1,
        status: "PAID",
        starts_at: "2026-10-26T09:00:00Z",
        ends_at: expiresAt.toISOString(),
        paid_at: "2026-10-26T09:05:00Z",
        payment_method: "gopay",
        created_at: "2026-10-26T08:55:00Z",
      },
      {
        id: "mp-002",
        purchase_number: "MBR-20260925-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 99000,
        duration_months_snapshot: 1,
        status: "FAILED",
        starts_at: null,
        ends_at: null,
        paid_at: null,
        payment_method: null,
        created_at: "2026-09-25T14:30:00Z",
      },
      {
        id: "mp-003",
        purchase_number: "MBR-20260826-001",
        plan_name_snapshot: "Plus",
        price_snapshot: 89000,
        duration_months_snapshot: 1,
        status: "EXPIRED",
        starts_at: "2026-08-26T00:00:00Z",
        ends_at: "2026-09-26T00:00:00Z",
        paid_at: "2026-08-26T10:00:00Z",
        payment_method: "bank_transfer",
        created_at: "2026-08-26T09:50:00Z",
      },
    ],
  });
}
