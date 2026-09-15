import * as React from "react";
import Link from "next/link";
import { MessageSquareWarning, Calendar, ExternalLink, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import type { CustomerComplaintRow } from "./customer-list-types";

export interface CustomerComplaintsTabProps {
  complaints: CustomerComplaintRow[];
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

/**
 * Molecule — Tab Riwayat Komplain / Garansi Customer di halaman detail pelanggan.
 */
export function CustomerComplaintsTab({ complaints }: CustomerComplaintsTabProps) {
  if (complaints.length === 0) {
    return (
      <div className="bg-card rounded-2xl border-2 border-border p-10 text-center text-muted-foreground shadow-xs flex flex-col items-center justify-center gap-2">
        <XCircle className="size-8 text-muted-foreground" />
        <p className="font-heading font-bold text-sm text-foreground">
          Tidak ada komplain atau klaim garansi
        </p>
        <p className="text-xs">
          Customer ini belum pernah mengajukan komplain garansi untuk pesanan apapun.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3">
        <MessageSquareWarning className="size-4 text-primary" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Riwayat Komplain &amp; Garansi
        </h3>
        <span className="text-xs font-heading font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {complaints.length} Komplain
        </span>
      </div>

      <div className="space-y-3">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-heading font-bold text-sm text-foreground">
                {item.title}
              </div>
              <StatusBadge status={item.status} size="sm" neo />
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(item.created_at)}
                </span>
                <span>
                  No. Order:{" "}
                  <Link
                    href={`/admin/orders/${item.order_id}`}
                    className="font-bold text-foreground hover:text-primary transition-colors underline inline-flex items-center gap-0.5"
                  >
                    {item.order_number}
                    <ExternalLink className="size-2.5" />
                  </Link>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
