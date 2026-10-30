/**
 * use-reseller-status.ts
 * ----------------------
 * Hook untuk mengambil status membership dan riwayat pembelian
 * customer yang sedang login dari GET /api/membership/me.
 *
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */

"use client";

import { useState, useEffect } from "react";
import type { MembershipStatusData } from "@/types";
import { membershipService } from "@/lib/api/services/membership.service";

// ============================================================
// RETURN TYPE
// ============================================================

export interface UseMembershipStatusReturn {
  data: MembershipStatusData | null;
  isLoading: boolean;
  error: Error | null;
  /** Paksa refetch — dipakai untuk tombol "Coba Lagi" di error state. */
  refetch: () => void;
}

// ============================================================
// HOOK
// ============================================================

export function useMembershipStatus(): UseMembershipStatusReturn {
  const [data, setData] = useState<MembershipStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await membershipService.getMembershipStatus();
      if (!res.success) throw new Error("Gagal memuat data membership.");
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Terjadi kesalahan."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, isLoading, error, refetch: load };
}
