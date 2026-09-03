"use client";

import React, { useState, useMemo, Suspense } from "react";
import { OrderStatusTabs, OrderTabKey, ORDER_TABS } from "@/components/user/orders/order-status-tabs";
import { OrderPeriodSelect, OrderPeriod } from "@/components/user/orders/order-period-select";
import { OrderCard } from "@/components/user/orders/order-card";
import { OrderEmptyState } from "@/components/user/orders/order-empty-state";
import { OrderTrackingModal } from "@/components/user/orders/order-tracking-modal";
import { OrderInvoiceModal } from "@/components/user/orders/order-invoice-modal";
import { OrderReviewModal } from "@/components/user/orders/order-review-modal";
import { Pagination } from "@/components/ui/pagination";
import { Search, Sparkles, ShoppingBag, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { OrderListItem, OrderStatus } from "@/types";

// Extended mock order item type for rich UI display & modal details
export interface FullOrderData extends OrderListItem {
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  voucher_code_snapshot: string | null;
  courier_name: string;
  shipping_service: string;
  tracking_number: string;
  shipment_summary?: string;
  delivered_at: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  has_reviewed?: boolean;
  all_items: Array<{
    name: string;
    variant: string | null;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
}

// ── Realistic Mock Orders matching PRD, Schema & Stitch Design ──
const INITIAL_ORDERS: FullOrderData[] = [
  {
    id: "ord-001",
    order_number: "ORD-112-9876543-1234567",
    status: "DELIVERED",
    total: 1850000,
    subtotal: 1800000,
    shipping_cost: 50000,
    discount_amount: 0,
    voucher_code_snapshot: null,
    created_at: "2023-10-24T10:15:00Z",
    paid_at: "2023-10-24T10:30:00Z",
    shipped_at: "2023-10-25T08:00:00Z",
    delivered_at: "2023-10-27T14:32:00Z",
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "J&T Express",
    shipping_service: "Regular",
    tracking_number: "JNT98765431234",
    shipment_summary: "Paket telah diterima langsung oleh yang bersangkutan.",
    has_reviewed: false,
    item_count: 3,
    first_item: {
      product_name_snapshot: "Advanced Servo Motor Controller Board V2 - Arduino Compatible",
      variant_name_snapshot: "Arduino Edition / 16 Channel",
      image_url:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    },
    all_items: [
      {
        name: "Advanced Servo Motor Controller Board V2 - Arduino Compatible",
        variant: "Arduino Edition / 16 Channel",
        price: 850000,
        quantity: 1,
        subtotal: 850000,
      },
      {
        name: "Micro Servo SG90 9g Metal Gear (Pack of 4)",
        variant: "Standard",
        price: 350000,
        quantity: 2,
        subtotal: 700000,
      },
      {
        name: "Jumper Wire Dupont Cables Set (120 pcs)",
        variant: "Male to Female",
        price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ],
  },
  {
    id: "ord-002",
    order_number: "ORD-112-1234567-9876543",
    status: "COMPLETED",
    total: 675000,
    subtotal: 650000,
    shipping_cost: 25000,
    discount_amount: 0,
    voucher_code_snapshot: null,
    created_at: "2023-09-12T14:20:00Z",
    paid_at: "2023-09-12T14:45:00Z",
    shipped_at: "2023-09-13T09:00:00Z",
    delivered_at: "2023-09-15T11:10:00Z",
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "SiCepat",
    shipping_service: "BEST (Besok Sampai Tujuan)",
    tracking_number: "002938471928",
    shipment_summary: "Paket telah diterima langsung oleh yang bersangkutan.",
    has_reviewed: true,
    item_count: 1,
    first_item: {
      product_name_snapshot: "Ultrasonic Distance Sensor HC-SR04 (Pack of 5)",
      variant_name_snapshot: "Pack 5 Pcs",
      image_url:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    },
    all_items: [
      {
        name: "Ultrasonic Distance Sensor HC-SR04 (Pack of 5)",
        variant: "Pack 5 Pcs",
        price: 650000,
        quantity: 1,
        subtotal: 650000,
      },
    ],
  },
  {
    id: "ord-003",
    order_number: "ORD-20231102-0045",
    status: "SHIPPED",
    total: 1250000,
    subtotal: 1270000,
    shipping_cost: 30000,
    discount_amount: 50000,
    voucher_code_snapshot: "ROBOPROMO50",
    created_at: "2023-11-02T08:30:00Z",
    paid_at: "2023-11-02T09:00:00Z",
    shipped_at: "2023-11-03T10:00:00Z",
    delivered_at: null,
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "JNE Express",
    shipping_service: "REG",
    tracking_number: "JNE8877665544",
    shipment_summary: "Sedang dalam perjalanan menuju kota tujuan (Hub Jakarta Selatan).",
    has_reviewed: false,
    item_count: 2,
    first_item: {
      product_name_snapshot: "RoboKit Smart Obstacle Avoidance Car",
      variant_name_snapshot: "Bluetooth + Sensor Kit",
      image_url:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    },
    all_items: [
      {
        name: "RoboKit Smart Obstacle Avoidance Car",
        variant: "Bluetooth + Sensor Kit",
        price: 950000,
        quantity: 1,
        subtotal: 950000,
      },
      {
        name: "Rechargeable 18650 Battery Pack + Charger",
        variant: "2 Slot Fast Charger",
        price: 320000,
        quantity: 1,
        subtotal: 320000,
      },
    ],
  },
  {
    id: "ord-004",
    order_number: "ORD-20231105-0089",
    status: "PROCESSING",
    total: 450000,
    subtotal: 425000,
    shipping_cost: 25000,
    discount_amount: 0,
    voucher_code_snapshot: null,
    created_at: "2023-11-05T13:45:00Z",
    paid_at: "2023-11-05T14:10:00Z",
    shipped_at: null,
    delivered_at: null,
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "J&T Express",
    shipping_service: "Regular",
    tracking_number: "Menunggu Penjemputan Kurir",
    shipment_summary: "Pesanan sedang dipacking dengan aman oleh tim gudang RoboEdu.",
    has_reviewed: false,
    item_count: 1,
    first_item: {
      product_name_snapshot: "ESP32 IoT Starter Experiment Board with OLED",
      variant_name_snapshot: "Board Only",
      image_url:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80",
    },
    all_items: [
      {
        name: "ESP32 IoT Starter Experiment Board with OLED",
        variant: "Board Only",
        price: 425000,
        quantity: 1,
        subtotal: 425000,
      },
    ],
  },
  {
    id: "ord-005",
    order_number: "ORD-20231106-0112",
    status: "PENDING",
    total: 920000,
    subtotal: 890000,
    shipping_cost: 30000,
    discount_amount: 0,
    voucher_code_snapshot: null,
    created_at: "2023-11-06T16:00:00Z",
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "SiCepat",
    shipping_service: "Regular",
    tracking_number: "-",
    shipment_summary: "Menunggu penyelesaian pembayaran sebelum 07 Nov 2023, 16:00 WIB.",
    has_reviewed: false,
    item_count: 1,
    first_item: {
      product_name_snapshot: "Bionic Robotic Arm Kit 4-DOF with Mechanical Gripper",
      variant_name_snapshot: "Full Acrylic Assembly",
      image_url:
        "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80",
    },
    all_items: [
      {
        name: "Bionic Robotic Arm Kit 4-DOF with Mechanical Gripper",
        variant: "Full Acrylic Assembly",
        price: 890000,
        quantity: 1,
        subtotal: 890000,
      },
    ],
  },
  {
    id: "ord-006",
    order_number: "ORD-20230810-0019",
    status: "CANCELLED",
    total: 350000,
    subtotal: 330000,
    shipping_cost: 20000,
    discount_amount: 0,
    voucher_code_snapshot: null,
    created_at: "2023-08-10T09:12:00Z",
    paid_at: null,
    shipped_at: null,
    delivered_at: null,
    recipient_name: "Alex Student",
    recipient_phone: "+62 812-9876-5432",
    shipping_address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    courier_name: "J&T Express",
    shipping_service: "Regular",
    tracking_number: "-",
    shipment_summary: "Pesanan dibatalkan otomatis karena melewati batas waktu pembayaran.",
    has_reviewed: false,
    item_count: 1,
    first_item: {
      product_name_snapshot: "Solar Power Mini Bug Robot Kit",
      variant_name_snapshot: "Yellow Mini",
      image_url:
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80",
    },
    all_items: [
      {
        name: "Solar Power Mini Bug Robot Kit",
        variant: "Yellow Mini",
        price: 330000,
        quantity: 1,
        subtotal: 330000,
      },
    ],
  },
];

const ITEMS_PER_PAGE = 4;

function OrdersContent() {
  const [orders, setOrders] = useState<FullOrderData[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderTabKey>("all");
  const [period, setPeriod] = useState<OrderPeriod>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<FullOrderData | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<FullOrderData | null>(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<FullOrderData | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ── Calculate Counts per Tab ─────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Partial<Record<OrderTabKey, number>> = {
      all: orders.length,
      processing: orders.filter((o) =>
        ["PENDING", "PAID", "PROCESSING"].includes(o.status)
      ).length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      completed: orders.filter((o) =>
        ["DELIVERED", "COMPLETED"].includes(o.status)
      ).length,
      cancelled: orders.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      ).length,
    };
    return counts;
  }, [orders]);

  // ── Filter Orders ────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Tab Status Filter (per Point 1.1 Content Requirement)
    if (activeTab === "processing") {
      result = result.filter((o) =>
        ["PENDING", "PAID", "PROCESSING"].includes(o.status)
      );
    } else if (activeTab === "shipped") {
      result = result.filter((o) => o.status === "SHIPPED");
    } else if (activeTab === "completed") {
      result = result.filter((o) =>
        ["DELIVERED", "COMPLETED"].includes(o.status)
      );
    } else if (activeTab === "cancelled") {
      result = result.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      );
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.first_item.product_name_snapshot.toLowerCase().includes(q) ||
          o.all_items.some((item) => item.name.toLowerCase().includes(q))
      );
    }

    // 3. Period Filter
    if (period === "2023") {
      result = result.filter((o) => o.created_at.startsWith("2023"));
    } else if (period === "2024") {
      result = result.filter((o) => o.created_at.startsWith("2024"));
    }

    return result;
  }, [orders, activeTab, searchQuery, period]);

  // ── Pagination Calculation ───────────────────────────────
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleTabChange = (tab: OrderTabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // ── Handlers for Interactive Actions ─────────────────────
  const handleViewInvoice = (orderNumber: string) => {
    const found = orders.find((o) => o.order_number === orderNumber);
    if (found) setSelectedInvoiceOrder(found);
  };

  const handleTrackPackage = (orderNumber: string) => {
    const found = orders.find((o) => o.order_number === orderNumber);
    if (found) setSelectedTrackingOrder(found);
  };

  const handleReview = (orderNumber: string) => {
    const found = orders.find((o) => o.order_number === orderNumber);
    if (found) setSelectedReviewOrder(found);
  };

  const handleBuyAgain = (productName: string) => {
    showToast(`"${productName}" berhasil ditambahkan ke keranjang belanja!`);
  };

  const handlePayNow = (orderNumber: string) => {
    showToast(`Membuka instruksi pembayaran untuk ${orderNumber}...`);
  };

  const handleCancelOrder = (orderNumber: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_number === orderNumber ? { ...o, status: "CANCELLED" as OrderStatus } : o
      )
    );
    showToast(`Pesanan ${orderNumber} berhasil dibatalkan.`);
  };

  const handleReviewSuccess = () => {
    if (selectedReviewOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedReviewOrder.id ? { ...o, has_reviewed: true } : o
        )
      );
      showToast("Ulasanmu berhasil dikirim!");
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6 sm:gap-8">
        {/* ── Page Header ─────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-foreground tracking-tight">
              Riwayat Pesanan
            </h1>
            <span
              aria-label={`${orders.length} total pesanan`}
              className="bg-card text-foreground font-heading font-bold text-sm px-3.5 py-1 rounded-full border-2 border-foreground neo-shadow-icon"
            >
              {orders.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari pesanan atau produk..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-card border-2 border-foreground pl-10 pr-4 py-2 rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary neo-shadow-icon transition-all"
            />
          </div>
        </header>

        {/* ── Filter Tabs & Controls Row ──────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/30 p-2 sm:p-3 rounded-2xl border-2 border-foreground neo-shadow">
          {/* Status Tabs */}
          <OrderStatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />

          {/* Period Selector */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <OrderPeriodSelect value={period} onChange={setPeriod} />
          </div>
        </div>

        {/* ── Orders Cards List ───────────────────────────── */}
        {filteredOrders.length === 0 ? (
          <OrderEmptyState
            activeTab={activeTab}
            onResetFilter={() => {
              setActiveTab("all");
              setSearchQuery("");
              setPeriod("all");
            }}
          />
        ) : (
          <section
            aria-label="Daftar Riwayat Pesanan"
            className="flex flex-col gap-6"
          >
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewInvoice={handleViewInvoice}
                onTrackPackage={handleTrackPackage}
                onBuyAgain={handleBuyAgain}
                onReview={handleReview}
                onPayNow={handlePayNow}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </section>
        )}

        {/* ── Pagination ──────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── Modals & Dialogs ──────────────────────────────── */}
      {selectedTrackingOrder && (
        <OrderTrackingModal
          isOpen={!!selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
          orderNumber={selectedTrackingOrder.order_number}
          courierName={selectedTrackingOrder.courier_name}
          service={selectedTrackingOrder.shipping_service}
          trackingNumber={selectedTrackingOrder.tracking_number}
        />
      )}

      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          orderNumber={selectedInvoiceOrder.order_number}
          orderDate={new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(selectedInvoiceOrder.created_at))}
          status={selectedInvoiceOrder.status}
          recipientName={selectedInvoiceOrder.recipient_name}
          recipientPhone={selectedInvoiceOrder.recipient_phone}
          shippingAddress={selectedInvoiceOrder.shipping_address}
          items={selectedInvoiceOrder.all_items}
          subtotal={selectedInvoiceOrder.subtotal}
          shippingCost={selectedInvoiceOrder.shipping_cost}
          discountAmount={selectedInvoiceOrder.discount_amount}
          voucherCode={selectedInvoiceOrder.voucher_code_snapshot}
          total={selectedInvoiceOrder.total}
        />
      )}

      {selectedReviewOrder && (
        <OrderReviewModal
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          orderNumber={selectedReviewOrder.order_number}
          productName={
            selectedReviewOrder.first_item.product_name_snapshot
          }
          onSubmitSuccess={handleReviewSuccess}
        />
      )}

      {/* ── Toast Feedback Notification ───────────────────── */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-card border-2 border-foreground px-5 py-3.5 rounded-2xl neo-shadow flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="p-1 rounded-full bg-accent-green border border-foreground">
            <CheckCircle className="w-4 h-4 text-foreground" />
          </div>
          <span className="font-body font-bold text-sm text-foreground">
            {toastMessage}
          </span>
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