"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Truck, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";


import { CheckoutSectionHeader } from "@/components/user/checkout/checkout-section-header";
import { CheckoutAddressCard, CheckoutAddressEmpty } from "@/components/user/checkout/checkout-address-card";
import { CheckoutOrderItem } from "@/components/user/checkout/checkout-order-item";
import {
  CheckoutShippingOption,
  type ShippingOption,
} from "@/components/user/checkout/checkout-shipping-option";
import { CheckoutVoucherWidget } from "@/components/user/checkout/checkout-voucher-widget";
import { CheckoutOrderSummary } from "@/components/user/checkout/checkout-order-summary";
import { CheckoutAddressModal } from "@/components/user/checkout/checkout-address-modal";

import type { UserAddress } from "@/types/user";
import type { CartItemDetail } from "@/types/cart";
import type { CheckoutSummary } from "@/types/order";
import type { ValidateVoucherResponseData } from "@/types/voucher";
import type { ResellerStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// MOCK DATA — diganti dengan data dari API saat backend ready
// ---------------------------------------------------------------------------

const MOCK_ADDRESSES: UserAddress[] = [
  {
    id: "addr-1",
    user_id: "user-1",
    label: "Lab Robotika & Sekolah",
    recipient_name: "Fatih Al-Ghifari",
    phone: "+62 812-9842-1109",
    address: "Laboratorium Robotika & STEM, Lantai 2 Gedung B, SMP Sains Edukasi Mandiri. Jl. Cendrawasih Raya No. 42, RT 04/RW 08",
    province: "DKI Jakarta",
    city: "Kota Jakarta Selatan",
    district: "Cilandak",
    village: "Gandaria Utara",
    postal_code: "12140",
    is_primary: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "addr-2",
    user_id: "user-1",
    label: "Rumah Pribadi",
    recipient_name: "Fatih Al-Ghifari",
    phone: "+62 812-9842-1109",
    address: "Kompleks Duta Indah Blok C3 No. 12",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Kebayoran Lama",
    village: "Pondok Pinang",
    postal_code: "12310",
    is_primary: false,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
];

const MOCK_CART_ITEMS: CartItemDetail[] = [
  {
    id: "item-1",
    product_id: "prod-1",
    variant_id: "var-1",
    product_name: "Robo Kit Car Pro (Advanced Assembly)",
    variant_name: "Arduino Compatible — Cobalt Blue",
    image_url: null,
    unit_price: 350000,
    quantity: 1,
    available_stock: 12,
    line_total: 350000,
  },
  {
    id: "item-2",
    product_id: "prod-2",
    variant_id: "var-2",
    product_name: "High-Torque DC Dinamo Motor 12V",
    variant_name: "Dual Shaft Metal Gear",
    image_url: null,
    unit_price: 50000,
    quantity: 2,
    available_stock: 48,
    line_total: 100000,
  },
];

const MOCK_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    provider_id: "prov-1",
    provider_name: "J&T",
    service: "REG",
    service_label: "Reguler (EZ)",
    badge: "Paling Populer",
    badge_variant: "green",
    estimate: "2 - 3 Hari Kerja",
    cost: 20000,
    note: "Langsung antar ke alamat",
  },
  {
    provider_id: "prov-1",
    provider_name: "J&T",
    service: "YES",
    service_label: "Fast / Next Day Super",
    badge: "Prioritas Lab",
    badge_variant: "yellow",
    estimate: "1 - 2 Hari Kerja",
    cost: 35000,
    note: "Garansi tepat waktu",
  },
];

