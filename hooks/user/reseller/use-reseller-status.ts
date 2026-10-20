/**
 * use-reseller-status.ts
 * ----------------------
 * Hook untuk mengambil status pengajuan reseller customer yang sedang login.
 *
 * FASE SAAT INI: Mock — data hardcode via MOCK_RESELLER_STATUS.
 *
 * TRANSISI KE BACKEND (saat API tersedia):
 *   1. Uncomment blok "FASE BACKEND" di bawah.
 *   2. Hapus blok "FASE MOCK".
 *   3. Pastikan QueryClientProvider sudah terpasang di layout.
 *   4. Tidak ada perubahan yang diperlukan di page.tsx maupun komponen view.
 *
 * Endpoint yang dipakai:
 *   GET /reseller/status     → reseller_status + reseller_approved_at
 *   GET /reseller/application → data form lengkap (hanya jika PENDING/REJECTED)
 *
 * Ref: PRD Bab 6.4, reseller_todo §1.2, types/reseller.ts
 */

"use client";

import { useState, useEffect } from "react";
import type { ResellerStatus } from "@/types/enums";
import type { ResellerApplication } from "@/types/reseller";

// ============================================================
// KONFIGURASI MOCK
// Ganti nilai ini untuk mensimulasikan setiap tampilan status:
//   "NOT_RESELLER" | "PENDING" | "APPROVED" | "REJECTED"
// ============================================================
const MOCK_RESELLER_STATUS: ResellerStatus = "PENDING";

const MOCK_APPROVED_AT = "2026-06-03T09:30:00Z";

const MOCK_APPLICATION: ResellerApplication = {
  id: "mock-app-001",
  user_id: "mock-user-001",
  applicant_type: "INDIVIDUAL",
  business_name: "Goldii Robotika Store",
  whatsapp_number: "081234567890",
  business_address: "Jl. Pendidikan STEM No. 42, RT 003/RW 005",
  province: "DKI Jakarta",
  city: "Jakarta Selatan",
  district: "Kebayoran Baru",
  sales_channels: ["MARKETPLACE", "SOCIAL_MEDIA"],
  store_url: "https://tokopedia.com/goldii-robotika",
  estimated_monthly_volume: "10_TO_50",
  reason:
    "Saya aktif di komunitas STEM dan sering membantu sekolah-sekolah di sekitar saya mendapatkan kit robotika.\n\nDengan harga reseller, saya bisa menawarkan harga yang lebih terjangkau dan memperluas jangkauan edukasi robotika.",
  document_url: null,
  status: "PENDING",
  rejection_reason: null,
  reviewed_by: null,
  reviewed_at: null,
  created_at: "2026-09-15T07:30:00Z",
  updated_at: "2026-09-15T07:30:00Z",
};

const MOCK_REJECTED_APPLICATION: ResellerApplication = {
  ...MOCK_APPLICATION,
  status: "REJECTED",
  rejection_reason:
    "Riwayat pembelian terlalu sedikit untuk memenuhi syarat minimum reseller.\n\nSilakan ajukan kembali setelah melakukan minimal 5 transaksi dalam 3 bulan terakhir.",
  reviewed_by: "admin-001",
  reviewed_at: "2026-09-18T10:00:00Z",
  updated_at: "2026-09-18T10:00:00Z",
};

// ============================================================
// RETURN TYPE
// ============================================================

export type ResellerStatusState =
  | { status: "NOT_RESELLER"; application: null; approvedAt: null }
  | { status: "PENDING"; application: ResellerApplication; approvedAt: null }
  | { status: "APPROVED"; application: null; approvedAt: string }
  | { status: "REJECTED"; application: ResellerApplication; approvedAt: null };

export interface UseResellerStatusReturn {
  data: ResellerStatusState | null;
  isLoading: boolean;
  error: Error | null;
  /** Paksa refetch — dipakai setelah aksi (misal: batal pengajuan di fase backend) */
  refetch: () => void;
}

// ============================================================
// FASE MOCK
// Hapus seluruh blok ini saat backend sudah tersedia.
// ============================================================
export function useResellerStatus(): UseResellerStatusReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ResellerStatusState | null>(null);

  function load() {
    setIsLoading(true);
    // Simulasi network delay
    const timer = setTimeout(() => {
      const resolved = resolveMock(MOCK_RESELLER_STATUS);
      setData(resolved);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, error: null, refetch: load };
}

function resolveMock(status: ResellerStatus): ResellerStatusState {
  switch (status) {
    case "NOT_RESELLER":
      return { status: "NOT_RESELLER", application: null, approvedAt: null };
    case "PENDING":
      return { status: "PENDING", application: MOCK_APPLICATION, approvedAt: null };
    case "APPROVED":
      return { status: "APPROVED", application: null, approvedAt: MOCK_APPROVED_AT };
    case "REJECTED":
      return {
        status: "REJECTED",
        application: MOCK_REJECTED_APPLICATION,
        approvedAt: null,
      };
  }
}

// ============================================================
// FASE BACKEND — uncomment saat API /reseller/status tersedia
// ============================================================
/*
import { useQuery } from "@tanstack/react-query";
import { resellerService } from "@/lib/api/services/reseller.service";

export function useResellerStatus(): UseResellerStatusReturn {
  const statusQuery = useQuery({
    queryKey: ["reseller", "status"],
    queryFn: () => resellerService.getResellerStatus(),
    staleTime: 1000 * 60 * 2, // 2 menit — status bisa berubah kapan saja
    retry: 1,
  });

  const resellerStatus = statusQuery.data?.data?.reseller_status;
  const needsApplication = resellerStatus === "PENDING" || resellerStatus === "REJECTED";

  const applicationQuery = useQuery({
    queryKey: ["reseller", "application"],
    queryFn: () => resellerService.getResellerApplication(),
    enabled: needsApplication,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const isLoading =
    statusQuery.isLoading || (needsApplication && applicationQuery.isLoading);
  const error = statusQuery.error ?? applicationQuery.error ?? null;

  function buildState(): ResellerStatusState | null {
    if (!statusQuery.data?.data) return null;
    const { reseller_status, reseller_approved_at } = statusQuery.data.data;

    switch (reseller_status) {
      case "NOT_RESELLER":
        return { status: "NOT_RESELLER", application: null, approvedAt: null };
      case "APPROVED":
        return {
          status: "APPROVED",
          application: null,
          approvedAt: reseller_approved_at ?? new Date().toISOString(),
        };
      case "PENDING":
        if (!applicationQuery.data?.data) return null;
        return {
          status: "PENDING",
          application: applicationQuery.data.data,
          approvedAt: null,
        };
      case "REJECTED":
        if (!applicationQuery.data?.data) return null;
        return {
          status: "REJECTED",
          application: applicationQuery.data.data,
          approvedAt: null,
        };
    }
  }

  return {
    data: buildState(),
    isLoading,
    error: error as Error | null,
    refetch: () => {
      statusQuery.refetch();
      if (needsApplication) applicationQuery.refetch();
    },
  };
}
*/
