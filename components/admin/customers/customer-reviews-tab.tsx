import * as React from "react";
import { Star, Calendar, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import type { CustomerReviewRow } from "./customer-list-types";

export interface CustomerReviewsTabProps {
  reviews: CustomerReviewRow[];
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

/**
 * Molecule — Tab Riwayat Ulasan Produk Customer di halaman detail pelanggan.
 */
export function CustomerReviewsTab({ reviews }: CustomerReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-card rounded-2xl border-2 border-border p-10 text-center text-muted-foreground shadow-xs flex flex-col items-center justify-center gap-2">
        <XCircle className="size-8 text-muted-foreground" />
        <p className="font-heading font-bold text-sm text-foreground">
          Belum ada ulasan produk
        </p>
        <p className="text-xs">
          Customer ini belum pernah menuliskan ulasan untuk produk yang dibeli.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3">
        <Star className="size-4 text-warning fill-warning" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Riwayat Ulasan Produk
        </h3>
        <span className="text-xs font-heading font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
          {reviews.length} Ulasan
        </span>
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-heading font-bold text-sm text-foreground">
                  {rev.product_name}
                </div>
                {/* Star rating */}
                <div className="flex items-center gap-1 mt-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < rev.rating
                          ? "fill-warning text-warning"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground ml-1">
                    {rev.rating}/5
                  </span>
                </div>
              </div>

              <StatusBadge status={rev.status} size="sm" />
            </div>

            <p className="text-muted-foreground leading-relaxed italic bg-card p-3 rounded-lg border border-border/40">
              &ldquo;{rev.comment}&rdquo;
            </p>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
              <Calendar className="size-3" />
              <span>{formatDate(rev.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
