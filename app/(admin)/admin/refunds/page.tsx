"use client";

import React, { useCallback, useEffect, useState, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  RefreshCcw,
  AlertCircle,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/admin/status-badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RefundRow {
  id: string;
  order_id: string | null;
  order_number: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  amount: number;
  method: "MIDTRANS_API" | "MANUAL";
  status: "PENDING" | "SUCCESS" | "FAILED";
  proof_url: string | null;
  created_at: string;
  updated_at: string;
}

interface RefundMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const METHOD_LABELS: Record<string, string> = {
  MIDTRANS_API: "Otomatis",
  MANUAL: "Manual",
};

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Sukses" },
  { value: "FAILED", label: "Gagal" },
];

const SKELETON_ROWS = 6;

// ── Inner content ──────────────────────────────────────────────────────────────

function AdminRefundsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const statusFilter = searchParams.get("status") ?? "ALL";
  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [rows, setRows] = useState<RefundRow[]>([]);
  const [meta, setMeta] = useState<RefundMeta>({
    current_page: 1,
    per_page: 20,
    total_pages: 1,
    total_count: 0,
    has_next_page: false,
    has_prev_page: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/refunds?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal memuat daftar refund.");

      setRows((json.data as RefundRow[]) ?? []);
      if (json.meta) setMeta(json.meta as RefundMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar refund.");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    void fetchRefunds();
  }, [fetchRefunds]);

  // ── URL param helpers ────────────────────────────────────────────────────────

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-6 pt-1 pb-20 md:pb-24 max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-7rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <RefreshCcw className="size-6 text-primary" />
            Manajemen Refund
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Daftar semua pengajuan refund lintas pesanan.
          </p>
        </div>

        {/* Total count pill */}
        {!isLoading && (
          <span className="bg-card text-foreground font-heading font-bold text-sm px-3.5 py-1 rounded-full border-2 border-foreground self-start sm:self-auto">
            {meta.total_count} refund
          </span>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-card border-2 border-foreground rounded-xl p-1 overflow-x-auto">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleStatusChange(opt.value)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-colors whitespace-nowrap",
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => void fetchRefunds()}
            className="ml-auto underline underline-offset-2 hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left border-collapse font-body text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">Nomor Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Metode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Loading skeleton */}
                {isLoading &&
                  Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                    <tr key={`sk-${i}`}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3.5 px-4">
                          <Skeleton className="h-4 w-full max-w-[120px] rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* Empty state */}
                {!isLoading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="size-8 text-muted-foreground" />
                        <p className="font-heading font-bold text-sm text-foreground">
                          Tidak ada refund ditemukan
                        </p>
                        <p className="text-xs">Coba ubah filter status.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!isLoading &&
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Order number */}
                      <td className="py-3.5 px-4">
                        {row.order_id && row.order_number ? (
                          <Link href={`/admin/orders/${row.order_id}`}>
                            <span className="font-mono text-xs font-semibold text-primary hover:underline">
                              #{row.order_number}
                            </span>
                          </Link>
                        ) : (
                          <span className="font-body text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        {row.customer ? (
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                              <User className="size-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {row.customer.name ?? "—"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
                              {row.customer.email ?? "—"}
                            </div>
                          </div>
                        ) : (
                          <span className="font-body text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-heading font-bold text-sm text-foreground">
                          {formatRupiah(row.amount)}
                        </span>
                      </td>

                      {/* Method badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={[
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-heading font-bold border",
                            row.method === "MIDTRANS_API"
                              ? "bg-accent-soft-blue/60 text-foreground border-accent-soft-blue"
                              : "bg-accent-orange/40 text-foreground border-accent-orange",
                          ].join(" ")}
                        >
                          {METHOD_LABELS[row.method] ?? row.method}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} size="sm" neo />
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 shrink-0" />
                          {formatDate(row.created_at)}
                        </div>
                      </td>

                      {/* Action — link to order detail */}
                      <td className="py-3.5 px-4 text-center">
                        {row.order_id ? (
                          <Link href={`/admin/orders/${row.order_id}`}>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              className="gap-1 rounded-xl"
                            >
                              <ExternalLink className="size-3.5" />
                              <span>Detail Order</span>
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Menampilkan {rows.length} dari {meta.total_count} refund
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={meta.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function AdminRefundsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <AdminRefundsContent />
    </Suspense>
  );
}
