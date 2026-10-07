"use client";

import React, { useCallback, useEffect, useMemo, useState, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import {
  OrderStatsGrid,
  OrderFilters,
  OrderTable,
} from "@/components/admin/orders";
import type { AdminOrderRow, OrderStats } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------
async function fetchAdminOrders(params: {
  search: string;
  status: string;
  page: number;
}): Promise<{ data: AdminOrderRow[]; meta: { total: number; total_pages: number } }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  qs.set("page", String(params.page));
  qs.set("limit", "20");

  const res = await fetch(`/api/admin/orders?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data pesanan");
  return res.json();
}

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));

  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch on param change ──────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAdminOrders({ search: searchQuery, status: statusFilter, page });
      setOrders(result.data);
      setMeta(result.meta);
    } catch {
      setError("Gagal memuat data pesanan. Coba refresh halaman.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── URL param helpers ─────────────────────────────────────────────────
  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val) params.set(key, val);
      else params.delete(key);
    }
    // Reset to page 1 on filter change
    if (!("page" in updates)) params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pushParams({ search: e.target.value || null });
  };

  const handleStatusChange = (status: string) => {
    pushParams({ status: status !== "ALL" ? status : null });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  // ── KPI Stats (computed from full count per status via separate fetch) ─
  // Untuk simplisitas, hitung dari data yang ada di halaman saat ini +
  // total dari meta. Stats yang akurat butuh endpoint terpisah, tapi
  // ini sudah cukup untuk gambaran umum.
  const [allStats, setAllStats] = useState<OrderStats>({
    total: 0, pending: 0, processing_shipped: 0, completed: 0,
  });

  useEffect(() => {
    // Fetch stats tanpa filter untuk KPI cards
    const loadStats = async () => {
      try {
        const [all, pending, procShip, done] = await Promise.all([
          fetch("/api/admin/orders?limit=1").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=PENDING").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=PROCESSING").then((r) => r.json()),
          fetch("/api/admin/orders?limit=1&status=COMPLETED").then((r) => r.json()),
        ]);
        setAllStats({
          total: all.meta?.total ?? 0,
          pending: pending.meta?.total ?? 0,
          processing_shipped: procShip.meta?.total ?? 0,
          completed: done.meta?.total ?? 0,
        });
      } catch {
        // stats gagal tidak critical
      }
    };
    loadStats();
  }, []);

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
      <OrderStatsGrid stats={allStats} />

      {/* Toolbar: search + filter */}
      <OrderFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Error */}
      {error && (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive font-body">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <OrderTable data={orders} isLoading={isLoading} />

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm font-body text-muted-foreground">
          <span>
            Halaman {page} dari {meta.total_pages} &bull; {meta.total} pesanan
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-heading font-bold"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              disabled={page >= meta.total_pages}
              onClick={() => handlePageChange(page + 1)}
              className="px-3 py-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-heading font-bold"
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
