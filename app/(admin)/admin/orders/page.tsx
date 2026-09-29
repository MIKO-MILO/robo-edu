"use client";

import React, { useMemo, useState, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ShoppingCart } from "lucide-react";
import {
  OrderStatsGrid,
  OrderFilters,
  OrderTable,
} from "@/components/admin/orders";
import type { AdminOrderRow, OrderStats } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

// ---------------------------------------------------------------------------
// Mock data — akan diganti dengan hasil API hook saat backend siap
// ---------------------------------------------------------------------------
const MOCK_ADMIN_ORDERS: AdminOrderRow[] = [
  {
    id: "ord-001",
    order_number: "ORD-112-9876543-1234567",
    customer_id: "cust-1",
    customer_name: "Alex Student",
    customer_email: "alex@example.com",
    customer_phone: "+62 812-9876-5432",
    total: 1850000,
    status: "DELIVERED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "BCA Virtual Account",
    item_count: 3,
    first_item_name: "Advanced Servo Motor Controller Board V2",
    created_at: "2023-10-24T10:15:00Z",
    voucher_code: "ROBOEDU10",
  },
  {
    id: "ord-002",
    order_number: "ORD-112-1234567-9876543",
    customer_id: "cust-2",
    customer_name: "Budi Santoso",
    customer_email: "budi.s@gmail.com",
    customer_phone: "+62 813-1122-3344",
    total: 675000,
    status: "COMPLETED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "GoPay",
    item_count: 1,
    first_item_name: "Ultrasonic Distance Sensor HC-SR04 (Pack of 5)",
    created_at: "2023-09-12T14:20:00Z",
    voucher_code: null,
  },
  {
    id: "ord-003",
    order_number: "ORD-20231102-0045",
    customer_id: "cust-3",
    customer_name: "Citra Dewi",
    customer_email: "citra.dewi@yahoo.com",
    customer_phone: "+62 815-5566-7788",
    total: 1250000,
    status: "SHIPPED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "Mandiri Bill",
    item_count: 2,
    first_item_name: "RoboKit Smart Obstacle Avoidance Car",
    created_at: "2023-11-02T08:30:00Z",
    voucher_code: "DISKONONGKIR",
  },
  {
    id: "ord-004",
    order_number: "ORD-20231105-0089",
    customer_id: "cust-4",
    customer_name: "Dimas Anggara",
    customer_email: "dimas.ang@outlook.com",
    customer_phone: "+62 817-7788-9900",
    total: 450000,
    status: "PROCESSING" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "QRIS",
    item_count: 1,
    first_item_name: "ESP32 IoT Starter Experiment Board",
    created_at: "2023-11-05T13:45:00Z",
    voucher_code: null,
  },
  {
    id: "ord-005",
    order_number: "ORD-20231106-0112",
    customer_id: "cust-5",
    customer_name: "Eka Pratama",
    customer_email: "eka.pratama@gmail.com",
    customer_phone: "+62 818-8899-0011",
    total: 920000,
    status: "PENDING" as OrderStatus,
    payment_status: "PENDING" as PaymentStatus,
    payment_method: "BNI Virtual Account",
    item_count: 1,
    first_item_name: "Bionic Robotic Arm Kit 4-DOF",
    created_at: "2023-11-06T16:00:00Z",
    voucher_code: null,
  },
  {
    id: "ord-006",
    order_number: "ORD-20230810-0019",
    customer_id: "cust-6",
    customer_name: "Fajar Nugraha",
    customer_email: "fajar.n@gmail.com",
    customer_phone: "+62 819-9900-1122",
    total: 350000,
    status: "CANCELLED" as OrderStatus,
    payment_status: "EXPIRED" as PaymentStatus,
    payment_method: "BCA Virtual Account",
    item_count: 1,
    first_item_name: "Solar Power Mini Bug Robot Kit",
    created_at: "2023-08-10T09:12:00Z",
    voucher_code: null,
  },
  {
    id: "ord-007",
    order_number: "ORD-20231107-0130",
    customer_id: "cust-7",
    customer_name: "Gita Permata",
    customer_email: "gita.p@gmail.com",
    customer_phone: "+62 812-3344-5566",
    total: 890000,
    status: "PAID" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "BCA Virtual Account",
    item_count: 2,
    first_item_name: "Arduino Uno R4 WiFi Dev Board",
    created_at: "2023-11-07T11:20:00Z",
    voucher_code: "ROBOEDU10",
  },
];

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------
function AdminOrdersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("search", e.target.value);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const filteredOrders = useMemo(() => {
    return MOCK_ADMIN_ORDERS.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.first_item_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Reset ke halaman 1 saat filter berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo<OrderStats>(
    () => ({
      total: MOCK_ADMIN_ORDERS.length,
      pending: MOCK_ADMIN_ORDERS.filter((o) => o.status === "PENDING").length,
      paid: MOCK_ADMIN_ORDERS.filter((o) => o.status === "PAID").length,
      processing_shipped: MOCK_ADMIN_ORDERS.filter((o) =>
        ["PROCESSING", "SHIPPED"].includes(o.status),
      ).length,
      completed: MOCK_ADMIN_ORDERS.filter((o) =>
        ["DELIVERED", "COMPLETED"].includes(o.status),
      ).length,
    }),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            {/* <ShoppingCart className="size-6 text-primary" /> */}
            Manajemen Pesanan
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola transaksi, update status pesanan, dan pantau pengiriman
            RoboEdu.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <OrderStatsGrid stats={stats} />

      {/* Toolbar: search + filter */}
      <OrderFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Orders Table */}
      <OrderTable data={paginatedOrders} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export with Suspense boundary (required for useSearchParams)
// ---------------------------------------------------------------------------
export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
