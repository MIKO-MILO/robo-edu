"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useVouchers, useDeleteVoucher } from "@/hooks/admin/vouchers";
import { VoucherFilters, VoucherList } from "@/components/admin/vouchers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, AlertTriangleIcon } from "lucide-react";
import type { GetVouchersParams } from "@/lib/api/endpoints/vouchers";
import type { Voucher, UUID } from "@/types";

function AdminVouchersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters: GetVouchersParams = {
    search: searchParams.get("search") || undefined,
    is_active: searchParams.get("is_active") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 10,
  };

  const { data: response, isLoading, isError, error, refetch } = useVouchers(filters);
  const deleteMutation = useDeleteVoucher();

  const handleFilterChange = (newFilters: GetVouchersParams) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.is_active) params.set("is_active", newFilters.is_active);
    if (newFilters.page && newFilters.page > 1) params.set("page", String(newFilters.page));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange({ ...filters, page: newPage });
  };

  const handleEdit = (voucher: Voucher) => {
    router.push(`/admin/vouchers/${voucher.id}/edit`);
  };

  const handleDelete = async (id: UUID) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus voucher ini?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const dataList = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
            Manajemen Voucher
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola data voucher diskon, tipe potongan, dan limit penggunaan.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="default"
          neo
          onClick={() => router.push("/admin/vouchers/create")}
        >
          <PlusIcon className="size-4" />
          <span>Tambah Voucher</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <VoucherFilters filters={filters} onChange={handleFilterChange} />

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-danger-bg text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs md:text-sm font-medium">
            Gagal memuat data voucher: {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Table */}
      <VoucherList
        data={dataList}
        isLoading={isLoading || isPending}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function AdminVouchersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminVouchersContent />
    </Suspense>
  );
}
