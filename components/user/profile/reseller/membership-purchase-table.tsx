"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MembershipPurchaseStatusBadge } from "./membership-purchase-status-badge";
import type { MembershipPurchase } from "@/types";

/**
 * MembershipPurchaseTable
 * -----------------------
 * Tabel riwayat pembelian membership (7 kolom, PRD Bab 6.8).
 * Client-side pagination — 10 baris per halaman.
 * Card tanpa neo-shadow.
 *
 * PRD Bab 6.8 | FR-023 | US-012
 */

const PAGE_SIZE = 10;

const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const CURRENCY_FORMAT = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return DATE_FORMAT.format(new Date(iso));
}

function formatPeriod(starts: string | null, ends: string | null): string {
  if (!starts || !ends) return "—";
  return `${formatDate(starts)} – ${formatDate(ends)}`;
}

function formatCurrency(amount: number): string {
  return CURRENCY_FORMAT.format(amount);
}

function formatPaymentMethod(method: string | null): string {
  if (!method) return "—";
  return method
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface MembershipPurchaseTableProps {
  purchases: MembershipPurchase[];
}

export function MembershipPurchaseTable({
  purchases,
}: MembershipPurchaseTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  const paginated = purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-2xl bg-white border border-[#C7C4BB] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#C7C4BB] bg-muted/40">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent-yellow">
          <History className="size-4 text-foreground" />
        </div>
        <h3 className="font-heading text-sm font-bold text-foreground">
          Riwayat Pembelian Membership
        </h3>
        <span className="ml-auto font-body text-xs text-muted-foreground">
          {purchases.length} transaksi
        </span>
      </div>

      {/* Empty state */}
      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
          <History className="size-10 text-muted-foreground/30" />
          <p className="font-body text-sm text-muted-foreground">
            Belum ada riwayat pembelian membership.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#C7C4BB] bg-muted/20">
                  {[
                    "Tanggal",
                    "Nomor Pembelian",
                    "Paket",
                    "Periode Berlaku",
                    "Nominal",
                    "Metode",
                    "Status",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-heading text-[10px] font-bold uppercase tracking-widest text-muted-foreground first:pl-6 last:pr-6"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b border-[#C7C4BB]/60 transition-colors hover:bg-muted/20 ${
                      idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                    }`}
                  >
                    <td className="pl-6 pr-4 py-3.5 font-body text-sm text-foreground whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded-md border border-[#C7C4BB]">
                        {p.purchase_number}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-body text-sm text-foreground">
                      {p.plan_name_snapshot}
                    </td>
                    <td className="px-4 py-3.5 font-body text-sm text-muted-foreground whitespace-nowrap">
                      {formatPeriod(p.starts_at, p.ends_at)}
                    </td>
                    <td className="px-4 py-3.5 font-body text-sm font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(p.price_snapshot)}
                    </td>
                    <td className="px-4 py-3.5 font-body text-sm text-muted-foreground whitespace-nowrap">
                      {formatPaymentMethod(p.payment_method)}
                    </td>
                    <td className="px-4 pr-6 py-3.5">
                      <MembershipPurchaseStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#C7C4BB] bg-white">
              <span className="font-body text-xs text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="font-heading font-bold rounded-xl gap-1 border-[#C7C4BB] shadow-none"
                >
                  <ChevronLeft className="size-3.5" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="font-heading font-bold rounded-xl gap-1 border-[#C7C4BB] shadow-none"
                >
                  Berikutnya
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
