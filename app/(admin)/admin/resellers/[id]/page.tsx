"use client";

import React, { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/admin/use-toast";
import { Toaster } from "@/components/admin/toast";
import {
  ResellerDetailHeader,
  ResellerStepper,
  ResellerApprovalCard,
  ResellerInfoCard,
  ResellerRejectModal,
  getMockResellerDetail,
} from "@/components/admin/resellers";
import type { RejectReason } from "@/components/admin/resellers";
import type { ResellerStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Inner component (needs useParams must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminResellerDetailContent() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  // TODO: Replace with real API call GET /admin/resellers/:id
  const reseller = getMockResellerDetail(id);

  // Optimistic UI state (replaced by real mutation saat backend Phase 2 ready)
  const [status, setStatus] = useState<ResellerStatus>(
    reseller?.reseller_status ?? "PENDING"
  );
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // 404 fallback
  if (!reseller) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="text-4xl font-heading font-bold text-foreground border-2 border-border neo-shadow px-6 py-3 bg-card">
          404
        </div>
        <p className="text-sm font-body text-muted-foreground">
          Data pengajuan reseller tidak ditemukan.
        </p>
      </div>
    );
  }

  // Handlers
  const handleApprove = () => {
    // TODO: call PATCH /admin/resellers/:id/approve writes to audit_log (FR-017)
    setStatus("APPROVED");
    toast.success(
      "Reseller Disetujui!",
      `Hak harga reseller_price untuk ${reseller.name} (${id.toUpperCase()}) telah aktif.`
    );
  };

  const handleRejectConfirm = (_reason: RejectReason, reasonLabel: string) => {
    // TODO: call PATCH /admin/resellers/:id/reject + rejection_reason (FR-010)
    setStatus("REJECTED");
    toast.error(
      "Pengajuan Ditolak",
      `Pengajuan dari ${reseller.name} ditolak: ${reasonLabel}. Notifikasi email terkirim.`
    );
  };

  return (
    <>
      <Toaster />
      <ResellerRejectModal
        open={rejectModalOpen}
        applicantName={reseller.name}
        applicantId={id.toUpperCase()}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />

      <div className="space-y-6">
        <ResellerDetailHeader
          id={reseller.id}
          name={reseller.name}
          email={reseller.email}
          phone={reseller.phone}
          resellerStatus={status}
          resellerAppliedAt={reseller.reseller_applied_at}
          resellerApprovedAt={reseller.reseller_approved_at}
          isActive={reseller.is_active}
          onApprove={handleApprove}
          onReject={() => setRejectModalOpen(true)}
        />

        <ResellerStepper resellerStatus={status} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <ResellerInfoCard
              name={reseller.name}
              email={reseller.email}
              phone={reseller.phone}
              createdAt={reseller.created_at}
              lastLoginAt={null}
              resellerAppliedAt={reseller.reseller_applied_at}
              resellerApprovedAt={reseller.reseller_approved_at}
              rejectionReason={reseller.rejection_reason}
              affiliationName={reseller.affiliation_name}
              ktpNik={reseller.ktp_nik}
              npwpNumber={reseller.npwp_number}
              primaryAddress={reseller.primary_address}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ResellerApprovalCard
              resellerStatus={status}
              applicantName={reseller.name}
              onApprove={handleApprove}
              onReject={() => setRejectModalOpen(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function AdminResellerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-56 rounded-2xl border border-border" />
          <Skeleton className="h-9 w-36 rounded-2xl" />
        </div>
        <Skeleton className="h-32 rounded-2xl border border-border" />
      </div>
      <Skeleton className="h-16 rounded-2xl border border-border" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="h-96 rounded-2xl border border-border" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-80 rounded-2xl border border-border" />
        </div>
      </div>
    </div>
  );
}

export default function AdminResellerDetailPage() {
  return (
    <Suspense fallback={<AdminResellerDetailSkeleton />}>
      <AdminResellerDetailContent />
    </Suspense>
  );
}