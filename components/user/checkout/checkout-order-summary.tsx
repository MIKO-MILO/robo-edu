"use client";

import { ArrowRight, ShieldCheck, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckoutSummary } from "@/types/order";

interface CheckoutOrderSummaryProps {
  summary: CheckoutSummary | null;
  selectedShippingLabel: string;
  voucherCode: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
}

/** Format IDR currency */
function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Payment method badges used via Midtrans */
const PAYMENT_METHODS = [
  { label: "BCA", color: "text-blue-800" },
  { label: "BNI", color: "text-orange-600" },
  { label: "BRI", color: "text-blue-600" },
  { label: "Mandiri", color: "text-yellow-600" },
  { label: "QRIS", color: "text-blue-500" },
  { label: "GoPay", color: "text-emerald-600" },
  { label: "ShopeePay", color: "text-orange-500" },
  { label: "DANA", color: "text-blue-700" },
] as const;

const TRUST_BADGES = [
  {
    icon: <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />,
    text: "100% Pembayaran Aman via Midtrans Payment Gateway",
  },
  {
    icon: <Package className="w-4 h-4 shrink-0 text-primary" />,
    text: "Garansi Resmi & Penggantian Komponen Kit Cacat Pabrik",
  },
  {
    icon: <Mail className="w-4 h-4 shrink-0 text-primary" />,
    text: "Invoice otomatis & nomor resi dikirimkan ke Email & WhatsApp",
  },
] as const;

/**
 * CheckoutOrderSummary
 * Sidebar kanan: ringkasan biaya, tombol CTA bayar, metode pembayaran, dan trust badges.
 * - summary dari POST /checkout/summary (types/order.ts CheckoutSummary)
 * - Tombol onSubmit mengirim POST /orders (CreateOrderRequestBody)
 */
export function CheckoutOrderSummary({
  summary,
  selectedShippingLabel,
  voucherCode,
  isSubmitting,
  onSubmit,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-card rounded-2xl p-6 border-2 border-border">
      <h3 className="font-heading font-black text-lg text-foreground mb-4 pb-2 border-b-2 border-border/15">
        Ringkasan Pembayaran
      </h3>

      {/* Breakdown rows */}
      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">
            Subtotal Produk
            {summary ? ` (${summary.items.length} Item)` : ""}
          </span>
          <span className="font-bold text-foreground">
            {summary ? formatIDR(summary.subtotal) : "—"}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">
            Biaya Pengiriman{selectedShippingLabel ? ` (${selectedShippingLabel})` : ""}
          </span>
          <span className="font-bold text-foreground">
            {summary ? formatIDR(summary.shipping_cost) : "—"}
          </span>
        </div>

        {/* Service fee */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">
            Biaya Layanan &amp; Asuransi
          </span>
          <span className="font-bold text-emerald-700 bg-accent-green/30 px-2 py-0.5 rounded text-xs">
            GRATIS
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">
            Diskon Promo{voucherCode ? ` (${voucherCode})` : ""}
          </span>
          {summary && summary.discount_amount > 0 ? (
            <span className="font-heading font-bold text-emerald-700">
              -{formatIDR(summary.discount_amount)}
            </span>
          ) : (
            <span className="font-bold text-muted-foreground">—</span>
          )}
        </div>

        {/* Total */}
        <div className="pt-4 mt-2 border-t-2 border-dashed border-border">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-bold uppercase text-muted-foreground block">
                Total Pembayaran
              </span>
              <span className="text-[11px] text-muted-foreground">
                Termasuk PPN &amp; Jaminan QC
              </span>
            </div>
            <div className="text-right">
              <span className="font-heading font-black text-2xl sm:text-3xl text-primary tracking-tight">
                {summary ? formatIDR(summary.total) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !summary}
          variant="primary"
          neo
          className="w-full py-4 rounded-full font-heading font-black text-base flex items-center justify-center gap-3"
        >
          <span>{isSubmitting ? "Memproses..." : "Bayar Sekarang"}</span>
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground font-medium mt-2">
          Dengan menekan tombol, Anda menyetujui Ketentuan Belanja RoboEdu
        </p>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 pt-5 border-t-2 border-border/15">
        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider block mb-3 text-center">
          Didukung Pembayaran Instan &amp; Otomatis:
        </span>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.label}
              className={`h-9 rounded-lg border border-border/40 bg-card flex items-center justify-center p-1 text-[11px] font-black ${method.color}`}
            >
              {method.label}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-5 space-y-2.5 pt-4 border-t border-border/20 text-xs">
        {TRUST_BADGES.map((badge, i) => (
          <div key={i} className="flex items-start gap-2.5 text-foreground">
            {badge.icon}
            <span className="font-medium">{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
