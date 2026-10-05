"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { useVoucher } from "@/hooks/admin/vouchers";
import { VoucherForm } from "@/components/admin/vouchers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, ArrowLeftIcon } from "lucide-react";
import type { UUID } from "@/types";

interface EditVoucherPageProps {
  params: Promise<{
    id: UUID;
  }>;
}

export default function EditVoucherPage({ params }: EditVoucherPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: response, isLoading, isError, error, refetch } = useVoucher(id);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-danger-bg text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs md:text-sm font-medium">
            Gagal memuat data voucher: {error instanceof Error ? error.message : "Terjadi kesalahan server"}
          </div>
          <Button type="button" variant="outline" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon className="size-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <VoucherForm initialData={response.data} />
    </div>
  );
}
