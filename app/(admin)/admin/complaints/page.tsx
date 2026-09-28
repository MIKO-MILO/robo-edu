"use client";

import React, { useMemo, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareWarning } from "lucide-react";
import {
  ComplaintStatsGrid,
  ComplaintFilters,
  ComplaintTable,
  MOCK_ADMIN_COMPLAINTS,
  getComplaintStats,
} from "@/components/admin/complaints";
import type { ComplaintStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminComplaintsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("search", e.target.value);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const filteredComplaints = useMemo(() => {
    return MOCK_ADMIN_COMPLAINTS.filter((complaint) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        complaint.subject.toLowerCase().includes(q) ||
        complaint.customer_name.toLowerCase().includes(q) ||
        complaint.product_name.toLowerCase().includes(q) ||
        complaint.order_number.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || complaint.status === (statusFilter as ComplaintStatus);

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => getComplaintStats(), []);

  return (
    <div className="space-y-6 pt-1 pb-20 md:pb-24 max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <MessageSquareWarning className="size-6 text-primary" />
            Manajemen Klaim & Garansi
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Tinjau pengajuan klaim, ubah status, dan catat hasil tindak lanjut manual.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <ComplaintStatsGrid stats={stats} />

      {/* Search + Filter Toolbar */}
      <ComplaintFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Main Table */}
      <ComplaintTable data={filteredComplaints} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export with Suspense boundary (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminComplaintsContent />
    </Suspense>
  );
}
