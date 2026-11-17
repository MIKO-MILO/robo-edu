"use client";

import React, { useState, useEffect, Suspense } from "react";
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
} from "@/components/admin/membership";
import type { RejectReason } from "@/components/admin/membership";
import {
  fetchAdminMemberDetail,
  patchMemberStatus,
  type AdminMemberDetail,
} from "@/src/lib/api/admin-membership";
import type { MembershipPurchase } from "@/components/admin/membership/membership-purchases-card";
import { MembershipPurchasesCard } from "@/components/admin/membership/membership-purchases-card";

// Local type alias kept for existing UI component prop interface
type MemberStatusCompat = "NOT_RESELLER" | "PENDING" | "APPROVED" | "REJECTED";

/** Map membership_status → MemberStatusCompat used by existing UI components */
function toMemberStatusCompat(membershipStatus: string): MemberStatusCompat {
  if (membershipStatus === "MEMBER") return "APPROVED";
  return "NOT_RESELLER";
}

// ---------------------------------------------------------------------------
// Inner component
// ---------------------------------------------------------------------------
function AdminMemberDetailContent() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [detail, setDetail] = useState<AdminMemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimistic status state
  const [memberStatus, setMemberStatus] = useState<MemberStatusCompat>("NOT_RESELLER");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    setError(null);
    fetchAdminMemberDetail(id)
      .then((res) => {
        setDetail(res.data);
        setMemberStatus(toMemberStatusCompat(res.data.membership_status));
      })
      .catch((err: Error) => {
        if (err.message.includes("404") || err.message.toLowerCase().includes("tidak ditemukan")) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <AdminMemberDetailSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Not found / error
  // ---------------------------------------------------------------------------
  if (notFound || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="text-4xl font-heading font-bold text-foreground border-2 border-border neo-shadow px-6 py-3 bg-card">
          404
        </div>
        <p className="text-sm font-body text-muted-foreground">
          Data member tidak ditemukan.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-sm font-body text-danger">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Approve handler
  // ---------------------------------------------------------------------------
  const handleApprove = async () => {
    if (isActioning) return;
    setIsActioning(true);
    try {
      await patchMemberStatus(id, "approve");
      setMemberStatus("APPROVED");
      toast.success(
        "Member Dikonfirmasi!",
        `Status keanggotaan ${detail.name} telah dikonfirmasi sebagai MEMBER aktif.`,
      );
    } catch (err) {
      toast.error(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setIsActioning(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Reject handler
  // ---------------------------------------------------------------------------
  const handleRejectConfirm = async (_reason: RejectReason, reasonLabel: string) => {
    if (isActioning) return;
    setIsActioning(true);
    try {
      await patchMemberStatus(id, "reject", reasonLabel);
      setMemberStatus("NOT_RESELLER");
      toast.error(
        "Keanggotaan Dicabut",
        `Keanggotaan ${detail.name} telah dicabut: ${reasonLabel}.`,
      );
    } catch (err) {
      toast.error(
        "Gagal",
        err instanceof Error ? err.message : "Terjadi kesalahan.",
      );
    } finally {
      setIsActioning(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Map purchases for the purchases card
  // ---------------------------------------------------------------------------
  const purchases: MembershipPurchase[] = detail.membership_purchases.map((p) => ({
    id: p.id,
    purchase_number: p.purchase_number,
    plan_name_snapshot: p.plan_name_snapshot,
    price_snapshot: p.price_snapshot,
    duration_months_snapshot: p.duration_months_snapshot,
    starts_at: p.starts_at,
    ends_at: p.ends_at,
    paid_at: p.paid_at,
    status: p.status,
    created_at: p.created_at,
  }));

  return (
    <>
      <Toaster />
      <ResellerRejectModal
        open={rejectModalOpen}
        applicantName={detail.name}
        applicantId={id.toUpperCase()}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />

      <div className="space-y-6">
        <ResellerDetailHeader
          id={detail.id}
          name={detail.name}
          email={detail.email}
          phone={detail.phone}
          memberStatus={memberStatus}
          memberAppliedAt={detail.created_at}
          memberApprovedAt={
            memberStatus === "APPROVED" ? detail.membership_expires_at : null
          }
          isActive={detail.is_active}
          onApprove={handleApprove}
          onReject={() => setRejectModalOpen(true)}
        />

        <ResellerStepper memberStatus={memberStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <ResellerInfoCard
              name={detail.name}
              email={detail.email}
              phone={detail.phone}
              createdAt={detail.created_at}
              lastLoginAt={detail.last_login_at}
              memberAppliedAt={detail.created_at}
              memberApprovedAt={
                memberStatus === "APPROVED" ? detail.membership_expires_at : null
              }
              rejectionReason={null}
              affiliationName={null}
              ktpNik={detail.tax_id}
              npwpNumber={null}
              primaryAddress={detail.residential_address}
            />

            {/* Membership purchase history */}
            <MembershipPurchasesCard purchases={purchases} />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ResellerApprovalCard
              memberStatus={memberStatus}
              applicantName={detail.name}
              onApprove={handleApprove}
              onReject={() => setRejectModalOpen(true)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function AdminMemberDetailSkeleton() {
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

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export default function AdminMemberDetailPage() {
  return (
    <Suspense fallback={<AdminMemberDetailSkeleton />}>
      <AdminMemberDetailContent />
    </Suspense>
  );
}
