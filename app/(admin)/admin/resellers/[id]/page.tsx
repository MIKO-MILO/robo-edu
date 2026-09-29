"use client";

import React, { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ResellerDetailHeader,
    ResellerInfoCard,
    ResellerApprovalCard,
    ResellerOrdersTab,
    getMockResellerDetail,
} from "@/components/admin/resellers";

// ---------------------------------------------------------------------------
// Inner component (needs useParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminResellerDetailContent() {
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    // TODO: Replace with real API call — GET /admin/resellers/:id
    const reseller = getMockResellerDetail(id);

    // Local optimistic UI state untuk status (diganti real mutation saat backend ready)
    const [status, setStatus] = useState(reseller?.reseller_status ?? "PENDING");

    if (!reseller) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                <div className="text-4xl font-heading font-bold">404</div>
                <p className="text-sm">Data pengajuan reseller tidak ditemukan.</p>
            </div>
        );
    }

    const handleApprove = () => {
        // TODO: call PATCH /admin/resellers/:id/approve
        setStatus("APPROVED");
    };

    const handleReject = () => {
        // TODO: call PATCH /admin/resellers/:id/reject + rejection_reason
        setStatus("REJECTED");
    };

    return (
        <div className="space-y-6">
            {/* Header + Action Buttons */}
            <ResellerDetailHeader
                id={reseller.id}
                name={reseller.name}
                email={reseller.email}
                phone={reseller.phone}
                resellerStatus={status as typeof reseller.reseller_status}
                resellerAppliedAt={reseller.reseller_applied_at}
                resellerApprovedAt={reseller.reseller_approved_at}
                isActive={reseller.is_active}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            {/* Main content: 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column — info + approval action */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Approval Card */}
                    <ResellerApprovalCard
                        resellerStatus={status as typeof reseller.reseller_status}
                        applicantName={reseller.name}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />

                    {/* Info & Timeline */}
                    <ResellerInfoCard
                        name={reseller.name}
                        email={reseller.email}
                        phone={reseller.phone}
                        createdAt={reseller.created_at}
                        lastLoginAt={null}
                        resellerAppliedAt={reseller.reseller_applied_at}
                        resellerApprovedAt={reseller.reseller_approved_at}
                        totalOrders={reseller.total_orders}
                        totalSpent={reseller.total_spent}
                        rejectionReason={reseller.rejection_reason}
                    />
                </div>

                {/* Right column — riwayat pesanan */}
                <div className="lg:col-span-2">
                    <ResellerOrdersTab orders={reseller.recent_orders} />
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main export (wrapped in Suspense for Next.js App Router)
// ---------------------------------------------------------------------------
export default function AdminResellerDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-40 rounded-xl" />
                        <Skeleton className="h-28 rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <Skeleton className="h-40 rounded-2xl" />
                            <Skeleton className="h-64 rounded-2xl" />
                        </div>
                        <div className="lg:col-span-2">
                            <Skeleton className="h-80 rounded-2xl" />
                        </div>
                    </div>
                </div>
            }
        >
            <AdminResellerDetailContent />
        </Suspense>
    );
}
