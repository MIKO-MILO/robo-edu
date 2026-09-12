"use client";

import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { OrderStatusTabs, type OrderTabKey } from "@/components/user/orders/order-status-tabs";
import { OrderPeriodSelect, type OrderPeriod } from "@/components/user/orders/order-period-select";
import { OrderCard } from "@/components/user/orders/order-card";
import { OrderEmptyState } from "@/components/user/orders/order-empty-state";
import { OrderTrackingModal } from "@/components/user/orders/order-tracking-modal";
import { OrderInvoiceModal } from "@/components/user/orders/order-invoice-modal";
import { OrderReviewModal } from "@/components/user/orders/order-review-modal";
import { Pagination } from "@/components/ui/pagination";
import { Search, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/types";

// ── Tipe data dari API /api/orders ────────────────────────────────────────────
export interface ApiOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  voucher_code_snapshot: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  item_count: number;
  first_item: {
    product_name_snapshot: string;
    variant_name_snapshot: string | null;
    image_url: string | null;
  } | null;
  // Field detail (dari /api/orders/[id]) — opsional
  courier_name?: string;
  tracking_number?: string;
  shipping_service?: string;
  shipment_summary?: string;
  all_items?: Array<{
    name: string;
    variant: string | null;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
}

interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 10;

// Hitung apakah order masuk filter periode
function matchesPeriod(createdAt: string, period: OrderPeriod): boolean {
  if (period === "all") return true;
  const date = new Date(createdAt);
  const now = new Date();
  if (period === "3_months") {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 3);
    return date >= cutoff;
  }
  if (period === "6_months") {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 6);
    return date >= cutoff;
  }
  // Tahun spesifik
  return date.getFullYear().toString() === period;
}

