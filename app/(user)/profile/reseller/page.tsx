"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ResellerStatusNotReseller,
  ResellerStatusPending,
  ResellerStatusApproved,
  ResellerStatusRejected,
} from "@/components/user/profile/reseller";
import { useResellerStatus } from "@/hooks/user/reseller";

/**
 * /profile/reseller — Halaman Status Pengajuan Reseller
 * ------------------------------------------------------
 * Orchestrator: mengambil data via useResellerStatus() dan
 * merender tampilan yang sesuai berdasarkan reseller_status.
 *
 * Render logic:
 *   NOT_RESELLER → <ResellerStatusNotReseller />
 *   PENDING      → <ResellerStatusPending application={...} />
 *   APPROVED     → <ResellerStatusApproved approvedAt={...} />
 *   REJECTED     → <ResellerStatusRejected application={...} />
 *
 * PRD Bab 6.4–6.6 | FR-022 | US-012
 *
 * Akses: wajib login — middleware akan redirect ke /login?redirect=/profile/reseller
 * (diimplementasikan saat auth tersedia, tidak di-handle di sini).
 */
export default function ProfileResellerPage() {
  const { data, isLoading, error, refetch } = useResellerStatus();

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return <ResellerPageSkeleton />;
  }

  // ── Error state ────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="rounded-3xl border-2 border-border bg-card p-8 neo-shadow flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-border bg-danger-bg">
          <AlertCircle className="size-6 text-danger" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Gagal memuat status pengajuan
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Terjadi kesalahan saat mengambil data. Coba lagi beberapa saat.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          neo
          onClick={refetch}
          className="font-heading font-bold rounded-xl gap-2"
        >
          <RefreshCcw className="size-3.5" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Render per status ──────────────────────────────────────
  switch (data.status) {
    case "NOT_RESELLER":
      return <ResellerStatusNotReseller />;

    case "PENDING":
      return <ResellerStatusPending application={data.application} />;

    case "APPROVED":
      return <ResellerStatusApproved approvedAt={data.approvedAt} />;

    case "REJECTED":
      return <ResellerStatusRejected application={data.application} />;
  }
}

// ── Skeleton ────────────────────────────────────────────────
function ResellerPageSkeleton() {
  return (
    <div className="space-y-5">
      {/* Card header skeleton */}
      <div className="rounded-3xl border-2 border-border bg-card p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      {/* Detail card skeleton */}
      <div className="rounded-2xl border-2 border-border overflow-hidden">
        <Skeleton className="h-10 w-full rounded-none" />
        <div className="p-5 grid grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
