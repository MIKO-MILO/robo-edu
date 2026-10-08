"use client";

import React, { use, useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  OrderDetailHeader,
  OrderItemsCard,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
  OrderStatusDialog,
} from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";
import type { OrderLineItem, OrderPricingSummary } from "@/components/admin/orders";

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
  shipping_village: string;
  shipping_postal_code: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
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

  // ── Fetch detail ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message ?? `HTTP ${res.status}`);
      }
      setOrder(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Handle status update success ─────────────────────────────────────
  const handleStatusSuccess = (newStatus: OrderStatus) => {
    setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) return <DetailSkeleton />;

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-danger-bg text-danger">
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
        <Button variant="outline" size="sm" onClick={load} className="gap-2 rounded-xl">
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
  };

  const customer = {
    name:  order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone ?? order.recipient_phone,
  };

  const shipping = {
    courier:         order.shipment?.provider_name ?? "—",
    service:         order.shipment?.service        ?? "—",
    tracking_number: order.shipment?.tracking_number ?? null,
    address: [
      order.shipping_address,
      order.shipping_village,
      order.shipping_district,
      order.shipping_city,
      order.shipping_province,
      order.shipping_postal_code,
    ]
      .filter(Boolean)
      .join(", "),
  };

  const payment = order.payment
    ? {
        status:         order.payment.status as PaymentStatus,
        method:         order.payment.payment_type,
        transaction_id: null,
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
