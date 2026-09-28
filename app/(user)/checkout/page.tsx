"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Package, Truck, FileText, Info, Loader2, AlertCircle } from "lucide-react";
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

// ── API response shapes (camelCase from our routes) ───────────────────────────

interface ApiCartItem {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  variantName: string | null;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
  subtotal: number;
}

interface ApiAddress {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Mappers: camelCase API → snake_case types used by components ──────────────

function mapAddress(a: ApiAddress): UserAddress {
  return {
    id: a.id,
    user_id: a.userId,
    label: a.label,
    recipient_name: a.recipientName,
    phone: a.phone,
    address: a.address,
    province: a.province,
    city: a.city,
    district: a.district,
    village: a.village,
    postal_code: a.postalCode,
    is_primary: a.isPrimary,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function mapCartItem(item: ApiCartItem): CartItemDetail {
  return {
    id: item.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_name: item.name,
    variant_name: item.variantName ?? null,
    image_url: item.imageUrl ?? null,
    unit_price: item.price,
    quantity: item.quantity,
    available_stock: item.stock,
    line_total: item.subtotal,
  };
}

// ── Page component ────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();

  // ── Loading / error state ─────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // ── Data state ────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [cartItems, setCartItems] = useState<CartItemDetail[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [resellerStatus] = useState<ResellerStatus>("NOT_RESELLER");

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [notes, setNotes] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<ValidateVoucherResponseData | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Idempotency key — generated once per page load ────────────────────
  const idempotencyKey = useRef(crypto.randomUUID());

  // ── Initial data fetch ────────────────────────────────────────────────
  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      const [addrRes, cartRes, shippingRes] = await Promise.all([
        fetch("/api/profile/addresses"),
        fetch("/api/cart"),
        fetch("/api/shipping-providers"),
      ]);

      const [addrJson, cartJson, shippingJson] = await Promise.all([
        addrRes.json(),
        cartRes.json(),
        shippingRes.json(),
      ]);

      if (!addrRes.ok) throw new Error(addrJson.message ?? "Gagal memuat alamat.");
      if (!cartRes.ok) throw new Error(cartJson.message ?? "Gagal memuat keranjang.");
      if (!shippingRes.ok) throw new Error(shippingJson.message ?? "Gagal memuat opsi kurir.");

      const mappedAddresses: UserAddress[] = (addrJson.data as ApiAddress[]).map(mapAddress);
      const mappedItems: CartItemDetail[] = (cartJson.data.items as ApiCartItem[]).map(mapCartItem);
      const options: ShippingOption[] = shippingJson.data as ShippingOption[];

      if (mappedItems.length === 0) {
        router.replace("/cart");
        return;
      }

      setAddresses(mappedAddresses);
      setSelectedAddress(
        mappedAddresses.find((a) => a.is_primary) ?? mappedAddresses[0] ?? null,
      );
      setCartItems(mappedItems);
      setShippingOptions(options);
      setSelectedShipping(options[0] ?? null);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Gagal memuat halaman checkout.");
    } finally {
      setPageLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  // ── Derived summary ───────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.line_total, 0);
  const shippingCost = selectedShipping?.cost ?? 0;
  const discountAmount = appliedVoucher?.estimated_discount ?? 0;
  // Tax 8% — shown as "Termasuk PPN" in summary, computed server-side on submit
  const taxAmount = Math.floor((subtotal - discountAmount) * 0.08);
  const total = subtotal + shippingCost - discountAmount + taxAmount;

  const checkoutSummary: CheckoutSummary = {
    subtotal,
    shipping_cost: shippingCost,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    total,
    items: cartItems.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    })),
  };

  // ── Voucher handler ───────────────────────────────────────────────────
  async function handleApplyVoucher(
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.message };
      setAppliedVoucher(json.data as ValidateVoucherResponseData);
      return { success: true };
    } catch {
      return { success: false, error: "Gagal memvalidasi voucher." };
    }
  }

  // ── Submit order ──────────────────────────────────────────────────────
  async function handleSubmitOrder() {
    if (!selectedAddress || !selectedShipping) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checkout/midtrans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          addressId: selectedAddress.id,
          shippingCost: selectedShipping.cost,
          voucherCode: appliedVoucher?.code ?? undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal membuat pesanan.");

      // Redirect to Midtrans Snap hosted page
      window.location.href = json.data.redirectUrl;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setIsSubmitting(false);
      // Rotate idempotency key so a retry is treated as a new request
      idempotencyKey.current = crypto.randomUUID();
    }
  }

  // ── Loading screen ────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="font-body text-sm">Memuat halaman checkout…</p>
        </div>
      </div>
    );
  }

  // ── Error screen ──────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="font-body text-sm text-muted-foreground">{pageError}</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => void fetchPageData()}>
              Coba Lagi
            </Button>
            <Link href="/cart">
              <Button variant="primary" size="sm">Kembali ke Keranjang</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────
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

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Section 1 — Alamat */}
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
                  onEdit={() => setIsAddressModalOpen(true)}
                  onChangeAddress={() => setIsAddressModalOpen(true)}
                />
              ) : (
                <CheckoutAddressEmpty
                  onAddNew={() => router.push("/profile/addresses")}
                />
              )}
            </section>

            {/* Section 2 — Items */}
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

              <div className="mt-4 p-3 rounded-xl bg-accent-soft-blue/30 border border-border flex items-center gap-2.5 text-xs text-foreground font-medium">
                <Info className="w-4 h-4 text-primary shrink-0" />
                Semua pesanan dicek QC oleh teknisi RoboEdu dan dikemas aman dengan bubble wrap berlapis tebal.
              </div>
            </section>

            {/* Section 3 — Kurir */}
            <section className="bg-card rounded-2xl p-6 border-2 border-border">
              <CheckoutSectionHeader
                step={3}
                title="Pilihan Layanan Kurir"
                subtitle="Pengiriman resmi terintegrasi dengan tracking otomatis"
                iconBg="bg-accent-green"
                icon={<Truck className="w-4 h-4 text-foreground" />}
                rightElement={
                  shippingOptions[0] && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border-2 border-border text-xs font-black text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {shippingOptions[0].provider_name.toUpperCase()}
                    </div>
                  )
                }
              />

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <CheckoutShippingOption
                    key={`${option.provider_id}-${option.service}`}
                    option={option}
                    isSelected={selectedShipping?.service === option.service}
                    onSelect={setSelectedShipping}
                  />
                ))}
              </div>
            </section>

            {/* Section 4 — Catatan */}
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
                placeholder="Contoh: Paket harap dititipkan di Pos Security depan Lab bila tidak ada di tempat."
                rows={2}
                className="w-full rounded-xl border-2 border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring bg-accent-butter/20 font-medium resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Opsional — tidak mempengaruhi proses pengiriman.
              </p>
            </section>
          </div>

          {/* ── RIGHT COLUMN — sticky ────────────────────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <CheckoutVoucherWidget
              appliedVoucher={appliedVoucher}
              onApply={handleApplyVoucher}
              onRemove={() => setAppliedVoucher(null)}
            />

            {/* Submit error */}
            {submitError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-body">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <CheckoutOrderSummary
              summary={checkoutSummary}
              selectedShippingLabel={
                selectedShipping
                  ? `${selectedShipping.provider_name} ${selectedShipping.service_label}`
                  : "Belum dipilih"
              }
              voucherCode={appliedVoucher?.code ?? null}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitOrder}
            />
          </div>
        </div>
      </main>

      {/* Address picker modal */}
      <CheckoutAddressModal
        open={isAddressModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddressModalOpen(false);
        }}
        addresses={addresses}
        selectedAddressId={selectedAddress?.id ?? null}
        onSelect={(addr) => {
          setSelectedAddress(addr);
          setIsAddressModalOpen(false);
        }}
        onAddNew={() => {
          setIsAddressModalOpen(false);
          router.push("/profile/addresses");
        }}
      />
    </div>
  );
}
