"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Calendar, Phone, Eye, XCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/status-badge";
import type { AdminCustomerRow } from "./customer-list-types";

export interface CustomerTableProps {
  data: AdminCustomerRow[];
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
 * Organism — tabel data pelanggan di halaman /admin/customers.
 * Menampilkan avatar inisial, info nama/email, no HP, status reseller,
 * status aktif, total belanja (LTV), dan aksi detail.
 */
export function CustomerTable({ data, isLoading = false }: CustomerTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3.5 px-4">Pelanggan</th>
              <th className="py-3.5 px-4">Kontak</th>
              <th className="py-3.5 px-4">Tipe Akun</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Total Belanja (LTV)</th>
              <th className="py-3.5 px-4">Pesanan Terakhir</th>
              <th className="py-3.5 px-4">Terdaftar</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {/* Loading skeleton */}
            {isLoading &&
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-3.5 px-4">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* Empty state */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="size-8 text-muted-foreground" />
                    <p className="font-heading font-bold text-sm">
                      Tidak ada pelanggan ditemukan
                    </p>
                    <p className="text-xs">
                      Coba ubah kata kunci pencarian atau filter tipe pelanggan.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              data.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/customers/${customer.id}`)}
                >
                  {/* Pelanggan (Avatar + Nama + Email) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                          {customer.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Kontak */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-foreground flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" />
                      <span>{customer.phone || "-"}</span>
                    </div>
                  </td>

                  {/* Tipe Akun / Reseller Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={customer.reseller_status}
                      size="sm"
                      neo
                      customLabel={
                        customer.reseller_status === "NOT_RESELLER"
                          ? "Pelanggan"
                          : customer.reseller_status === "APPROVED"
                          ? "Reseller"
                          : customer.reseller_status === "PENDING"
                          ? "Pengajuan"
                          : "Ditolak"
                      }
                    />
                  </td>

                  {/* Status Akun */}
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={customer.is_active ? "ACTIVE" : "INACTIVE"}
                      size="sm"
                      customLabel={customer.is_active ? "Aktif" : "Nonaktif"}
                    />
                  </td>

                  {/* Total Belanja (LTV) & Total Orders */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-bold text-foreground">
                      {formatIDR(customer.total_spent)}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <ShoppingBag className="size-3" />
                      {customer.total_orders} Pesanan
                    </div>
                  </td>

                  {/* Pesanan Terakhir */}
                  <td className="py-3.5 px-4">
                    {customer.last_order_at ? (
                      <div>
                        <div className="text-xs text-foreground font-medium flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground" />
                          {formatDate(customer.last_order_at)}
                        </div>
                        {customer.last_order_status && (
                          <div className="mt-1">
                            <StatusBadge
                              status={customer.last_order_status}
                              size="sm"
                              showDot={false}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Belum pernah belanja
                      </span>
                    )}
                  </td>

                  {/* Terdaftar */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {formatDate(customer.created_at)}
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
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
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
