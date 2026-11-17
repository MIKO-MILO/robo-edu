"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Phone,
  Calendar,
  Eye,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminMemberRow } from "./membership-list-types";

export interface ResellerTableProps {
  data: AdminMemberRow[];
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

function getMembershipStatusConfig(
  status: string,
  expiresAt: string | null,
): { label: string; className: string } {
  if (status !== "MEMBER") {
    return {
      label: "Non-Member",
      className:
        "bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5 text-xs font-bold",
    };
  }
  if (expiresAt) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days < 0) {
      return {
        label: "Expired",
        className:
          "bg-danger-bg text-danger border border-border rounded-full px-2 py-0.5 text-xs font-bold",
      };
    }
    if (days <= 30) {
      return {
        label: `Aktif · ${days}h lagi`,
        className:
          "bg-warning-bg text-foreground border border-border rounded-full px-2 py-0.5 text-xs font-bold",
      };
    }
  }
  return {
    label: "Aktif",
    className:
      "bg-success-bg text-success border border-border rounded-full px-2 py-0.5 text-xs font-bold",
  };
}

const SKELETON_ROWS = 5;

/**
 * Organism — tabel daftar member di halaman /admin/membership.
 * Menampilkan avatar inisial, info nama/email, no HP, status membership,
 * tanggal bergabung, jumlah pembelian, dan aksi detail.
 */
export function ResellerTable({ data, isLoading = false }: ResellerTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-accent-soft-blue/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4">Member</th>
              <th className="py-3.5 px-4">Kontak</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Bergabung</th>
              <th className="py-3.5 px-4">Masa Aktif</th>
              <th className="py-3.5 px-4">Pembelian</th>
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
                      Tidak ada member ditemukan
                    </p>
                    <p className="text-xs">
                      Coba ubah kata kunci pencarian atau periksa koneksi.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              data.map((member) => {
                const statusCfg = getMembershipStatusConfig(
                  member.membership_status,
                  member.membership_expires_at,
                );
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/membership/${member.id}`)}
                  >
                    {/* Member (Avatar + Nama + Email) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <div className="font-heading font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kontak */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <Phone className="size-3 text-muted-foreground" />
                        <span>{member.phone || "-"}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={statusCfg.className}>{statusCfg.label}</span>
                      {!member.is_active && (
                        <div className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
                          <XCircle className="size-3" />
                          Akun nonaktif
                        </div>
                      )}
                    </td>

                    {/* Bergabung */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {formatDate(member.created_at)}
                      </div>
                    </td>

                    {/* Masa Aktif */}
                    <td className="py-3.5 px-4">
                      {member.membership_expires_at ? (
                        <div className="text-xs text-foreground flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {formatDate(member.membership_expires_at)}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </td>

                    {/* Pembelian */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <ShoppingBag className="size-3 text-muted-foreground" />
                        {member.purchase_count} Pembelian
                      </div>
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
                          router.push(`/admin/membership/${member.id}`)
                        }
                        className="gap-1 rounded-xl"
                      >
                        <Eye className="size-3.5" />
                        <span>Detail</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
