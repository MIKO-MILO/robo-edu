"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { BackButton, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/enums";

export interface OrderDetailHeaderProps {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  /** ID customer — digunakan untuk link ke /admin/customers/:id */
  customerId?: string;
  /** Override back route; default: /admin/orders */
  backHref?: string;
}

/**
 * Molecule — header halaman detail pesanan.
 * Menampilkan tombol kembali, nomor order, status badge, tanggal dibuat,
 * dan tombol navigasi ke profil pelanggan.
 */
export function OrderDetailHeader({
  orderNumber,
  status,
  createdAt,
  customerId,
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
        <BackButton onClick={() => router.push(backHref)} />

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

      {customerId && (
        <Link
          href={`/admin/customers/${customerId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm", neo: true }),
            "rounded-xl gap-1.5 font-heading font-bold text-xs"
          )}
        >
          <User className="size-3.5" />
          <span>Lihat Profil Pelanggan</span>
        </Link>
      )}
    </div>
  );
}

