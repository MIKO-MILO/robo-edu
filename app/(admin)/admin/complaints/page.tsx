"use client";

import React, { useEffect, useState, useCallback, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquareWarning, AlertCircle } from "lucide-react";
import {
  ComplaintStatsGrid,
  ComplaintFilters,
  ComplaintTable,
} from "@/components/admin/complaints";
import type { AdminComplaintRow, ComplaintStats } from "@/components/admin/complaints";
import { complaintService } from "@/lib/api/services/complaint.service";

// ---------------------------------------------------------------------------
// Status normalizer: backend returns lowercase, FE enum is uppercase
// ---------------------------------------------------------------------------
function normalizeStatus(raw: string): AdminComplaintRow["status"] {
  const map: Record<string, AdminComplaintRow["status"]> = {
    open:      "OPEN",
    in_review: "IN_REVIEW",
    resolved:  "RESOLVED",
    closed:    "REJECTED", // backend "closed" maps to FE "REJECTED" label
  };
  return map[raw.toLowerCase()] ?? ("OPEN" as AdminComplaintRow["status"]);
}

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
  const currentPage = Number(searchParams.get("page") || "1");

  // ── Data state ────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<AdminComplaintRow[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    in_review: 0,
    resolved: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert FE uppercase status to lowercase for the backend
      const statusParam =
        statusFilter !== "ALL" ? statusFilter.toLowerCase() : undefined;

      const res = await complaintService.getAdminComplaints({
        search: searchQuery || undefined,
        status: statusParam,
        page: currentPage,
        limit: 20,
      });

      const mapped: AdminComplaintRow[] = res.data.map((item) => ({
        id: item.id,
        subject: item.subject,
        customer_name: item.customer.name,
        customer_email: item.customer.email,
        customer_phone: null, // not included in list endpoint
        product_name: item.order_item.product_name,
        order_number: item.order_item.id, // order_number is only in detail; use order_item.id as fallback
        status: normalizeStatus(item.status),
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setRows(mapped);
      setTotalCount(res.meta.total_count);
      setTotalPages(res.meta.total_pages);

      // Derive KPI stats from the current page data.
      // For accurate totals across all pages we would need a separate stats endpoint;
      // for now we derive from the current full count and reflect page-level breakdown.
      const pageOpen     = mapped.filter((r) => r.status === "OPEN").length;
      const pageInReview = mapped.filter((r) => r.status === "IN_REVIEW").length;
      const pageResolved = mapped.filter((r) => r.status === "RESOLVED").length;

      setStats({
        total:     res.meta.total_count,
        open:      pageOpen,
        in_review: pageInReview,
        resolved:  pageResolved,
      });
    } catch (err) {
      console.error("Failed to load complaints:", err);
      setError("Gagal memuat daftar klaim. Silakan coba lagi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ── URL param helpers ─────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("search", e.target.value);
    } else {
      params.delete("search");
    }
    params.delete("page"); // reset to page 1 on new search
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
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pt-1 pb-20 md:pb-24 max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <MessageSquareWarning className="size-6 text-primary" />
            Manajemen Klaim &amp; Garansi
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

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchComplaints}
            className="ml-auto underline underline-offset-2 hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Main Table */}
      {!loading && !error && (
        <ComplaintTable
          data={rows}
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
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
