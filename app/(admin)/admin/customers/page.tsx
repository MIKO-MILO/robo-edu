"use client";

import React, { useMemo, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomerStatsGrid,
  CustomerFilters,
  CustomerTable,
  getCustomerStats,
} from "@/components/admin/customers";
import type { AdminCustomerRow } from "@/components/admin/customers";
import { useCustomers } from "@/hooks/admin/customers";
import type { AdminCustomersQueryParams } from "@/lib/api/services/user.service";

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminCustomersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") || "";
  const resellerFilter = searchParams.get("reseller") || "ALL";
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

  const handleResellerFilterChange = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "ALL") {
      params.delete("reseller");
    } else {
      params.set("reseller", key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const apiParams = useMemo(() => {
    const params: AdminCustomersQueryParams = {
      page: 1,
      limit: 50,
    };
    if (searchQuery) params.search = searchQuery;
    if (resellerFilter !== "ALL") {
      if (resellerFilter === "CUSTOMER") {
        params.reseller_status = "NOT_RESELLER";
      } else {
        params.reseller_status = resellerFilter;
      }
    }
    if (statusFilter !== "ALL") {
      params.is_active = statusFilter === "ACTIVE";
    }
    return params;
  }, [searchQuery, resellerFilter, statusFilter]);

  const { data, isLoading, isError, error, refetch } = useCustomers(apiParams);

  const apiCustomers = useMemo<AdminCustomerRow[]>(
    () => data?.data ?? [],
    [data],
  );

  const filteredCustomers = useMemo(() => {
    return apiCustomers.filter((customer: AdminCustomerRow) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesEmail = customer.email.toLowerCase().includes(query);
        const matchesPhone =
          customer.phone?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      if (resellerFilter !== "ALL") {
        if (resellerFilter === "CUSTOMER") {
          if (customer.reseller_status !== "NOT_RESELLER") return false;
        } else if (customer.reseller_status !== resellerFilter) {
          return false;
        }
      }

      if (statusFilter === "ACTIVE" && !customer.is_active) return false;
      if (statusFilter === "INACTIVE" && customer.is_active) return false;

      return true;
    });
  }, [apiCustomers, searchQuery, resellerFilter, statusFilter]);

  const stats = useMemo(() => getCustomerStats(apiCustomers), [apiCustomers]);

  const totalCount = data?.meta?.total_count ?? apiCustomers.length;

  const handleExport = () => {
    alert("Data pelanggan berhasil diunduh sebagai file CSV.");
  };

  return (
    <div className="space-y-6">
      {isError && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-heading font-bold text-sm">
              Gagal memuat data pelanggan
            </p>
            <p className="text-xs opacity-90">
              {error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat menghubungi server."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="shrink-0 rounded-xl border-2 border-destructive/40 text-destructive hover:bg-destructive/20 hover:text-destructive"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="size-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Manajemen Pelanggan
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Pantau seluruh data pelanggan terdaftar, status kemitraan reseller,
            dan akumulasi nilai belanja (LTV).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 rounded-xl border-2 border-border font-heading font-bold text-xs"
          >
            <Download className="size-3.5" />
            <span>Ekspor CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <CustomerStatsGrid
        stats={stats}
        onFilterReseller={handleResellerFilterChange}
      />

      {/* Filters Toolbar */}
      <CustomerFilters
        searchQuery={searchQuery}
        resellerFilter={resellerFilter}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onResellerFilterChange={handleResellerFilterChange}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {/* Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-body">
          <span>
            Menampilkan{" "}
            <strong className="text-foreground font-semibold">
              {filteredCustomers.length}
            </strong>{" "}
            dari {totalCount} pelanggan
          </span>
        </div>

        <CustomerTable data={filteredCustomers} isLoading={isLoading} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export (wrapped in Suspense for Next.js App Router useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
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
      <AdminCustomersContent />
    </Suspense>
  );
}
