"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { ClipboardList } from "lucide-react";

import { OrderStatusTabs, tabToApiStatus, type OrderTabValue } from "@/components/user/orders/order-status-tabs";
import { OrderList } from "@/components/user/orders/order-list";
import { OrderPagination } from "@/components/user/orders/order-pagination";
import type { OrderListItem, PaginationMeta } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// Ganti bagian ini dengan fetch ke real API (GET /orders?page=X&status=Y)
// ketika backend sudah siap — interface OrderListItem tidak perlu berubah.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ORDERS: OrderListItem[] = [
  {
    id: "ord-001",
    order_number: "RBE-20260818-0001",
    status: "PENDING",
    total: 850000,
    created_at: "2026-08-18T10:30:00Z",
    first_item: {
      product_name_snapshot: "Robot Edu Pro Series 3 — Starter Kit",
      variant_name_snapshot: "Paket Lengkap",
      image_url: null,
    },
    item_count: 3,
  },
  {
    id: "ord-002",
    order_number: "RBE-20260815-0042",
    status: "SHIPPED",
    total: 425000,
    created_at: "2026-08-15T14:22:00Z",
    first_item: {
      product_name_snapshot: "Arduino Mega 2560 R3 Original",
      variant_name_snapshot: null,
      image_url: null,
    },
    item_count: 1,
  },
  {
    id: "ord-003",
    order_number: "RBE-20260810-0099",
    status: "COMPLETED",
    total: 1250000,
    created_at: "2026-08-10T09:05:00Z",
    first_item: {
      product_name_snapshot: "Sensor Ultrasonik HC-SR04 Pack",
      variant_name_snapshot: "Isi 5 pcs",
      image_url: null,
    },
    item_count: 4,
  },
  {
    id: "ord-004",
    order_number: "RBE-20260805-0017",
    status: "CANCELLED",
    total: 175000,
    created_at: "2026-08-05T16:47:00Z",
    first_item: {
      product_name_snapshot: "Modul Bluetooth HC-05",
      variant_name_snapshot: null,
      image_url: null,
    },
    item_count: 2,
  },
  {
    id: "ord-005",
    order_number: "RBE-20260801-0003",
    status: "PROCESSING",
    total: 630000,
    created_at: "2026-08-01T11:00:00Z",
    first_item: {
      product_name_snapshot: "Robot Arm Kit 6-DOF dengan Servo",
      variant_name_snapshot: null,
      image_url: null,
    },
    item_count: 1,
  },
  {
    id: "ord-006",
    order_number: "RBE-20260728-0088",
    status: "COMPLETED",
    total: 95000,
    created_at: "2026-07-28T08:30:00Z",
    first_item: {
      product_name_snapshot: "Kabel Jumper Male-Female 40pcs",
      variant_name_snapshot: "30cm",
      image_url: null,
    },
    item_count: 1,
  },
];

const ORDERS_PER_PAGE = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — filter + paginate mock data
// ─────────────────────────────────────────────────────────────────────────────
function filterOrders(orders: OrderListItem[], tab: OrderTabValue): OrderListItem[] {
  const statuses = tabToApiStatus(tab);
  if (!statuses) return orders;
  return orders.filter((o) => statuses.includes(o.status));
}

function paginateOrders(
  orders: OrderListItem[],
  page: number,
  perPage: number,
): { items: OrderListItem[]; meta: PaginationMeta } {
  const totalCount = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const items = orders.slice(start, start + perPage);

  return {
    items,
    meta: {
      current_page: safePage,
      per_page: perPage,
      total_pages: totalPages,
      total_count: totalCount,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTabValue>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  // isPending = true saat simulasi loading (ganti dengan real loading state nanti)
  const [isPending, startTransition] = useTransition();

  // Filter + paginate (sisi klien dengan mock data)
  const filtered = useMemo(() => filterOrders(MOCK_ORDERS, activeTab), [activeTab]);
  const { items: visibleOrders, meta } = useMemo(
    () => paginateOrders(filtered, currentPage, ORDERS_PER_PAGE),
    [filtered, currentPage],
  );

  // Tab change — reset ke halaman 1
  const handleTabChange = useCallback((tab: OrderTabValue) => {
    startTransition(() => {
      setActiveTab(tab);
      setCurrentPage(1);
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      // Scroll halus ke atas daftar order
      document.getElementById("order-list-top")?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* ── Page wrapper ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="size-10 sm:size-12 rounded-2xl bg-accent-blue border-2 border-foreground neo-shadow
                         flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <ClipboardList className="size-5 sm:size-6 text-foreground" />
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground leading-tight">
              Riwayat Pesanan
            </h1>
          </div>
          <p className="font-body text-sm text-muted-foreground mt-1 ml-[52px] sm:ml-[60px]">
            Semua transaksi yang pernah kamu buat
          </p>
        </header>

        {/* ── Status Tabs ──────────────────────────────────────────── */}
        <section aria-label="Filter status pesanan" className="mb-6">
          <OrderStatusTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </section>

        {/* ── Summary row ──────────────────────────────────────────── */}
        {!isPending && meta.total_count > 0 && (
          <p
            className="font-body text-xs text-muted-foreground mb-4"
            aria-live="polite"
          >
            Menampilkan {visibleOrders.length} dari {meta.total_count} pesanan
            {activeTab !== "ALL" && " pada tab ini"}
          </p>
        )}

        {/* ── Order List ───────────────────────────────────────────── */}
        <section id="order-list-top" aria-label="Daftar pesanan">
          <OrderList
            orders={visibleOrders}
            isLoading={isPending}
            activeTab={activeTab}
            skeletonCount={ORDERS_PER_PAGE}
          />
        </section>

        {/* ── Pagination ───────────────────────────────────────────── */}
        {!isPending && meta.total_pages > 1 && (
          <div className="mt-8">
            <OrderPagination meta={meta} onPageChange={handlePageChange} />
            <p className="text-center font-body text-xs text-muted-foreground mt-3">
              Halaman {meta.current_page} dari {meta.total_pages}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
