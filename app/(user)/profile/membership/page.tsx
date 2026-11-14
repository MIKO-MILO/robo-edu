"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MembershipNotMember,
  MembershipMemberActive,
} from "@/components/user/profile/reseller";
import { useMembershipStatus } from "@/hooks/user/reseller";

/**
 * /profile/reseller — Halaman Status & Riwayat Membership
 * --------------------------------------------------------
 * Orchestrator: mengambil data via useMembershipStatus() dan
 * merender tampilan yang sesuai berdasarkan membership_status.
 *
 *   NOT_MEMBER → <MembershipNotMember />
 *   MEMBER     → <MembershipMemberActive data={...} />
 *
 * Halaman ini READ-ONLY sepenuhnya. PRD Bab 6.8.
 * PRD Bab 6.8 | FR-023 | US-011, US-012
 */
export default function ProfileResellerPage() {
  const { data, isLoading, error, refetch } = useMembershipStatus();

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return <MembershipPageSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="rounded-3xl bg-white border border-[#C7C4BB] shadow-sm p-8 flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-bg">
          <AlertCircle className="size-6 text-danger" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Gagal memuat data membership
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Terjadi kesalahan saat mengambil data. Coba lagi beberapa saat.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="font-heading font-bold rounded-xl gap-2 border-[#C7C4BB] shadow-none"
        >
          <RefreshCcw className="size-3.5" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Render per status ──────────────────────────────────────────
  switch (data.membership_status) {
    case "NOT_MEMBER":
      return <MembershipNotMember />;

    case "MEMBER":
      return (
        <MembershipMemberActive
          data={data as typeof data & { membership_status: "MEMBER" }}
        />
      );
  }
}

// ── Skeleton ────────────────────────────────────────────────────
function MembershipPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero skeleton */}
      <div className="rounded-3xl bg-primary/20 h-52 animate-pulse" />
      {/* Grid skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-[#C7C4BB] h-20 animate-pulse" />
        ))}
      </div>
      {/* Benefit skeleton */}
      <div className="rounded-2xl bg-white border border-[#C7C4BB] h-28 animate-pulse" />
      {/* Table skeleton */}
      <div className="rounded-2xl bg-white border border-[#C7C4BB] overflow-hidden">
        <div className="h-12 bg-muted/40 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-[#C7C4BB]/60 animate-pulse bg-muted/10" />
        ))}
      </div>
    </div>
  );
}
