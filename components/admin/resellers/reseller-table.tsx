"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Calendar,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminResellerRow } from "./reseller-list-types";

export interface ResellerTableProps {
  data: AdminResellerRow[];
  isLoading?: boolean;
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SKELETON_ROWS = 5;

/**
 * Organism — tabel daftar pengajuan reseller di halaman /admin/resellers.
 * Menampilkan avatar inisial, info nama/email, no HP, status pengajuan,
 * tanggal pengajuan, riwayat belanja, dan aksi detail/approve.
 */
export function ResellerTable({ data, isLoading = false }: ResellerTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4">Pemohon</th>
              <th className="py-3.5 px-4">Kontak</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Tanggal Pengajuan</th>
              <th className="py-3.5 px-4">Total Belanja (LTV)</th>
              <th className="py-3.5 px-4">Pesanan</th>
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
            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="size-8 text-muted-foreground" />
                    <p className="font-heading font-bold text-sm">
                      Tidak ada pengajuan reseller ditemukan
                    </p>
                    <p className="text-xs">
                      Coba ubah filter status atau kata kunci pencarian.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              data.map((reseller) => (
                <tr
                  key={reseller.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/resellers/${reseller.id}`)}
                >
                  {/* Pemohon (Avatar + Nama + Email) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(reseller.name)}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                          {reseller.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {reseller.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kontak */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-foreground flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      <span>{reseller.phone || "-"}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={reseller.reseller_status}
                      size="sm"
                      neo
                      customLabel={
                        reseller.reseller_status === "PENDING"
                          ? "Menunggu"
                          : reseller.reseller_status === "APPROVED"
                            ? "Disetujui"
                            : "Ditolak"
                      }
                    />
                  </td>

                  {/* Tanggal Pengajuan */}
                  <td className="py-3.5 px-4">
                    {reseller.reseller_applied_at ? (
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        {formatDate(reseller.reseller_applied_at)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        -
                      </span>
                    )}
                    {reseller.reseller_approved_at && (
                      <div className="text-[11px] text-success flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="size-3" />
                        Disetujui: {formatDate(reseller.reseller_approved_at)}
                      </div>
                    )}
                  </td>

                  {/* Total Belanja (LTV) */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-bold text-foreground">
                      {formatIDR(reseller.total_spent)}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Terdaftar: {formatDate(reseller.created_at)}
                    </div>
                  </td>

                  {/* Pesanan */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-foreground flex items-center gap-1">
                      <ShoppingBag className="size-3 text-muted-foreground" />
                      {reseller.total_orders} Pesanan
                    </div>
                    {reseller.last_order_at && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        {formatDate(reseller.last_order_at)}
                      </div>
                    )}
                  </td>

                  {/* Aksi */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        router.push(`/admin/resellers/${reseller.id}`)
                      }
                      className="gap-1 rounded-xl"
                    >
                      <Eye className="size-3.5" />
                      <span>Detail</span>
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
