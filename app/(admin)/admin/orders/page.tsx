"use client";

import React, { useMemo, Suspense, useTransition, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import {
  OrderStatsGrid,
  OrderFilters,
  OrderTable,
} from "@/components/admin/orders";
import type { AdminOrderRow, OrderStats } from "@/components/admin/orders";
import type { OrderStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface OrderListState {
  data: AdminOrderRow[];
  meta: OrderListMeta;
  isLoading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function fetchAdminOrders(params: {
  page: number;
  limit: number;
  q: string;
  status: string;
}): Promise<{ data: AdminOrderRow[]; meta: OrderListMeta }> {
  const qs = new URLSearchParams({
    page:   String(params.page),
    limit:  String(params.limit),
    q:      params.q,
    status: params.status,
  });

  const res = await fetch(`/api/admin/orders?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  const json = await res.json();
  return { data: json.data ?? [], meta: json.meta };
}

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------

function AdminOrdersContent() {
  const router        = useRouter();
  const pathname      = usePathname();
  const searchParams  = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery  = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "ALL";
  const currentPage  = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const LIMIT        = 20;

  // ── State ────────────────────────────────────────────────────────────
  const [state, setState] = useState<OrderListState>({
    data:      [],
    meta:      { page: 1, limit: LIMIT, total: 0, totalPages: 0 },
    isLoading: true,
    error:     null,
  });

  // ── Fetch ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const result = await fetchAdminOrders({
        page:   currentPage,
        limit:  LIMIT,
        q:      searchQuery,
        status: statusFilter,
      });
      setState({ data: result.data, meta: result.meta, isLoading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Gagal memuat pesanan.",
      }));
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // ── URL param helpers ────────────────────────────────────────────────
  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pushParams({ search: e.target.value || null, page: null });
  };

  const handleStatusChange = (status: string) => {
    pushParams({ status: status !== "ALL" ? status : null, page: null });
  };

  const handlePageChange = (page: number) => {
    pushParams({ page: page > 1 ? String(page) : null });
  };

  // ── Derived stats (calculated from meta + current filter context) ────
  // For accurate cross-status totals we make a separate stats fetch once.
  const [stats, setStats] = useState<OrderStats>({
    total:               0,
    pending:             0,
    processing_shipped:  0,
    completed:           0,
  });

  useEffect(() => {
    // Fetch stats for each status bucket in parallel (no search, no status filter)
    Promise.allSettled([
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "ALL" }),
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "PENDING" }),
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "PROCESSING" }),
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "SHIPPED" }),
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "DELIVERED" }),
      fetchAdminOrders({ page: 1, limit: 1, q: "", status: "COMPLETED" }),
    ]).then(([all, pending, processing, shipped, delivered, completed]) => {
      const total              = all.status        === "fulfilled" ? all.value.meta.total               : 0;
      const pendingCount       = pending.status    === "fulfilled" ? pending.value.meta.total            : 0;
      const processingCount    = processing.status === "fulfilled" ? processing.value.meta.total         : 0;
      const shippedCount       = shipped.status    === "fulfilled" ? shipped.value.meta.total            : 0;
      const deliveredCount     = delivered.status  === "fulfilled" ? delivered.value.meta.total          : 0;
      const completedCount     = completed.status  === "fulfilled" ? completed.value.meta.total          : 0;

      setStats({
        total,
        pending:             pendingCount,
        processing_shipped:  processingCount + shippedCount,
        completed:           deliveredCount + completedCount,
      });
    });
  }, []); // only on mount — stats are a general overview

  // ── Pagination component ─────────────────────────────────────────────
  const { totalPages } = state.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="size-6 text-primary" />
            Manajemen Pesanan
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola transaksi, update status pesanan, dan pantau pengiriman RoboEdu.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <OrderStatsGrid stats={stats} />

      {/* Toolbar: search + filter */}
      <OrderFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Error banner */}
      {state.error && (
        <div className="rounded-2xl border-2 border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger font-body">
          Gagal memuat data: {state.error}
        </div>
      )}

      {/* Orders Table */}
      <OrderTable data={state.data} isLoading={state.isLoading} />

      {/* Pagination */}
      {!state.isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-body px-1">
          <span>
            Halaman {state.meta.page} dari {totalPages} &bull; {state.meta.total} pesanan
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs transition-colors"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-heading font-bold text-xs transition-colors"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export with Suspense boundary (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
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
      <AdminOrdersContent />
    </Suspense>
  );
}
