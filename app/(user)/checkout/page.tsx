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
import { AddressForm, type AddressFormData } from "@/components/user/profile/address-form";
import { getSavedAddressNotes, saveAddressNotes } from "@/lib/address-notes";
import type { SelectedPayment } from "@/components/user/checkout/checkout-payment-method-selector";

import type { UserAddress } from "@/types/user";
import type { CartItemDetail } from "@/types/cart";
import type { CheckoutSummary } from "@/types/order";
import type { ValidateVoucherResponseData } from "@/types/voucher";
import type { MembershipStatus } from "@/types/enums";

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
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>("NOT_MEMBER");

  // ── UI state ──────────────────────────────────────────────────────────
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [notes, setNotes] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<ValidateVoucherResponseData | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddressData, setEditingAddressData] = useState<AddressFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<SelectedPayment | null>(null);

  // ── Idempotency key — generated once per page load ────────────────────
  const idempotencyKey = useRef(crypto.randomUUID());

  // ── Initial data fetch ────────────────────────────────────────────────
  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    setPageError(null);
    try {
      // Read the selection made on the cart page (written by cart/page.tsx
      // before navigating here). Falls back to null when absent, which means
      // "use all cart items" — preserving the previous behaviour.
      let selectedCartIds: string[] | null = null;
      try {
        const raw = sessionStorage.getItem("checkout_selected_ids");
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every((v) => typeof v === "string")
          ) {
            selectedCartIds = parsed as string[];
          }
        }
      } catch {
        // sessionStorage unavailable or JSON malformed — fall back to full cart
      }

      const [addrRes, cartRes, shippingRes, membershipRes] = await Promise.all([
        fetch("/api/profile/addresses"),
        fetch("/api/cart"),
        fetch("/api/shipping-providers"),
        fetch("/api/membership/me"),
      ]);

      const [addrJson, cartJson, shippingJson] = await Promise.all([
        addrRes.json(),
        cartRes.json(),
        shippingRes.json(),
      ]);

      // Membership fetch dikonsumsi terpisah — gagal tidak menghentikan checkout
      if (membershipRes.ok) {
        try {
          const membershipJson = await membershipRes.json();
          if (membershipJson?.data?.membership_status) {
            setMembershipStatus(membershipJson.data.membership_status as MembershipStatus);
          }
        } catch {
          // JSON parse gagal — biarkan status tetap NOT_MEMBER
        }
      }

      if (!addrRes.ok) throw new Error(addrJson.message ?? "Gagal memuat alamat.");
      if (!cartRes.ok) throw new Error(cartJson.message ?? "Gagal memuat keranjang.");
      if (!shippingRes.ok) throw new Error(shippingJson.message ?? "Gagal memuat opsi kurir.");

      const mappedAddresses: UserAddress[] = (addrJson.data as ApiAddress[]).map(mapAddress);
      const allItems: CartItemDetail[] = (cartJson.data.items as ApiCartItem[]).map(mapCartItem);

      // Apply selection filter: when selectedCartIds is set, show only those
      // items. If the filtered result is empty (IDs no longer in cart), the
      // existing empty-cart guard below will redirect back to /cart.
      const mappedItems: CartItemDetail[] =
        selectedCartIds !== null
          ? allItems.filter((item) => selectedCartIds!.includes(item.id))
          : allItems;

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

  // Sync catatan pengiriman dari alamat yang dipilih
  useEffect(() => {
    if (!selectedAddress) {
      setNotes("");
      return;
    }
    const saved = getSavedAddressNotes({
      recipientName: selectedAddress.recipient_name,
      phone: selectedAddress.phone,
      address: selectedAddress.address,
      postalCode: selectedAddress.postal_code,
    });
    setNotes(saved);
  }, [selectedAddress]);

  // ── Derived summary ───────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.line_total, 0);
  const shippingCost = selectedShipping?.cost ?? 0;
  const discountAmount = appliedVoucher?.estimated_discount ?? 0;
  // Tax 8% — preview di client, kalkulasi final dilakukan server-side saat submit
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
  // Fungsi validasi dipakai baik saat user menekan "Terapkan" maupun saat
  // revalidasi otomatis ketika subtotal berubah (item cart diedit).
  async function validateVoucherCode(
    code: string,
    currentSubtotal: number,
  ): Promise<{ success: boolean; data?: ValidateVoucherResponseData; error?: string }> {
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: currentSubtotal }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, error: json.message };
      return { success: true, data: json.data as ValidateVoucherResponseData };
    } catch {
      return { success: false, error: "Gagal memvalidasi voucher." };
    }
  }

  async function handleApplyVoucher(
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await validateVoucherCode(code, subtotal);
    if (result.success && result.data) {
      setAppliedVoucher(result.data);
    }
    return { success: result.success, error: result.error };
  }

  // ── Revalidasi voucher saat subtotal berubah ──────────────────────────
  // Dipanggil via useEffect ketika subtotal atau appliedVoucher.code berubah.
  // Jika voucher sudah tidak valid (misal subtotal turun di bawah minimum),
  // voucher dilepas otomatis dan user diberitahu melalui submitError sementara.
  useEffect(() => {
    if (!appliedVoucher) return;

    // Subtotal 0 berarti cart kosong — tidak ada yang perlu direvalidasi
    if (subtotal === 0) {
      setAppliedVoucher(null);
      return;
    }

    let cancelled = false;
    validateVoucherCode(appliedVoucher.code, subtotal).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        // Update estimated_discount sesuai subtotal terbaru
        setAppliedVoucher(result.data);
      } else {
        // Voucher tidak lagi valid — lepas otomatis
        setAppliedVoucher(null);
        setSubmitError(
          result.error
            ? `Voucher dilepas: ${result.error}`
            : "Voucher tidak lagi memenuhi syarat dan telah dilepas.",
        );
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // ── Address form inline handlers ───────────────────────────────────────
  function openAddAddressForm() {
    setEditingAddressId(null);
    setEditingAddressData(null);
    setIsAddressFormOpen(true);
  }

  function openEditAddressForm(addr: UserAddress) {
    setEditingAddressId(addr.id);
    setEditingAddressData({
      label: addr.label ?? "",
      recipientName: addr.recipient_name,
      phone: addr.phone,
      address: addr.address,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      village: addr.village ?? "",
      postalCode: addr.postal_code ?? "",
      isPrimary: addr.is_primary,
      notes: getSavedAddressNotes({
        recipientName: addr.recipient_name,
        phone: addr.phone,
        address: addr.address,
        postalCode: addr.postal_code,
      }),
    });
    setIsAddressFormOpen(true);
  }

  async function handleSaveAddress(data: AddressFormData) {
    const isEditing = Boolean(editingAddressId);
    const url = isEditing
      ? `/api/profile/addresses/${editingAddressId}`
      : "/api/profile/addresses";

    const res = await fetch(url, {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Gagal menyimpan alamat.");

    saveAddressNotes(data, data.notes ?? "");
    setNotes((data.notes ?? "").trim());
    await fetchPageData();
  }

  // ── Submit order ──────────────────────────────────────────────────────
  async function handleSubmitOrder() {
    // Guard: alamat, kurir, dan metode pembayaran wajib dipilih
    if (!selectedAddress) {
      setSubmitError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    if (!selectedShipping) {
      setSubmitError("Pilih layanan kurir terlebih dahulu.");
      return;
    }
    if (!selectedPayment) {
      setSubmitError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    // Guard OVO: nomor HP wajib diisi
    if (selectedPayment.method.channel === "ovo" && !selectedPayment.ovoPhone) {
      setSubmitError("Masukkan nomor HP OVO terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Revalidasi voucher sekali lagi tepat sebelum submit untuk mencegah
    // race condition (voucher bisa diklaim orang lain di sela-sela waktu ini)
    let finalVoucherCode: string | undefined = undefined;
    if (appliedVoucher) {
      const check = await validateVoucherCode(appliedVoucher.code, subtotal);
      if (check.success && check.data) {
        finalVoucherCode = check.data.code;
        setAppliedVoucher(check.data); // refresh estimasi
      } else {
        setAppliedVoucher(null);
        setSubmitError(
          check.error
            ? `Voucher tidak valid saat checkout: ${check.error}`
            : "Voucher sudah tidak berlaku. Silakan coba lagi tanpa voucher.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Read the selected IDs one more time from sessionStorage — the same
      // values that were used to filter the displayed items.
      let itemIds: string[] | undefined;
      try {
        const raw = sessionStorage.getItem("checkout_selected_ids");
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every((v) => typeof v === "string")
          ) {
            itemIds = parsed as string[];
          }
        }
      } catch {
        // sessionStorage unavailable — omit itemIds (backend falls back to all items)
      }

      const res = await fetch("/api/checkout/midtrans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          addressId: selectedAddress.id,
          shippingCost: selectedShipping.cost,
          providerId: selectedShipping.provider_id,
          voucherCode: finalVoucherCode,
          notes: notes.trim() || undefined,
          // Metode pembayaran yang dipilih user
          paymentMethod: selectedPayment!.method.method,
          paymentChannel: selectedPayment!.method.channel,
          ovoPhone: selectedPayment!.method.channel === "ovo" ? selectedPayment!.ovoPhone : undefined,
          // Selected cart item IDs — only these items will be ordered and
          // removed from the cart; any unselected items remain in the cart.
          itemIds,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal membuat pesanan.");

      // Clear the selection from sessionStorage now that the order is placed.
      // This ensures a subsequent checkout of the remaining cart items starts
      // fresh (falls back to all items) rather than reusing the stale selection.
      try {
        sessionStorage.removeItem("checkout_selected_ids");
      } catch {
        // sessionStorage unavailable — not critical
      }

      // Redirect ke halaman pembayaran dedicated (Snap popup) — bukan ke hosted Midtrans page
      router.push(`/payment/${json.data.orderId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
      setIsSubmitting(false);
      // Rotate idempotency key agar retry diperlakukan sebagai request baru
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
            <Button variant="outline" size="sm" neo={false} onClick={() => void fetchPageData()}>
              Coba Lagi
            </Button>
            <Link href="/cart">
              <Button variant="primary" size="sm" neo={false}>Kembali ke Keranjang</Button>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 lg:pt-44 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
            className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full border border-primary bg-card hover:bg-primary-100/40 text-foreground font-body font-semibold text-xs transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary" />
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
            <section className="bg-card rounded-2xl p-6 shadow-sm">
              <CheckoutSectionHeader
                title="Alamat Pengiriman"
                subtitle="Pastikan rincian alamat dan kontak penerima sudah tepat"
                rightElement={
                  <Button
                    onClick={() => setIsAddressModalOpen(true)}
                    variant="primary"
                    size="xs"
                    neo={false}
                    className="rounded-full shadow-xs"
                  >
                    + Ganti Alamat
                  </Button>
                }
              />

              {selectedAddress ? (
                <CheckoutAddressCard
                  address={selectedAddress}
                  onManage={() => setIsAddressModalOpen(true)}
                  onEdit={() => openEditAddressForm(selectedAddress)}
                  onChangeAddress={() => setIsAddressModalOpen(true)}
                  notes={notes}
                />
              ) : (
                <CheckoutAddressEmpty
                  onAddNew={openAddAddressForm}
                />
              )}
            </section>

            {/* Section 2 — Items */}
            <section className="bg-card rounded-2xl p-6 shadow-sm">
              <CheckoutSectionHeader
                title={`Item Pesanan (${cartItems.length} Produk)`}
                subtitle="Diambil langsung dari kuota produksi RoboEdu"
              />

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CheckoutOrderItem
                    key={item.id}
                    item={item}
                    membershipStatus={membershipStatus}
                  />
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-accent-soft-blue/30 flex items-center gap-2.5 text-xs text-foreground font-medium">
                <Info className="w-4 h-4 text-primary shrink-0" />
                Semua pesanan dicek QC oleh teknisi RoboEdu dan dikemas aman dengan bubble wrap berlapis tebal.
              </div>
            </section>

            {/* Section 3 — Kurir */}
            <section className="bg-card rounded-2xl p-6 shadow-sm">
              <CheckoutSectionHeader
                title="Pilihan Layanan Kurir"
                subtitle="Pengiriman resmi terintegrasi dengan tracking otomatis"
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
              selectedPayment={selectedPayment}
              onPaymentChange={setSelectedPayment}
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
          openAddAddressForm();
        }}
        onEdit={(addr) => {
          setIsAddressModalOpen(false);
          openEditAddressForm(addr);
        }}
      />

      {/* Inline Add / Edit Address Form */}
      <AddressForm
        open={isAddressFormOpen}
        onClose={() => setIsAddressFormOpen(false)}
        initialData={editingAddressData}
        isFirstAddress={addresses.length === 0}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
