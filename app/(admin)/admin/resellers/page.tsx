"use client";

import React, { useMemo, useState, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { HandshakeIcon } from "lucide-react";
import {
    ResellerStatsGrid,
    ResellerFilters,
    ResellerTable,
    MOCK_ADMIN_RESELLERS,
    getResellerStats,
} from "@/components/admin/resellers";
import type { AdminResellerRow } from "@/components/admin/resellers";

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminResellersContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const searchQuery = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "ALL";
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

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

    // Filter reseller berdasarkan search & status
    const filteredResellers = useMemo(() => {
        return MOCK_ADMIN_RESELLERS.filter((reseller: AdminResellerRow) => {
            // 1. Search (Nama, Email, No Telepon)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = reseller.name.toLowerCase().includes(query);
                const matchesEmail = reseller.email.toLowerCase().includes(query);
                const matchesPhone =
                    reseller.phone?.toLowerCase().includes(query) ?? false;
                if (!matchesName && !matchesEmail && !matchesPhone) return false;
            }

            // 2. Status Filter
            if (statusFilter !== "ALL") {
                if (reseller.reseller_status !== statusFilter) return false;
            }

            return true;
        });
    }, [searchQuery, statusFilter]);

    // Reset ke halaman 1 saat filter berubah
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredResellers.length / ITEMS_PER_PAGE);
    const paginatedResellers = filteredResellers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Hitung statistik keseluruhan dari master data
    const stats = useMemo(() => getResellerStats(MOCK_ADMIN_RESELLERS), []);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        {/* <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <HandshakeIcon className="size-5" />
                        </div> */}
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                            Manajemen Reseller
                        </h1>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Tinjau dan kelola pengajuan kemitraan reseller — setujui atau tolak
                        akses harga khusus reseller untuk customer.
                    </p>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <ResellerStatsGrid
                stats={stats}
                onFilterStatus={handleStatusFilterChange}
            />

            {/* Filters Toolbar */}
            <ResellerFilters
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                onSearchChange={handleSearchChange}
                onStatusFilterChange={handleStatusFilterChange}
            />

            {/* Data Table */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-body">
                    <span>
                        Menampilkan{" "}
                        <strong className="text-foreground font-semibold">
                            {filteredResellers.length}
                        </strong>{" "}
                        dari {MOCK_ADMIN_RESELLERS.length} pengajuan
                    </span>
                    {statusFilter === "PENDING" && (
                        <span className="text-warning font-semibold">
                            {filteredResellers.length} pengajuan menunggu review
                        </span>
                    )}
                </div>

                <ResellerTable data={paginatedResellers} />

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main export (wrapped in Suspense for Next.js App Router useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminResellersPage() {
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
            <AdminResellersContent />
        </Suspense>
    );
}
