"use client";

import React, { useMemo, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomerStatsGrid,
  CustomerFilters,
  CustomerTable,
  MOCK_ADMIN_CUSTOMERS,
  getCustomerStats,
} from "@/components/admin/customers";
import type { AdminCustomerRow } from "@/components/admin/customers";

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

  // Filter pelanggan berdasarkan search & filter
  const filteredCustomers = useMemo(() => {
    return MOCK_ADMIN_CUSTOMERS.filter((customer: AdminCustomerRow) => {
      // 1. Search (Nama, Email, No Telepon)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(query);
        const matchesEmail = customer.email.toLowerCase().includes(query);
        const matchesPhone = customer.phone?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // 2. Reseller Status Filter
      if (resellerFilter !== "ALL") {
        if (resellerFilter === "CUSTOMER") {
          if (customer.reseller_status !== "NOT_RESELLER") return false;
        } else if (customer.reseller_status !== resellerFilter) {
          return false;
        }
      }

      // 3. Account Active Status Filter
      if (statusFilter === "ACTIVE" && !customer.is_active) return false;
      if (statusFilter === "INACTIVE" && customer.is_active) return false;

      return true;
    });
  }, [searchQuery, resellerFilter, statusFilter]);

  // Hitung statistik keseluruhan dari master data
  const stats = useMemo(() => getCustomerStats(MOCK_ADMIN_CUSTOMERS), []);

  const handleExport = () => {
    alert("Data pelanggan berhasil diunduh sebagai file CSV.");
  };

  return (
    <div className="space-y-6">
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
            Pantau seluruh data pelanggan terdaftar, status kemitraan reseller, dan akumulasi nilai belanja (LTV).
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
            dari {MOCK_ADMIN_CUSTOMERS.length} pelanggan
          </span>
        </div>

        <CustomerTable data={filteredCustomers} />
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
