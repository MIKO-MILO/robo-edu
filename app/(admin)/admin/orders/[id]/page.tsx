"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import {
  OrderDetailHeader,
  OrderItemsCard,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
} from "@/components/admin/orders";
import type { OrderLineItem, OrderPricingSummary } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  voucher_code_snapshot: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_district: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  order_items: Array<{
    id: string;
    product_id: string;
    variant_id: string | null;
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    sku_snapshot: string;
    price_snapshot: number;
    quantity: number;
    subtotal: number;
  }>;
  payment: {
    status: PaymentStatus;
    payment_type: string;
    transaction_id: string;
    amount: number;
    transaction_time: string | null;
    expiry_time: string | null;
  } | null;
  shipment: {
    tracking_number: string | null;
    service: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
    provider_name: string | null;
    trackings: Array<{
      id: string;
      status: string;
      description: string | null;
      location: string | null;
      occurred_at: string;
    }>;
  } | null;
}

// Status yang bisa dipilih admin untuk diupdate
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending",    label: "Menunggu (Pending)" },
  { value: "paid",       label: "Dibayar (Paid)" },
  { value: "processing", label: "Diproses (Processing)" },
  { value: "shipped",    label: "Dikirim (Shipped)" },
  { value: "delivered",  label: "Terkirim (Delivered)" },
  { value: "completed",  label: "Selesai (Completed)" },
  { value: "cancelled",  label: "Dibatalkan (Cancelled)" },
];

// ---------------------------------------------------------------------------
// Status Updater Component
// ---------------------------------------------------------------------------
function StatusUpdater({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdated: (newStatus: OrderStatus) => void;
}) {
  const [selected, setSelected] = useState(currentStatus.toLowerCase());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdate = async () => {
    if (selected === currentStatus.toLowerCase()) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Gagal update status");
      setMessage({ type: "success", text: json.message });
      onUpdated(selected.toUpperCase() as OrderStatus);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-3">
      <h3 className="font-heading font-bold text-sm text-foreground">Update Status Pesanan</h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={isLoading}
            className="w-full appearance-none rounded-xl border-2 border-border bg-background px-3 py-2 pr-8 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleUpdate}
          disabled={isLoading || selected === currentStatus.toLowerCase()}
          className="rounded-xl gap-1.5 shrink-0"
        >
          {isLoading ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Simpan
        </Button>
      </div>

      {message && (
        <p
          className={`text-xs font-body px-2 py-1.5 rounded-lg ${
            message.type === "success"
              ? "bg-success/10 text-success border border-success/30"
              : "bg-destructive/10 text-destructive border border-destructive/30"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = use(params);

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Gagal memuat pesanan");
      setOrder(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (isLoading) return <DetailSkeleton />;

  if (error || !order) {
    return (
      <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 px-6 py-8 text-center space-y-2">
        <p className="font-heading font-bold text-destructive">Pesanan tidak ditemukan</p>
        <p className="text-sm text-muted-foreground font-body">{error}</p>
      </div>
    );
  }

  // ── Map API data ke props komponen ──────────────────────────────────────
  const lineItems: OrderLineItem[] = order.order_items.map((item) => ({
    id: item.id,
    name: item.product_name_snapshot,
    variant: item.variant_name_snapshot,
    sku: item.sku_snapshot,
    price: item.price_snapshot,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const pricing: OrderPricingSummary = {
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    discount_amount: order.discount_amount,
    total: order.total,
  };

  const fullAddress = [
    order.shipping_address,
    order.shipping_district,
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Back + Title + Status */}
      <OrderDetailHeader
        orderNumber={order.order_number}
        status={order.status}
        createdAt={order.created_at}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items & pricing */}
        <div className="lg:col-span-2">
          <OrderItemsCard items={lineItems} pricing={pricing} />
        </div>

        {/* Right — Customer, Status updater, Shipping, Payment */}
        <div className="space-y-6">
          <OrderCustomerCard customer={order.customer} />

          <StatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            onUpdated={(newStatus) =>
              setOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
            }
          />

          <OrderShippingCard
            shipping={{
              courier: order.shipment?.provider_name ?? "Belum ada",
              service: order.shipment?.service ?? "-",
              tracking_number: order.shipment?.tracking_number ?? null,
              address: fullAddress,
            }}
          />

          <OrderPaymentCard
            payment={{
              status: (order.payment?.status ?? "PENDING") as PaymentStatus,
              method: order.payment?.payment_type ?? "-",
              transaction_id: order.payment?.transaction_id ?? null,
            }}
          />
        </div>
      </div>

      {/* Voucher info jika ada */}
      {order.voucher_code_snapshot && (
        <div className="rounded-2xl border-2 border-border bg-accent-yellow/20 px-4 py-3 text-sm font-body text-foreground">
          Voucher digunakan:{" "}
          <span className="font-heading font-bold">{order.voucher_code_snapshot}</span>
          {order.discount_amount > 0 && (
            <span className="text-success ml-2">
              (diskon Rp{order.discount_amount.toLocaleString("id-ID")})
            </span>
          )}
        </div>
      )}

      {/* Shipment trackings jika ada */}
      {order.shipment && order.shipment.trackings.length > 0 && (
        <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-3">
          <h3 className="font-heading font-bold text-sm text-foreground">Riwayat Pengiriman</h3>
          <ol className="relative border-l-2 border-border space-y-4 pl-4">
            {order.shipment.trackings.map((t) => (
              <li key={t.id} className="relative">
                <div className="absolute -left-[1.125rem] top-1 size-3 rounded-full border-2 border-primary bg-background" />
                <p className="font-heading font-bold text-xs text-foreground">{t.status}</p>
                {t.description && (
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{t.description}</p>
                )}
                {t.location && (
                  <p className="text-[11px] text-muted-foreground font-body">{t.location}</p>
                )}
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  }).format(new Date(t.occurred_at))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
