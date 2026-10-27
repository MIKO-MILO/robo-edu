/**
 * use-reseller-status.ts
 * ----------------------
 * Hook untuk mengambil status membership dan riwayat pembelian
 * customer yang sedang login.
 *
 * FASE SAAT INI: Frontend-only — fetch ke mock API route.
 *
 * TRANSISI KE BACKEND (saat GET /membership/me tersedia):
 *   1. Ganti blok fetch di fungsi load() dengan:
 *        const res = await membershipService.getMembershipStatus();
 *        setData(res.data);
 *   2. Hapus app/api/mock-membership-me/route.ts.
 *   3. Tidak ada perubahan yang diperlukan di komponen atau page.tsx.
 *
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */

"use client";

import { useState, useEffect } from "react";
import type { MembershipStatusData } from "@/types";

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
      // TODO(backend): Ganti dengan membershipService.getMembershipStatus()
      const res = await fetch("/api/mock-membership-me");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: MembershipStatusData = await res.json();
      setData(json);
    } catch (e) {
      setError(e as Error);
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
