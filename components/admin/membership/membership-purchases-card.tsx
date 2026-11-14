import * as React from "react";
import { CreditCard, Calendar, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MembershipPurchase {
  id: string;
  purchase_number: string;
  plan_name_snapshot: string;
  price_snapshot: number;
  duration_months_snapshot: number;
  starts_at: string | null;
  ends_at: string | null;
  paid_at: string | null;
  status: string;
  created_at: string;
}

export interface MembershipPurchasesCardProps {
  purchases: MembershipPurchase[];
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

function getStatusConfig(status: string): { label: string; className: string } {
  switch (status.toUpperCase()) {
    case "PAID":
      return {
        label: "Lunas",
        className: "bg-success-bg text-success border border-border rounded-full px-2 py-0.5 text-[11px] font-bold",
      };
    case "PENDING":
      return {
        label: "Menunggu",
        className: "bg-warning-bg text-foreground border border-border rounded-full px-2 py-0.5 text-[11px] font-bold",
      };
    case "FAILED":
    case "EXPIRED":
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        className: "bg-danger-bg text-danger border border-border rounded-full px-2 py-0.5 text-[11px] font-bold",
      };
    default:
      return {
        label: status,
        className: "bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5 text-[11px] font-bold",
      };
  }
}

/**
 * Molecule — Riwayat pembelian membership untuk halaman detail member admin.
 * Menggantikan ResellerOrdersTab yang menampilkan product orders (tidak relevan
 * untuk model membership).
 */
export function MembershipPurchasesCard({ purchases }: MembershipPurchasesCardProps) {
  const isEmpty = purchases.length === 0;

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      {/* Card header */}
      <div className="p-4 border-b border-border bg-accent-orange/60 flex items-center justify-between">
        <h2 className="font-heading text-sm md:text-base font-bold flex items-center gap-2 text-foreground">
          <CreditCard className="size-[18px]" />
          Riwayat Pembelian Membership
        </h2>
        <span className="border border-border bg-card text-[10px] font-mono px-2 py-0.5 font-bold text-foreground">
          {purchases.length} Pembelian
        </span>
      </div>

      <div className="p-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <Package className="size-10 opacity-30" />
            <p className="text-xs font-body italic">Belum ada riwayat pembelian membership.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => {
              const statusCfg = getStatusConfig(purchase.status);
              return (
                <div
                  key={purchase.id}
                  className={cn(
                    "p-4 border border-border rounded-xl bg-background",
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  )}
                >
                  {/* Left: Purchase info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="font-heading font-bold text-xs text-foreground">
                      {purchase.purchase_number}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-body">
                      {purchase.plan_name_snapshot} &middot;{" "}
                      {purchase.duration_months_snapshot} bulan
                    </div>
                    {purchase.starts_at && purchase.ends_at && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-body">
                        <Calendar className="size-3 shrink-0" />
                        {formatDate(purchase.starts_at)} &rarr;{" "}
                        {formatDate(purchase.ends_at)}
                      </div>
                    )}
                  </div>

                  {/* Right: Status + Amount */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <span className={statusCfg.className}>{statusCfg.label}</span>
                    <div className="font-heading font-bold text-sm text-foreground">
                      {formatIDR(purchase.price_snapshot)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
