"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { OrderStatus } from "@/types/enums";

export interface OrderDetailHeaderProps {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  /** Override back route; default: /admin/orders */
  backHref?: string;
}

/**
 * Molecule — header halaman detail pesanan.
 * Menampilkan tombol kembali, nomor order, status badge, dan tanggal dibuat.
 */
export function OrderDetailHeader({
  orderNumber,
  status,
  createdAt,
  backHref = "/admin/orders",
}: OrderDetailHeaderProps) {
  const router = useRouter();

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(backHref)}
          className="rounded-xl gap-1.5 shrink-0"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali</span>
        </Button>

        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
              {orderNumber}
            </h1>
            <StatusBadge status={status} size="md" neo />
          </div>
          <p className="font-body text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Dipesan pada {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
