"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import type { ComplaintStatus } from "@/types/enums";

export interface ComplaintDetailHeaderProps {
  subject: string;
  status: ComplaintStatus;
  createdAt: string;
  /** Override rute kembali; default: /admin/complaints */
  backHref?: string;
}

/**
 * Molecule — header halaman detail klaim.
 * Menampilkan tombol kembali, subjek klaim, status badge, dan tanggal diajukan.
 */
export function ComplaintDetailHeader({
  subject,
  status,
  createdAt,
  backHref = "/admin/complaints",
}: ComplaintDetailHeaderProps) {
  const router = useRouter();

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(backHref)}
          className="rounded-xl gap-1.5 shrink-0 mt-0.5"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali</span>
        </Button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <MessageSquareWarning className="size-5 text-primary shrink-0" />
            <h1 className="font-heading text-xl font-bold text-foreground tracking-tight leading-tight">
              {subject}
            </h1>
            <StatusBadge status={status} size="md" neo />
          </div>
          <p className="font-body text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Diajukan pada {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
