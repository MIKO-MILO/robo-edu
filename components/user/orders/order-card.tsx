"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./order-status-badge";
import {
  RotateCcw,
  Star,
  Truck,
  ExternalLink,
  MoreHorizontal,
  X,
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { OrderListItem, OrderStatus } from "@/types";

export interface OrderCardProps {
  order: OrderListItem & {
    recipient_name?: string;
    shipping_address?: string;
    paid_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    shipment_summary?: string;
    tracking_number?: string;
    courier_name?: string;
    has_reviewed?: boolean;
  };
  onViewInvoice?: (orderNumber: string) => void;
  onTrackPackage?: (orderNumber: string) => void;
  onBuyAgain?: (productName: string) => void;
  onReview?: (orderNumber: string) => void;
  onPayNow?: (orderNumber: string) => void;
  onCancelOrder?: (orderNumber: string) => void;
}

export function OrderCard({
  order,
  onViewInvoice,
  onTrackPackage,
  onBuyAgain,
  onReview,
  onPayNow,
  onCancelOrder,
}: OrderCardProps) {
  const [showReviewAlert, setShowReviewAlert] = useState(
    (order.status === "DELIVERED" || order.status === "COMPLETED") && !order.has_reviewed
  );

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const recipient = order.recipient_name || "Pelanggan RoboEdu";
  const firstItem = order.first_item;
  const extraItemsCount = order.item_count > 1 ? order.item_count - 1 : 0;

  // Helper title based on status
  const getStatusHeadline = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Menunggu Pembayaran";
      case "PAID":
        return "Pembayaran Terverifikasi";
      case "PROCESSING":
        return "Pesanan Sedang Diproses Penjual";
      case "SHIPPED":
        return "Paket Sedang Dalam Perjalanan";
      case "DELIVERED":
        return order.delivered_at
          ? `Tiba pada ${formatDate(order.delivered_at)}`
          : "Paket Telah Tiba";
      case "COMPLETED":
        return "Pesanan Selesai";
      case "CANCELLED":
        return "Pesanan Dibatalkan";
      case "REFUNDED":
        return "Dana Telah Dikembalikan";
      default:
        return "Status Pesanan";
    }
  };

  return (
    <article
      aria-labelledby={`order-${order.id}-title`}
      className="bg-card border-2 border-foreground rounded-3xl overflow-hidden flex flex-col neo-shadow transition-all"
    >
      {/* ── Order Header Bar ──────────────────────────────── */}
      <div className="bg-muted border-b-2 border-foreground p-4 sm:px-6 flex flex-wrap justify-between items-start sm:items-center gap-4 text-xs font-body">
        {/* Left Info Group */}
        <div className="flex flex-wrap gap-6 sm:gap-8 items-center">
          {/* Order Date */}
          <div className="flex flex-col gap-0.5">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground text-[10px]">
              Tanggal Pemesanan
            </span>
            <span className="font-heading font-bold text-foreground text-sm">
              {formatDate(order.created_at)}
            </span>
          </div>

          {/* Total Payment */}
          <div className="flex flex-col gap-0.5">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground text-[10px]">
              Total Pembayaran
            </span>
            <span className="font-heading font-bold text-primary text-sm">
              {formatRupiah(order.total)}
            </span>
          </div>

          {/* Recipient */}
          <div className="hidden md:flex flex-col gap-0.5">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground text-[10px]">
              Penerima
            </span>
            <span className="font-body font-bold text-foreground text-sm truncate max-w-[140px]">
              {recipient}
            </span>
          </div>
        </div>

        {/* Right Info Group (Order Number & Quick Links) */}
        <div className="flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider font-semibold text-muted-foreground text-[10px]">
              Nomor Pesanan:
            </span>
            <span className="font-heading font-bold text-foreground text-xs">
              {order.order_number}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-body font-bold">
            <Link
              href={`/profile/orders/${order.id}`}
              className="text-primary hover:underline hover:text-primary-700 transition-colors"
            >
              Lihat Detail
            </Link>
            <span className="text-foreground/30">•</span>
            <button
              onClick={() => onViewInvoice?.(order.order_number)}
              className="text-primary hover:underline hover:text-primary-700 transition-colors cursor-pointer"
            >
              Lihat Invoice
            </button>
          </div>
        </div>
      </div>

      {/* ── Optional Notification Banner ──────────────────── */}
      {showReviewAlert && (
        <div className="bg-accent-yellow border-b-2 border-foreground p-3 px-4 sm:px-6 flex justify-between items-center text-foreground">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-full bg-card border border-foreground">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <span className="font-body font-bold text-xs sm:text-sm">
              Bagikan pengalamanmu! Beri ulasan untuk robot kit ini
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="card"
              size="xs"
              onClick={() => onReview?.(order.order_number)}
              className="hidden sm:inline-flex"
            >
              Tulis Ulasan
            </Button>
            <button
              onClick={() => setShowReviewAlert(false)}
              aria-label="Tutup notifikasi ulasan"
              className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {order.status === "PENDING" && (
        <div className="bg-accent-orange/30 border-b-2 border-foreground p-3 px-4 sm:px-6 flex justify-between items-center text-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span className="font-body font-bold text-xs sm:text-sm text-foreground">
              Selesaikan pembayaranmu agar pesanan dapat segera diproses penjual.
            </span>
          </div>
          <Button
            variant="primary"
            size="xs"
            onClick={() => onPayNow?.(order.order_number)}
          >
            Bayar Sekarang
          </Button>
        </div>
      )}

      {/* ── Main Card Body ────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Status Header & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-foreground/10">
          <div>
            <h3
              id={`order-${order.id}-title`}
              className="font-heading font-bold text-lg sm:text-xl text-foreground"
            >
              {getStatusHeadline(order.status)}
            </h3>
            {order.shipment_summary && (
              <p className="font-body text-xs sm:text-sm text-muted-foreground mt-0.5">
                {order.shipment_summary}
              </p>
            )}
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* Product Snapshot Row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {/* Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <ProductImage
              src={firstItem?.image_url}
              alt={firstItem?.product_name_snapshot || "Produk RoboEdu"}
              size="full"
              className="rounded-2xl border-2 border-foreground neo-shadow-icon"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <Link
              href={`/profile/orders/${order.id}`}
              className="font-heading font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors leading-snug line-clamp-2"
            >
              {firstItem?.product_name_snapshot || "Robot Kit Edukasi"}
            </Link>

            {firstItem?.variant_name_snapshot && (
              <p className="font-body text-xs text-muted-foreground">
                Varian: <span className="font-bold text-foreground">{firstItem.variant_name_snapshot}</span>
              </p>
            )}

            {extraItemsCount > 0 && (
              <span className="w-fit bg-secondary-100 text-foreground border border-foreground px-2.5 py-0.5 rounded-full text-xs font-body font-bold mt-1">
                +{extraItemsCount} produk lainnya
              </span>
            )}

            <p className="font-body text-xs text-muted-foreground mt-1">
              Garansi & Layanan: Garansi resmi RoboEdu berlaku 30 hari sejak barang diterima.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-3 pt-2">
              {/* PENDING ACTIONS */}
              {order.status === "PENDING" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onPayNow?.(order.order_number)}
                    className="flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Bayar Sekarang
                  </Button>
                  <Button
                    variant="card"
                    size="sm"
                    onClick={() => onCancelOrder?.(order.order_number)}
                    className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800"
                  >
                    <Ban className="w-4 h-4" />
                    Batalkan
                  </Button>
                  <Link href={`/profile/orders/${order.id}`}>
                    <Button variant="card" size="sm">
                      Lihat Detail
                    </Button>
                  </Link>
                </>
              )}

              {/* PROCESSING / PAID ACTIONS */}
              {(order.status === "PAID" || order.status === "PROCESSING") && (
                <>
                  <Link href={`/profile/orders/${order.id}`}>
                    <Button variant="primary" size="sm">
                      Lihat Detail
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="card" size="sm">
                      Hubungi Bantuan
                    </Button>
                  </Link>
                </>
              )}

              {/* SHIPPED ACTIONS */}
              {order.status === "SHIPPED" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onTrackPackage?.(order.order_number)}
                    className="flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    Lacak Paket
                  </Button>
                  <Link href={`/profile/orders/${order.id}`}>
                    <Button variant="card" size="sm">
                      Lihat Detail
                    </Button>
                  </Link>
                </>
              )}

              {/* DELIVERED / COMPLETED ACTIONS */}
              {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      onBuyAgain?.(firstItem?.product_name_snapshot || "Produk")
                    }
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    Beli Lagi
                  </Button>

                  <Button
                    variant="card"
                    size="sm"
                    onClick={() => onReview?.(order.order_number)}
                    className="flex items-center gap-1.5"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    Beri Ulasan
                  </Button>

                  <Button
                    variant="card"
                    size="sm"
                    onClick={() => onTrackPackage?.(order.order_number)}
                    className="flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    Lacak Paket
                  </Button>

                  <Link href={`/profile/orders/${order.id}`}>
                    <Button variant="card" size="sm">
                      Detail
                    </Button>
                  </Link>
                </>
              )}

              {/* CANCELLED / REFUNDED ACTIONS */}
              {(order.status === "CANCELLED" || order.status === "REFUNDED") && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      onBuyAgain?.(firstItem?.product_name_snapshot || "Produk")
                    }
                    className="flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    Beli Lagi
                  </Button>
                  <Link href={`/profile/orders/${order.id}`}>
                    <Button variant="card" size="sm">
                      Lihat Detail
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
