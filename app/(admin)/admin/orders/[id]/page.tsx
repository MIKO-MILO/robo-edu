"use client";

import React, { use, useEffect, useState } from "react";
import { RefreshCw, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  OrderDetailHeader,
  OrderItemsCard,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
  OrderStatusDialog,
} from "@/components/admin/orders";
import type { OrderLineItem, OrderPricingSummary, OrderShippingSnapshot } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Types for the API response shape from GET /api/admin/orders/[id]
// ---------------------------------------------------------------------------

interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  voucher_code_snapshot: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_village?: string;
  shipping_postal_code: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string | null;
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
    transaction_id?: string | null;
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

// ---------------------------------------------------------------------------
// Skeleton for the whole detail page
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = use(params);

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // ── Form tambah checkpoint tracking ──────────────────────────────────
  const [cpLocation, setCpLocation] = useState("");
  const [cpDescription, setCpDescription] = useState("");
  const [cpTimestamp, setCpTimestamp] = useState("");
  const [cpStatus, setCpStatus] = useState("IN_TRANSIT");
  const [cpSubmitting, setCpSubmitting] = useState(false);
  const [cpError, setCpError] = useState<string | null>(null);

  // ── Fetch detail ─────────────────────────────────────────────────────
  const [retryKey, setRetryKey] = useState(0);

  // Refetch seluruh detail order (dipakai setelah update status / tambah checkpoint).
  const refetch = React.useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message ?? `HTTP ${res.status}`);
        }
        if (!ignore) {
          setOrder(json.data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal memuat detail pesanan.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();
    return () => {
      ignore = true;
    };
  }, [id, retryKey]);

  // ── Handle status update success ─────────────────────────────────────
  const handleStatusSuccess = (newStatus: OrderStatus) => {
    setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    // Refetch agar info resi/kurir terbaru (jika SHIPPED) ikut tampil.
    refetch();
  };

  // ── Tambah checkpoint tracking ────────────────────────────────────────
  const handleAddCheckpoint = async () => {
    setCpSubmitting(true);
    setCpError(null);
    try {
      const payload: Record<string, unknown> = {
        status: cpStatus.trim() || "IN_TRANSIT",
      };
      if (cpLocation.trim()) payload.location = cpLocation.trim();
      if (cpDescription.trim()) payload.description = cpDescription.trim();
      if (cpTimestamp.trim()) payload.timestamp = cpTimestamp.trim();

      const res = await fetch(`/api/admin/orders/${id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Gagal menambahkan checkpoint.");
      }
      // Reset form & refresh
      setCpLocation("");
      setCpDescription("");
      setCpTimestamp("");
      setCpStatus("IN_TRANSIT");
      refetch();
    } catch (err) {
      setCpError(err instanceof Error ? err.message : "Gagal menambahkan checkpoint.");
    } finally {
      setCpSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) return <DetailSkeleton />;

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div>
          <p className="font-heading font-bold text-lg text-foreground">
            Gagal memuat pesanan
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {error ?? "Pesanan tidak ditemukan."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsLoading(true);
            setRetryKey((k) => k + 1);
          }}
          className="gap-2 rounded-xl"
        >
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  // ── Map API response → component props ───────────────────────────────
  const items: OrderLineItem[] = order.order_items.map((item) => ({
    id:       item.id,
    name:     item.product_name_snapshot,
    variant:  item.variant_name_snapshot ?? null,
    sku:      item.sku_snapshot,
    price:    item.price_snapshot,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const pricing: OrderPricingSummary = {
    subtotal:         order.subtotal,
    shipping_cost:    order.shipping_cost,
    discount_amount:  order.discount_amount,
    total:            order.total,
    voucher_code:     order.voucher_code_snapshot,
  };

  const customer = {
    name:  order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone ?? order.recipient_phone ?? "—",
  };

  const shipping: OrderShippingSnapshot = {
    courier:              order.shipment?.provider_name ?? "—",
    service:              order.shipment?.service        ?? "—",
    tracking_number:      order.shipment?.tracking_number ?? null,
    recipient_name:       order.recipient_name,
    recipient_phone:      order.recipient_phone,
    shipping_address:     order.shipping_address,
    shipping_province:    order.shipping_province,
    shipping_city:        order.shipping_city,
    shipping_district:    order.shipping_district,
    shipping_village:     order.shipping_village ?? "",
    shipping_postal_code: order.shipping_postal_code,
  };

  const payment = order.payment
    ? {
        status:         order.payment.status as PaymentStatus,
        method:         order.payment.payment_type,
        transaction_id: order.payment.transaction_id ?? null,
      }
    : {
        status:         "PENDING" as PaymentStatus,
        method:         "—",
        transaction_id: null,
      };

  return (
    <div className="space-y-6">
      {/* Back + Title + Status + Update button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <OrderDetailHeader
          orderNumber={order.order_number}
          status={order.status}
          createdAt={order.created_at}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStatusDialogOpen(true)}
          className="shrink-0 gap-1.5 rounded-xl self-start sm:self-auto"
        >
          <RefreshCw className="size-4" />
          Update Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items & pricing */}
        <div className="lg:col-span-2">
          <OrderItemsCard items={items} pricing={pricing} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <OrderCustomerCard customer={customer} />
          <OrderShippingCard shipping={shipping} />
          <OrderPaymentCard payment={payment} />
        </div>
      </div>

      {/* Voucher info jika ada */}
      {order.voucher_code_snapshot && (
        <div className="rounded-2xl border-2 border-border bg-accent-yellow/20 px-4 py-3 text-sm font-body text-foreground">
          Voucher digunakan:{" "}
          <span className="font-heading font-bold">{order.voucher_code_snapshot}</span>
          {order.discount_amount > 0 && (
            <span className="text-success ml-2 font-bold">
              (diskon Rp{order.discount_amount.toLocaleString("id-ID")})
            </span>
          )}
        </div>
      )}

      {/* Shipment + form tambah checkpoint — muncul bila shipment sudah ada */}
      {order.shipment && (
        <div className="bg-card rounded-2xl border-2 border-border p-4 space-y-4">
          <h3 className="font-heading font-bold text-sm text-foreground">Riwayat Pengiriman</h3>

          {order.shipment.trackings.length > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground font-body py-2">
              Belum ada checkpoint. Tambahkan pergerakan paket di bawah.
            </p>
          )}

          {/* ── Form: tambah checkpoint tracking ──────────────────────── */}
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-3">
            <p className="text-xs font-heading font-bold text-foreground flex items-center gap-1.5">
              <Plus className="size-3.5" />
              Tambah Checkpoint
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="cp-status" className="block text-[11px] font-semibold text-muted-foreground font-body">
                  Status
                </label>
                <Input
                  id="cp-status"
                  value={cpStatus}
                  onChange={(e) => setCpStatus(e.target.value)}
                  placeholder="IN_TRANSIT"
                  disabled={cpSubmitting}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="cp-location" className="block text-[11px] font-semibold text-muted-foreground font-body">
                  Lokasi
                </label>
                <Input
                  id="cp-location"
                  value={cpLocation}
                  onChange={(e) => setCpLocation(e.target.value)}
                  placeholder="cth. Hub Jakarta Selatan"
                  disabled={cpSubmitting}
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="cp-description" className="block text-[11px] font-semibold text-muted-foreground font-body">
                Deskripsi
              </label>
              <Input
                id="cp-description"
                value={cpDescription}
                onChange={(e) => setCpDescription(e.target.value)}
                placeholder="cth. Paket tiba di sorting center"
                disabled={cpSubmitting}
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="cp-timestamp" className="block text-[11px] font-semibold text-muted-foreground font-body">
                Waktu (opsional — kosongkan untuk sekarang)
              </label>
              <Input
                id="cp-timestamp"
                type="datetime-local"
                value={cpTimestamp}
                onChange={(e) => setCpTimestamp(e.target.value)}
                disabled={cpSubmitting}
                className="h-9 rounded-xl text-xs"
              />
            </div>

            {cpError && (
              <p className="text-xs text-danger font-body flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 shrink-0" />
                {cpError}
              </p>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleAddCheckpoint}
              disabled={cpSubmitting || (!cpLocation.trim() && !cpDescription.trim())}
              className="gap-2 w-full sm:w-auto"
            >
              {cpSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Tambah Checkpoint</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Status update dialog */}
      <OrderStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        orderId={order.id}
        orderNumber={order.order_number}
        currentStatus={order.status}
        onSuccess={handleStatusSuccess}
      />
    </div>
  );
}