function OrdersContent() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<OrderTabKey>("all");
  const [period, setPeriod] = useState<OrderPeriod>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<ApiOrder | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<ApiOrder | null>(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<ApiOrder | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Fetch list dari API ───────────────────────────────────────────────
  const fetchOrders = useCallback(async (tab: OrderTabKey, page: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        tab,
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Gagal memuat pesanan.");

      setOrders(json.data as ApiOrder[]);
      setMeta(json.meta as ApiMeta);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat pesanan.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    void fetchOrders(activeTab, currentPage);
  }, [fetchOrders, activeTab, currentPage]);

  // ── Filter periode di sisi client (ringan, tidak perlu round-trip) ────
  const filteredOrders = useMemo(
    () => orders.filter((o) => matchesPeriod(o.created_at, period)),
    [orders, period],
  );

  // ── Tab counts dari meta total (hanya "all" yang akurat dari API) ─────
  const tabCounts = useMemo(
    () => ({ all: meta.total }),
    [meta.total],
  );

  function handleTabChange(tab: OrderTabKey) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    setCurrentPage(1);
  }

  // Debounce search agar tidak fetch tiap keystroke
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchDebounce) clearTimeout(searchDebounce);
    setSearchDebounce(
      setTimeout(() => {
        setCurrentPage(1);
        void fetchOrders(activeTab, 1);
      }, 400),
    );
  }

  // ── Fetch detail order untuk modal (invoice / tracking) ──────────────
  async function fetchOrderDetail(orderId: string): Promise<ApiOrder | null> {
    setLoadingDetailId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (!res.ok) return null;
      const d = json.data;
      // Shape ke ApiOrder dengan field tambahan
      return {
        ...orders.find((o) => o.id === orderId)!,
        courier_name: d.shipment?.provider_name ?? undefined,
        tracking_number: d.shipment?.tracking_number ?? undefined,
        shipping_service: d.shipment?.service ?? undefined,
        all_items: d.order_items?.map((item: {
          product_name_snapshot: string;
          variant_name_snapshot: string | null;
          price_snapshot: number;
          quantity: number;
          subtotal: number;
        }) => ({
          name: item.product_name_snapshot,
          variant: item.variant_name_snapshot,
          price: item.price_snapshot,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })) ?? [],
      };
    } catch {
      return null;
    } finally {
      setLoadingDetailId(null);
    }
  }

  async function handleViewInvoice(orderNumber: string) {
    const order = orders.find((o) => o.order_number === orderNumber);
    if (!order) return;
    const detail = await fetchOrderDetail(order.id);
    setSelectedInvoiceOrder(detail ?? order);
  }

  async function handleTrackPackage(orderNumber: string) {
    const order = orders.find((o) => o.order_number === orderNumber);
    if (!order) return;
    const detail = await fetchOrderDetail(order.id);
    setSelectedTrackingOrder(detail ?? order);
  }

  function handleReview(orderNumber: string) {
    const order = orders.find((o) => o.order_number === orderNumber);
    if (order) setSelectedReviewOrder(order);
  }

  function handleBuyAgain(productName: string) {
    showToast(`"${productName}" berhasil ditambahkan ke keranjang belanja!`);
  }

  function handlePayNow(orderNumber: string) {
    showToast(`Membuka instruksi pembayaran untuk ${orderNumber}...`);
  }

  function handleCancelOrder(orderNumber: string) {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.order_number === orderNumber ? { ...o, status: "CANCELLED" as OrderStatus } : o,
      ),
    );
    showToast(`Pesanan ${orderNumber} berhasil dibatalkan.`);
  }

  function handleReviewSuccess() {
    showToast("Ulasanmu berhasil dikirim!");
    setSelectedReviewOrder(null);
  }

  return (
    <main className="w-full flex-1 min-w-0">
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight">
              Riwayat Pesanan
            </h1>
            {!isLoading && (
              <span
                aria-label={`${meta.total} total pesanan`}
                className="bg-card text-foreground font-heading font-bold text-sm px-3.5 py-1 rounded-full border-2 border-foreground neo-shadow-icon"
              >
                {meta.total}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari pesanan atau produk..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-card border-2 border-foreground pl-10 pr-4 py-2 rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary neo-shadow-icon transition-all"
            />
          </div>
        </header>

        {/* ── Filter Tabs & Period ─────────────────────────────────── */}
        <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/30 p-2 sm:p-3 rounded-2xl border-2 border-foreground neo-shadow">
          <OrderStatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <OrderPeriodSelect value={period} onChange={setPeriod} />
          </div>
        </div>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="font-body text-sm">Memuat pesanan...</span>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────── */}
        {!isLoading && loadError && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="font-body text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchOrders(activeTab, currentPage)}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {!isLoading && !loadError && filteredOrders.length === 0 && (
          <OrderEmptyState
            activeTab={activeTab}
            onResetFilter={() => {
              setActiveTab("all");
              setSearchQuery("");
              setPeriod("all");
              setCurrentPage(1);
            }}
          />
        )}

        {/* ── Order cards ──────────────────────────────────────────── */}
        {!isLoading && !loadError && filteredOrders.length > 0 && (
          <section aria-label="Daftar Riwayat Pesanan" className="flex flex-col gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="relative">
                {loadingDetailId === order.id && (
                  <div className="absolute inset-0 z-10 bg-card/60 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                <OrderCard
                  order={{
                    id: order.id,
                    order_number: order.order_number,
                    status: order.status,
                    total: order.total,
                    created_at: order.created_at,
                    item_count: order.item_count,
                    first_item: order.first_item ?? {
                      product_name_snapshot: "Produk RoboEdu",
                      variant_name_snapshot: null,
                      image_url: null,
                    },
                    recipient_name: order.recipient_name,
                    shipping_address: `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_province}`,
                    paid_at: order.paid_at,
                    shipped_at: order.shipped_at,
                    delivered_at: order.delivered_at,
                    courier_name: order.courier_name,
                    tracking_number: order.tracking_number,
                    shipment_summary: order.shipment_summary,
                  }}
                  onViewInvoice={handleViewInvoice}
                  onTrackPackage={handleTrackPackage}
                  onBuyAgain={handleBuyAgain}
                  onReview={handleReview}
                  onPayNow={handlePayNow}
                  onCancelOrder={handleCancelOrder}
                />
              </div>
            ))}
          </section>
        )}

        {/* ── Pagination ───────────────────────────────────────────── */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {selectedTrackingOrder && (
        <OrderTrackingModal
          isOpen
          onClose={() => setSelectedTrackingOrder(null)}
          orderNumber={selectedTrackingOrder.order_number}
          courierName={selectedTrackingOrder.courier_name ?? "-"}
          service={selectedTrackingOrder.shipping_service ?? "-"}
          trackingNumber={selectedTrackingOrder.tracking_number ?? "-"}
        />
      )}

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen
          onClose={() => setSelectedInvoiceOrder(null)}
          orderNumber={selectedInvoiceOrder.order_number}
          orderDate={new Intl.DateTimeFormat("id-ID", {
            day: "numeric", month: "short", year: "numeric",
          }).format(new Date(selectedInvoiceOrder.created_at))}
          status={selectedInvoiceOrder.status}
          recipientName={selectedInvoiceOrder.recipient_name}
          recipientPhone={selectedInvoiceOrder.recipient_phone}
          shippingAddress={`${selectedInvoiceOrder.shipping_address}, ${selectedInvoiceOrder.shipping_city}, ${selectedInvoiceOrder.shipping_province}`}
          items={
            selectedInvoiceOrder.all_items?.map((i) => ({
              name: i.name,
              variant: i.variant,
              price: i.price,
              quantity: i.quantity,
              subtotal: i.subtotal,
            })) ?? []
          }
          subtotal={selectedInvoiceOrder.subtotal}
          shippingCost={selectedInvoiceOrder.shipping_cost}
          discountAmount={selectedInvoiceOrder.discount_amount}
          voucherCode={selectedInvoiceOrder.voucher_code_snapshot}
          total={selectedInvoiceOrder.total}
          paymentMethod={selectedInvoiceOrder.courier_name ?? undefined}
        />
      )}

      {selectedReviewOrder && (
        <OrderReviewModal
          isOpen
          onClose={() => setSelectedReviewOrder(null)}
          orderNumber={selectedReviewOrder.order_number}
          productName={selectedReviewOrder.first_item?.product_name_snapshot ?? "Produk RoboEdu"}
          onSubmitSuccess={handleReviewSuccess}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-card border-2 border-foreground px-5 py-3.5 rounded-2xl neo-shadow flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="p-1 rounded-full bg-accent-green border border-foreground">
            <CheckCircle className="w-4 h-4 text-foreground" />
          </div>
          <span className="font-body font-bold text-sm text-foreground">{toastMessage}</span>
        </div>
      )}
    </main>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background py-16 px-4 flex flex-col items-center justify-center">
          <div className="p-4 rounded-3xl bg-card border-2 border-foreground neo-shadow flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="font-heading font-bold text-base text-foreground">
              Memuat Riwayat Pesanan...
            </span>
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
