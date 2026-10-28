"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Eye,
  ShoppingBag,
  Truck,
  CreditCard,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";
import type { CustomerOrderHistoryRow } from "./customer-list-types";
import type { OrderStatus } from "@/types/enums";

export interface CustomerOrdersTabProps {
  orders: CustomerOrderHistoryRow[];
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

const LOCAL_STATUS_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "PROCESSING", label: "Diproses" },
  { key: "SHIPPED", label: "Dikirim" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
] as const;

/**
 * Organism — Tab Riwayat Pesanan Customer di halaman detail pelanggan.
 * Menampilkan transaksi spesifik customer dengan status pembayaran,
 * status pengiriman, dan direct link ke `/admin/orders/[id]`.
 */
export function CustomerOrdersTab({ orders }: CustomerOrdersTabProps) {
  const [activeTab, setActiveTab] = React.useState<string>("ALL");

  const filteredOrders = React.useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "PROCESSING") {
      return orders.filter((o) =>
        ["PENDING", "PAID", "PROCESSING"].includes(o.status)
      );
    }
    if (activeTab === "SHIPPED") {
      return orders.filter((o) => o.status === "SHIPPED");
    }
    if (activeTab === "COMPLETED") {
      return orders.filter((o) =>
        ["DELIVERED", "COMPLETED"].includes(o.status)
      );
    }
    if (activeTab === "CANCELLED") {
      return orders.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      );
    }
    return orders;
  }, [orders, activeTab]);

  return (
    <div className="bg-card rounded-2xl border-2 border-border overflow-hidden shadow-xs space-y-4 p-5">
      {/* Tab Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-border pb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-primary" />
          <h3 className="font-heading font-bold text-base text-foreground">
            Riwayat Pesanan Pelanggan
          </h3>
          <span className="text-xs font-heading font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {orders.length} Transaksi
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {LOCAL_STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer",
                activeTab === tab.key
                  ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state (shared) */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <XCircle className="size-8 text-muted-foreground" />
          <p className="font-heading font-bold text-sm">
            Tidak ada riwayat pesanan
          </p>
          <p className="text-xs">
            Customer belum memiliki pesanan dengan kriteria filter ini.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: Table (>= lg) */}
          <div className="hidden lg:block overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-left border-collapse font-body text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40 text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">No. Order &amp; Waktu</th>
                  <th className="py-3 px-4">Item Produk</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Pembayaran</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4">Pengiriman</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* No Order & Waktu */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-heading font-bold text-foreground group-hover:text-primary transition-colors block text-xs"
                      >
                        {order.order_number}
                      </Link>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        {formatDate(order.created_at)}
                      </div>
                    </td>

                    {/* Item Produk */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div
                        className="truncate font-medium text-foreground text-xs"
                        title={order.first_item_name}
                      >
                        {order.first_item_name}
                      </div>
                      {order.item_count > 1 && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          +{order.item_count - 1} produk lainnya
                        </div>
                      )}
                    </td>

                    {/* Total Tagihan */}
                    <td className="py-3.5 px-4">
                      <div className="font-heading font-bold text-foreground text-xs">
                        {formatIDR(order.total)}
                      </div>
                      {order.shipping_cost > 0 && (
                        <div className="text-[10px] text-muted-foreground">
                          Ongkir: {formatIDR(order.shipping_cost)}
                        </div>
                      )}
                    </td>

                    {/* Pembayaran */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.payment_status} size="sm" />
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                        <CreditCard className="size-3" />
                        <span>{order.payment_method}</span>
                      </div>
                    </td>

                    {/* Status Pesanan */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={order.status as OrderStatus}
                        size="sm"
                        neo
                      />
                    </td>

                    {/* Pengiriman & Resi */}
                    <td className="py-3.5 px-4 text-xs">
                      {order.shipping_courier ? (
                        <div>
                          <div className="flex items-center gap-1 text-foreground font-medium text-[11px]">
                            <Truck className="size-3 text-muted-foreground" />
                            <span>{order.shipping_courier}</span>
                          </div>
                          {order.tracking_number ? (
                            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                              {order.tracking_number}
                            </div>
                          ) : (
                            <div className="text-[10px] text-warning italic mt-0.5">
                              Belum ada resi
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          -
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        asChild
                        variant="outline"
                        size="xs"
                        className="gap-1 rounded-xl"
                      >
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="size-3.5" />
                          <span>Lihat</span>
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card-based Layout (< lg) */}
          <div className="lg:hidden space-y-3 -mx-5 -mb-5 px-5 pb-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3 text-xs hover:border-primary/30 transition-colors"
              >
                {/* Header: No Order + Time + Statuses */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-heading font-bold text-foreground hover:text-primary transition-colors text-sm block truncate"
                    >
                      {order.order_number}
                    </Link>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="size-3 shrink-0" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge
                      status={order.status as OrderStatus}
                      size="sm"
                      neo
                    />
                    <StatusBadge status={order.payment_status} size="sm" />
                  </div>
                </div>

                {/* Produk & Total */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                  <div>
                    <div className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                      Produk
                    </div>
                    <div
                      className="font-medium text-foreground text-xs mt-0.5 line-clamp-2"
                      title={order.first_item_name}
                    >
                      {order.first_item_name}
                    </div>
                    {order.item_count > 1 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        +{order.item_count - 1} produk lainnya
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                      Total Tagihan
                    </div>
                    <div className="font-heading font-bold text-foreground text-sm mt-0.5">
                      {formatIDR(order.total)}
                    </div>
                    {order.shipping_cost > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Ongkir: {formatIDR(order.shipping_cost)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pembayaran & Pengiriman */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                  <div>
                    <div className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                      Pembayaran
                    </div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <CreditCard className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{order.payment_method}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                      Pengiriman
                    </div>
                    {order.shipping_courier ? (
                      <>
                        <div className="text-xs font-semibold text-foreground flex items-center gap-1 mt-0.5">
                          <Truck className="size-3 text-muted-foreground shrink-0" />
                          <span>{order.shipping_courier}</span>
                        </div>
                        {order.tracking_number ? (
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                            {order.tracking_number}
                          </div>
                        ) : (
                          <div className="text-[10px] text-warning italic mt-0.5">
                            Belum ada resi
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] text-muted-foreground italic mt-0.5">
                        Tidak ada
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Aksi */}
                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="xs"
                    className="gap-1 rounded-xl"
                  >
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye className="size-3.5" />
                      <span>Lihat Detail Pesanan</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
