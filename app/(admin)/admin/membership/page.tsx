"use client";

import React, { useMemo, useState, useEffect, useCallback, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  ResellerStatsGrid,
  ResellerFilters,
  ResellerTable,
} from "@/components/admin/membership";
import type { AdminMemberRow, AdminMemberStats } from "@/components/admin/membership";
import {
  fetchAdminMembers,
  type AdminMembersMeta,
} from "@/src/lib/api/admin-membership";

const ITEMS_PER_PAGE = 20;

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminMembersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(Number(searchParams.get("page") || "1"), 1);

  // Data state
  const [members, setMembers] = useState<AdminMemberRow[]>([]);
  const [meta, setMeta] = useState<AdminMembersMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminMembers({
        search: searchQuery || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setMembers(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data member.");
      setMembers([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // URL param handlers
  // ---------------------------------------------------------------------------
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // ---------------------------------------------------------------------------
  // KPI stats derived from loaded page data
  // ---------------------------------------------------------------------------
  const stats = useMemo<AdminMemberStats>(() => {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return {
      total_members: meta?.total_count ?? 0,
      active_members: members.filter(
        (m) =>
          m.is_active &&
          m.membership_status === "MEMBER" &&
          (!m.membership_expires_at || new Date(m.membership_expires_at).getTime() > now),
      ).length,
      expiring_soon: members.filter((m) => {
        if (!m.membership_expires_at) return false;
        const exp = new Date(m.membership_expires_at).getTime();
        return exp > now && exp - now <= thirtyDays;
      }).length,
      expired_members: members.filter(
        (m) =>
          m.membership_expires_at &&
          new Date(m.membership_expires_at).getTime() <= now,
      ).length,
    };
  }, [members, meta]);

  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Manajemen Member
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Tinjau dan kelola daftar member aktif — pantau masa aktif keanggotaan dan riwayat pembelian.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <ResellerStatsGrid stats={stats} totalCount={totalCount} />

      {/* Filters Toolbar */}
      <ResellerFilters
        searchQuery={searchQuery}
        statusFilter="ALL"
        onSearchChange={handleSearchChange}
        onStatusFilterChange={() => {}}
        hideStatusFilter
      />

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-danger bg-danger-bg p-4 text-sm font-body text-danger">
          {error}
          <button
            type="button"
            onClick={fetchData}
            className="ml-3 underline font-semibold hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-body">
          <span>
            {isLoading ? (
              "Memuat data…"
            ) : (
              <>
                Menampilkan{" "}
                <strong className="text-foreground font-semibold">
                  {members.length}
                </strong>{" "}
                dari {totalCount} member
                {searchQuery && (
                  <span className="ml-1 italic">
                    untuk &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        <ResellerTable data={members} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export (wrapped in Suspense for Next.js App Router useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminMembersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <AdminMembersContent />
    </Suspense>
  );
}
