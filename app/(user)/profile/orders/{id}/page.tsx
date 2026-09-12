"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Package, MapPin, CreditCard, Truck,
  CheckCircle2, Clock, MapPinIcon, Copy, Check,
  Loader2, AlertCircle, Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/user/orders/order-status-badge";
import type { OrderStatus } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  product_name_snapshot: string;
  variant_name_snapshot: string | null;
  sku_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
}

interface TrackingEntry {
  id: string;
  status: string;
  description: string | null;
  location: string | null;
  occurred_at: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total: number;
  voucher_code_snapshot: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_district: string;
  shipping_village: string;
  shipping_postal_code: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  order_items: OrderItem[];
  payment: {
    status: string;
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
    trackings: TrackingEntry[];
  } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null, withTime = false) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

function formatPaymentType(type: string) {
  const map: Record<string, string> = {
    bank_transfer: "Transfer Bank",
    gopay: "GoPay",
    qris: "QRIS",
    credit_card: "Kartu Kredit",
    cstore: "Minimarket",
    echannel: "Mandiri Bill",
  };
  return map[type] ?? type;
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border-2 border-foreground rounded-2xl neo-shadow overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b-2 border-foreground bg-muted/30">
        <span className="text-primary">{icon}</span>
        <h2 className="font-heading font-bold text-base text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Tracking timeline ─────────────────────────────────────────────────────────
function TrackingTimeline({ trackings }: { trackings: TrackingEntry[] }) {
  if (trackings.length === 0) {
    return (
      <p className="font-body text-sm text-muted-foreground text-center py-4">
        Belum ada riwayat pergerakan paket.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {trackings.map((t, idx) => {
        const isFirst = idx === 0;
        return (
          <div key={t.id} className="relative flex gap-4">
            {idx !== trackings.length - 1 && (
              <span className="absolute left-3.5 top-7 -bottom-4 w-0.5 bg-foreground/20" aria-hidden="true" />
            )}
            <div className={`relative z-10 w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 ${
              isFirst ? "bg-accent-green neo-shadow-icon" : "bg-muted"
            }`}>
              {isFirst
                ? <CheckCircle2 className="w-4 h-4 text-foreground stroke-[2.5]" />
                : <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </div>
            <div className="flex flex-col gap-0.5 flex-1 pb-3">
              <p className={`font-body text-sm leading-snug ${isFirst ? "font-bold text-foreground" : "text-foreground/80"}`}>
                {t.description ?? t.status}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                {t.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                    {t.location}
                  </span>
                )}
                {t.location && <span>•</span>}
                <span>{formatDate(t.occurred_at, true)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat detail pesanan.");
        setOrder(json.data as OrderDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat detail pesanan.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  function copyTrackingNumber() {
    if (!order?.shipment?.tracking_number) return;
    void navigator.clipboard.writeText(order.shipment.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-body text-sm">Memuat detail pesanan...</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="font-body text-sm text-muted-foreground">{error ?? "Pesanan tidak ditemukan."}</p>
        <Link href="/profile/orders">
          <Button variant="outline" size="sm">Kembali ke Riwayat Pesanan</Button>
        </Link>
      </div>
    );
  }

  const fullAddress = [
    order.shipping_address,
    order.shipping_village,
    order.shipping_district,
    order.shipping_city,
    order.shipping_province,
    order.shipping_postal_code,
  ].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Back + Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/profile/orders">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">
              {order.order_number}
            </h1>
            <p className="font-body text-xs text-muted-foreground">
              Dipesan {formatDate(order.created_at, true)}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Kolom kiri (2/3) ──────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Produk yang dipesan */}
          <Section title="Produk Dipesan" icon={<Package className="w-4 h-4" />}>
            <div className="flex flex-col divide-y divide-border">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-foreground leading-snug">
                      {item.product_name_snapshot}
                    </p>
                    {item.variant_name_snapshot && (
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {item.variant_name_snapshot}
                      </p>
                    )}
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      SKU: {item.sku_snapshot}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {formatRupiah(item.price_snapshot)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-heading font-bold text-sm text-foreground shrink-0">
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Ringkasan harga */}
            <div className="mt-4 pt-4 border-t-2 border-foreground flex flex-col gap-2">
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>Biaya Pengiriman</span>
                <span className="text-foreground">
                  {order.shipping_cost === 0 ? (
                    <span className="text-emerald-600 font-semibold">GRATIS</span>
                  ) : formatRupiah(order.shipping_cost)}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between font-body text-sm text-emerald-700">
                  <span>Diskon Voucher {order.voucher_code_snapshot ? `(${order.voucher_code_snapshot})` : ""}</span>
                  <span className="font-semibold">−{formatRupiah(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border mt-1">
                <span className="font-heading font-bold text-base text-foreground">Total Pembayaran</span>
                <span className="font-heading font-bold text-lg text-primary">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </Section>

          {/* Pengiriman + tracking */}
          {order.shipment && (
            <Section title="Informasi Pengiriman" icon={<Truck className="w-4 h-4" />}>
              {/* Info kurir */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted rounded-xl border border-border mb-4">
                <div>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Kurir</p>
                  <p className="font-heading font-bold text-sm text-foreground">
                    {order.shipment.provider_name ?? "-"}
                    {order.shipment.service ? ` · ${order.shipment.service}` : ""}
                  </p>
                </div>
                {order.shipment.tracking_number && (
                  <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border">
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Nomor Resi</p>
                      <p className="font-heading font-bold text-xs text-foreground tracking-wide">
                        {order.shipment.tracking_number}
                      </p>
                    </div>
                    <button
                      onClick={copyTrackingNumber}
                      aria-label="Salin nomor resi"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      {copied
                        ? <Check className="w-4 h-4 text-emerald-600" />
                        : <Copy className="w-4 h-4 text-muted-foreground" />
                      }
                    </button>
                  </div>
                )}
              </div>
              {/* Timeline */}
              <TrackingTimeline trackings={order.shipment.trackings} />
            </Section>
          )}
        </div>

        {/* ── Kolom kanan (1/3) ─────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Alamat pengiriman */}
          <Section title="Alamat Pengiriman" icon={<MapPin className="w-4 h-4" />}>
            <p className="font-heading font-bold text-sm text-foreground">{order.recipient_name}</p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">{order.recipient_phone}</p>
            <p className="font-body text-sm text-foreground mt-2 leading-relaxed">{fullAddress}</p>
          </Section>

          {/* Pembayaran */}
          <Section title="Pembayaran" icon={<CreditCard className="w-4 h-4" />}>
            {order.payment ? (
              <div className="flex flex-col gap-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-semibold text-foreground">
                    {formatPaymentType(order.payment.payment_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold ${
                    order.payment.status === "PAID" ? "text-emerald-600" :
                    order.payment.status === "FAILED" || order.payment.status === "EXPIRED" ? "text-red-500" :
                    "text-amber-600"
                  }`}>
                    {order.payment.status === "PAID" ? "Lunas" :
                     order.payment.status === "PENDING" ? "Menunggu" :
                     order.payment.status === "EXPIRED" ? "Kadaluarsa" :
                     order.payment.status === "FAILED" ? "Gagal" :
                     order.payment.status}
                  </span>
                </div>
                {order.payment.transaction_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu Bayar</span>
                    <span className="text-foreground text-right">
                      {formatDate(order.payment.transaction_time, true)}
                    </span>
                  </div>
                )}
                {order.payment.expiry_time && order.payment.status === "PENDING" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batas Bayar</span>
                    <span className="text-red-500 font-semibold text-right">
                      {formatDate(order.payment.expiry_time, true)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Data pembayaran tidak tersedia.</p>
            )}
          </Section>

          {/* Timeline status pesanan */}
          <Section title="Status Pesanan" icon={<Receipt className="w-4 h-4" />}>
            <div className="flex flex-col gap-3">
              {[
                { label: "Pesanan Dibuat", date: order.created_at, done: true },
                { label: "Pembayaran Diterima", date: order.paid_at, done: !!order.paid_at },
                { label: "Pesanan Dikirim", date: order.shipped_at, done: !!order.shipped_at },
                { label: "Pesanan Tiba", date: order.delivered_at, done: !!order.delivered_at },
                { label: "Selesai", date: order.completed_at, done: !!order.completed_at },
              ].map((step, idx, arr) => (
                <div key={step.label} className="relative flex items-start gap-3">
                  {idx !== arr.length - 1 && (
                    <span className="absolute left-3 top-6 w-0.5 h-full bg-border" aria-hidden="true" />
                  )}
                  <div className={`relative z-10 w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center shrink-0 ${
                    step.done ? "bg-accent-green" : "bg-muted"
                  }`}>
                    {step.done
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-foreground" />
                      : <span className="w-2 h-2 rounded-full bg-border" />
                    }
                  </div>
                  <div className="pb-2">
                    <p className={`font-body text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {formatDate(step.date, true)}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Cancelled */}
              {order.cancelled_at && (
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-6 h-6 rounded-full border-2 border-foreground bg-accent-peach flex items-center justify-center shrink-0">
                    <AlertCircle className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">Dibatalkan</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.cancelled_at, true)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
