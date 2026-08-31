"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./order-status-badge";
import type { OrderListItem } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format IDR tanpa fraksi desimal */
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format tanggal ke format Indonesia — contoh: "18 Agt 2026, 10:30" */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Thumbnail produk pertama dengan fallback placeholder */
function ProductThumbnail({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  if (!imageUrl) {
    return (
      <div
        className="size-16 sm:size-20 rounded-xl bg-muted border-2 border-foreground
                   flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <ShoppingBag className="size-7 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="size-16 sm:size-20 rounded-xl border-2 border-foreground neo-shadow-icon overflow-hidden shrink-0">
      <Image
        src={imageUrl}
        alt={name}
        width={80}
        height={80}
        className="size-full object-cover"
      />
    </div>
  );
}

/** Tombol aksi kondisional sesuai status */
function OrderActionButtons({ order }: { order: OrderListItem }) {
  const detailHref = `/profile/orders/${order.id}`;

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* Status-specific actions */}
      {order.status === "PENDING" && (
        <>
          <Button
            variant="danger"
            size="sm"
            neo={false}
            className="text-xs"
            aria-label={`Batalkan pesanan ${order.order_number}`}
          >
            Batalkan
          </Button>
          <Button
            variant="warning"
            size="sm"
            neo
            className="text-xs font-bold"
            aria-label={`Bayar pesanan ${order.order_number}`}
          >
            Bayar Sekarang
          </Button>
        </>
      )}

      {order.status === "COMPLETED" && (
        <Button
          variant="accent-green"
          size="sm"
          neo
          className="text-xs"
          aria-label={`Beri ulasan untuk pesanan ${order.order_number}`}
        >
          Beri Ulasan
        </Button>
      )}

      {/* Always visible */}
      <Button variant="secondary" size="sm" neo asChild>
        <Link
          href={detailHref}
          aria-label={`Lihat detail pesanan ${order.order_number}`}
        >
          Lihat Detail
        </Link>
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component — OrderCard
// ─────────────────────────────────────────────────────────────────────────────
interface OrderCardProps {
  order: OrderListItem;
}

export function OrderCard({ order }: OrderCardProps) {
  const { first_item, item_count } = order;
  const extraCount = item_count - 1;

  return (
    <article
      className="bg-card border-2 border-foreground neo-shadow rounded-2xl
                 overflow-hidden transition-shadow duration-150 hover:shadow-[6px_6px_0px_0px_#3D2900]"
      aria-label={`Pesanan ${order.order_number}`}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-muted/60 border-b-2 border-foreground">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-sm text-foreground truncate">
            {order.order_number}
          </span>
          <span className="text-muted-foreground text-xs hidden sm:inline shrink-0">
            •
          </span>
          <time
            dateTime={order.created_at}
            className="font-body text-xs text-muted-foreground shrink-0 hidden sm:block"
          >
            {formatDate(order.created_at)}
          </time>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* Tanggal mobile-only (dibawah header) */}
      <div className="sm:hidden px-4 pt-2">
        <time
          dateTime={order.created_at}
          className="font-body text-xs text-muted-foreground"
        >
          {formatDate(order.created_at)}
        </time>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4">
        <ProductThumbnail
          imageUrl={first_item.image_url}
          name={first_item.product_name_snapshot}
        />

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <p className="font-body font-semibold text-sm text-foreground line-clamp-2 leading-snug">
            {first_item.product_name_snapshot}
            {first_item.variant_name_snapshot && (
              <span className="font-normal text-muted-foreground">
                {" "}— {first_item.variant_name_snapshot}
              </span>
            )}
          </p>

          {extraCount > 0 && (
            <p className="font-body text-xs text-muted-foreground">
              +{extraCount} produk lainnya
            </p>
          )}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t-2 border-foreground flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-body text-xs text-muted-foreground">Total Pembayaran</span>
          <span className="font-heading font-bold text-base text-foreground">
            {formatRupiah(order.total)}
          </span>
        </div>

        <OrderActionButtons order={order} />
      </div>
    </article>
  );
}
