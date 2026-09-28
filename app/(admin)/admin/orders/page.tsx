"use client";

import React, { useMemo, Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
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
    customer_name: "Alex Student",
    customer_email: "alex@example.com",
    total: 1850000,
    status: "DELIVERED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "BCA Virtual Account",
    item_count: 3,
    first_item_name: "Advanced Servo Motor Controller Board V2",
    created_at: "2023-10-24T10:15:00Z",
  },
  {
    id: "ord-002",
    order_number: "ORD-112-1234567-9876543",
    customer_name: "Budi Santoso",
    customer_email: "budi.s@gmail.com",
    total: 675000,
    status: "COMPLETED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "GoPay",
    item_count: 1,
    first_item_name: "Ultrasonic Distance Sensor HC-SR04 (Pack of 5)",
    created_at: "2023-09-12T14:20:00Z",
  },
  {
    id: "ord-003",
    order_number: "ORD-20231102-0045",
    customer_name: "Citra Dewi",
    customer_email: "citra.dewi@yahoo.com",
    total: 1250000,
    status: "SHIPPED" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "Mandiri Bill",
    item_count: 2,
    first_item_name: "RoboKit Smart Obstacle Avoidance Car",
    created_at: "2023-11-02T08:30:00Z",
  },
  {
    id: "ord-004",
    order_number: "ORD-20231105-0089",
    customer_name: "Dimas Anggara",
    customer_email: "dimas.ang@outlook.com",
    total: 450000,
    status: "PROCESSING" as OrderStatus,
    payment_status: "PAID" as PaymentStatus,
    payment_method: "QRIS",
    item_count: 1,
    first_item_name: "ESP32 IoT Starter Experiment Board",
    created_at: "2023-11-05T13:45:00Z",
  },
  {
    id: "ord-005",
    order_number: "ORD-20231106-0112",
    customer_name: "Eka Pratama",
    customer_email: "eka.pratama@gmail.com",
    total: 920000,
    status: "PENDING" as OrderStatus,
    payment_status: "PENDING" as PaymentStatus,
    payment_method: "BNI Virtual Account",
    item_count: 1,
    first_item_name: "Bionic Robotic Arm Kit 4-DOF",
    created_at: "2023-11-06T16:00:00Z",
  },
  {
    id: "ord-006",
    order_number: "ORD-20230810-0019",
    customer_name: "Fajar Nugraha",
    customer_email: "fajar.n@gmail.com",
    total: 350000,
    status: "CANCELLED" as OrderStatus,
    payment_status: "EXPIRED" as PaymentStatus,
    payment_method: "BCA Virtual Account",
    item_count: 1,
    first_item_name: "Solar Power Mini Bug Robot Kit",
    created_at: "2023-08-10T09:12:00Z",
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

  const stats = useMemo<OrderStats>(
    () => ({
      total: MOCK_ADMIN_ORDERS.length,
      pending: MOCK_ADMIN_ORDERS.filter((o) => o.status === "PENDING").length,
      processing_shipped: MOCK_ADMIN_ORDERS.filter((o) =>
        ["PROCESSING", "SHIPPED"].includes(o.status)
      ).length,
      completed: MOCK_ADMIN_ORDERS.filter((o) =>
        ["DELIVERED", "COMPLETED"].includes(o.status)
      ).length,
    }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="size-6 text-primary" />
            Manajemen Pesanan
          </h1>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-0.5">
            Kelola transaksi, update status pesanan, dan pantau pengiriman RoboEdu.
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
      <OrderTable data={filteredOrders} />
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