// ---------------------------------------------------------------------------
// Checkout Page Component
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  // Address state
  const [addresses] = useState<UserAddress[]>(MOCK_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    MOCK_ADDRESSES.find((a) => a.is_primary) ?? MOCK_ADDRESSES[0] ?? null
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Cart / Items
  const cartItems = MOCK_CART_ITEMS;
  const resellerStatus: ResellerStatus = "NOT_RESELLER"; // replaced with user session data

  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    MOCK_SHIPPING_OPTIONS[0]
  );

  // Notes state
  const [notes, setNotes] = useState("");

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] =
    useState<ValidateVoucherResponseData | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived summary (will come from POST /checkout/summary when backend ready)
  const subtotal = cartItems.reduce((sum, item) => sum + item.line_total, 0);
  const shippingCost = selectedShipping.cost;
  const discountAmount = appliedVoucher?.estimated_discount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  const checkoutSummary: CheckoutSummary = {
    subtotal,
    shipping_cost: shippingCost,
    discount_amount: discountAmount,
    total,
    items: cartItems.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    })),
  };

  // Handlers
  async function handleApplyVoucher(
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: POST /vouchers/validate { code }
    // Mock validation
    if (code === "ROBOEDU10") {
      setAppliedVoucher({
        code: "ROBOEDU10",
        discount_type: "PERCENTAGE",
        discount_value: 10,
        estimated_discount: Math.round(subtotal * 0.1),
        is_valid: true,
      });
      return { success: true };
    }
    return { success: false, error: "Kode voucher tidak valid atau sudah kadaluwarsa." };
  }

  async function handleSubmitOrder() {
    if (!selectedAddress) return;
    setIsSubmitting(true);
    // TODO: POST /orders with Idempotency-Key header
    // Body: CreateOrderRequestBody {
    //   address_id: selectedAddress.id,
    //   shipping_provider_id: selectedShipping.provider_id,
    //   shipping_service: selectedShipping.service,
    //   voucher_code: appliedVoucher?.code
    // }
    // On success: redirect to midtrans_redirect_url from CreateOrderResponseData
    await new Promise((r) => setTimeout(r, 1500));
    alert("Akan diarahkan ke Midtrans Payment Gateway.");
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="bg-card rounded-2xl p-4 sm:p-5 border-2 border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-foreground tracking-tight">
              Checkout
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Konfirmasi detail pengiriman &amp; pesanan kit edukasi Anda
            </p>
          </div>
          {/* Back to Cart — use Link directly to avoid asChild DOM warning */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full border-2 border-border bg-card text-foreground font-body font-semibold text-xs neo-shadow neo-shadow-hover transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Keranjang
          </Link>
        </div>
      </section>

      {/* Main 2-Column Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============ LEFT COLUMN (7/12) ============ */}
          <div className="lg:col-span-7 space-y-6">

            {/* ---- Section 1: Alamat Pengiriman ---- */}
            <section className="bg-card rounded-2xl p-6 border-2 border-border">
              <CheckoutSectionHeader
                step={1}
                title="Alamat Pengiriman"
                subtitle="Pastikan rincian alamat dan kontak penerima sudah tepat"
                iconBg="bg-accent-yellow"
                icon={<MapPin className="w-4 h-4 text-foreground" />}
                rightElement={
                  <Button
                    onClick={() => setIsAddressModalOpen(true)}
                    variant="primary"
                    size="xs"
                    neo
                    className="rounded-full"
                  >
                    + Ganti Alamat
                  </Button>
                }
              />

              {selectedAddress ? (
                <CheckoutAddressCard
                  address={selectedAddress}
                  onManage={() => setIsAddressModalOpen(true)}
                  onEdit={() => alert("TODO: Buka form edit alamat")}
                  onChangeAddress={() => setIsAddressModalOpen(true)}
                />
              ) : (
                <CheckoutAddressEmpty
                  onAddNew={() => alert("TODO: Buka form tambah alamat baru")}
                />
              )}
            </section>

            {/* ---- Section 2: Item Pesanan ---- */}
            <section className="bg-card rounded-2xl p-6 border-2 border-border">
              <CheckoutSectionHeader
                step={2}
                title={`Item Pesanan (${cartItems.length} Produk)`}
                subtitle="Diambil langsung dari kuota produksi RoboEdu"
                iconBg="bg-accent-soft-blue"
                icon={<Package className="w-4 h-4 text-foreground" />}
                rightElement={
                  <span className="text-xs font-bold bg-accent-yellow px-2.5 py-1 rounded-full border border-border neo-shadow-icon">
                    Made-By-Order Quota
                  </span>
                }
              />

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CheckoutOrderItem
                    key={item.id}
                    item={item}
                    resellerStatus={resellerStatus}
                  />
                ))}
              </div>

              {/* QC info banner */}
              <div className="mt-4 p-3 rounded-xl bg-accent-soft-blue/30 border border-border flex items-center gap-2.5 text-xs text-foreground font-medium">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Semua pesanan dicek QC oleh teknisi RoboEdu dan dikemas aman
                  dengan bubble wrap berlapis tebal.
                </span>
              </div>
            </section>

            {/* ---- Section 3: Pilihan Kurir ---- */}
            <section className="bg-card rounded-2xl p-6 border-2 border-border">
              <CheckoutSectionHeader
                step={3}
                title="Pilihan Layanan Kurir"
                subtitle="Pengiriman resmi terintegrasi dengan tracking otomatis"
                iconBg="bg-accent-green"
                icon={<Truck className="w-4 h-4 text-foreground" />}
                rightElement={
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border-2 border-border text-xs font-black text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    J&T EXPRESS
                  </div>
                }
              />

              <div className="space-y-3">
                {MOCK_SHIPPING_OPTIONS.map((option) => (
                  <CheckoutShippingOption
                    key={`${option.provider_id}-${option.service}`}
                    option={option}
                    isSelected={selectedShipping.service === option.service}
                    onSelect={setSelectedShipping}
                  />
                ))}
              </div>
            </section>

            {/* ---- Section 4: Catatan Pengiriman ---- */}
            <section className="bg-card rounded-2xl p-6 border-2 border-border">
              <CheckoutSectionHeader
                step={4}
                title="Catatan Pengiriman"
                subtitle="Instruksi khusus kepada teknisi pengepakan atau petugas kurir"
                iconBg="bg-accent-orange"
                icon={<FileText className="w-4 h-4 text-foreground" />}
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Paket harap dititipkan di Pos Security depan Lab Robotika bila tidak ada di tempat. Hubungi WA sebelum mengantar."
                rows={2}
                className="w-full rounded-xl border-2 border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring bg-accent-butter/20 font-medium resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Opsional — Tidak mengisi catatan tidak mempengaruhi proses pengiriman.
              </p>
            </section>
          </div>

          {/* ============ RIGHT COLUMN (5/12) — Sticky ============ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            {/* Voucher Widget */}
            <CheckoutVoucherWidget
              appliedVoucher={appliedVoucher}
              onApply={handleApplyVoucher}
              onRemove={() => setAppliedVoucher(null)}
            />

            {/* Order Summary + Pay CTA */}
            <CheckoutOrderSummary
              summary={checkoutSummary}
              selectedShippingLabel={`${selectedShipping.provider_name} ${selectedShipping.service_label}`}
              voucherCode={appliedVoucher?.code ?? null}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitOrder}
            />
          </div>
        </div>
      </main>

      {/* Address Selection Modal */}
      <CheckoutAddressModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        addresses={addresses}
        selectedAddressId={selectedAddress?.id ?? null}
        onSelect={(addr) => {
          setSelectedAddress(addr);
          setIsAddressModalOpen(false);
        }}
        onAddNew={() => {
          setIsAddressModalOpen(false);
          alert("TODO: Buka form tambah alamat baru");
        }}
      />
    </div>
  );
}
