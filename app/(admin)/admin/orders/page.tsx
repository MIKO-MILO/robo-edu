"use client";

import React, { useMemo, Suspense, useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  OrderStatsGrid,
  OrderFilters,
  OrderTable,
} from "@/components/admin/orders";
import type { AdminOrderRow, OrderStats } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";
import { useAdminOrders } from "@/hooks/admin/orders/use-admin-orders";

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "ALL";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  // ── Fetch dari API via TanStack Query ──────────────────────────────────
  const { data: result, isLoading, isError } = useAdminOrders({
    search: searchQuery || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const orders: AdminOrderRow[] = useMemo(
    () =>
      (result?.data ?? []).map((o) => ({
        ...o,
        customer_id: (o as { customer_id?: string }).customer_id,
        voucher_code: (o as { voucher_code?: string | null }).voucher_code ?? null,
        status: o.status as OrderStatus,
        payment_status: o.payment_status as PaymentStatus,
      })),
    [result],
  );

  const meta = result?.meta;

  // ── KPI stats global tanpa filter ─────────────────────────────────────
  const [allStats, setAllStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    paid: 0,
    processing_shipped: 0,
    completed: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [all, pending, paid, procShip, done] = await Promise.all([
          fetch("/api/admin/orders?limit=1").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=PENDING").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=PAID").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=PROCESSING").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=COMPLETED").then((r) => r.json()),
        ]);
        setAllStats({
          total: all.meta?.total ?? 0,
          pending: pending.meta?.total ?? 0,
          paid: paid.meta?.total ?? 0,
          processing_shipped: procShip.meta?.total ?? 0,
          completed: done.meta?.total ?? 0,
        });
      } catch {
        // stats gagal tidak critical
      }
    };
    loadStats();
  }, []);

  // ── URL param helpers ─────────────────────────────────────────────────
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    // Reset ke halaman 1 saat filter berubah
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateParams({ search: e.target.value || null });
  };

  const handleStatusChange = (status: string) => {
    updateParams({ status: status !== "ALL" ? status : null });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            {/* <ShoppingCart className="size-6 text-primary" /> */}
            Manajemen Pesanan
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola transaksi, update status pesanan, dan pantau pengiriman
            RoboEdu.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <OrderStatsGrid stats={allStats} />

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 font-medium">
          Gagal memuat data pesanan. Silakan refresh halaman.
        </div>
      )}

      {/* Toolbar: search + filter */}
      <OrderFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Orders Table */}
      <OrderTable data={orders} isLoading={isLoading} />

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.total_pages}
          onPageChange={handlePageChange}
        />
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
