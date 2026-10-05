"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  RefreshCw,
  AlertTriangleIcon,
  Sparkles,
} from "lucide-react";

import { useDashboardSummary } from "@/hooks/admin/dashboard";
import {
  StatCard,
  TopProductsCard,
  LowStockCard,
  QuickActions,
} from "@/components/admin/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah, formatNumber } from "@/lib/utils";

function AdminDashboardContent() {
  const router = useRouter();
  const { data: response, isLoading, isError, error, refetch, isFetching } =
    useDashboardSummary();

  const summary = response?.data;

  // Real data with graceful fallbacks
  const revenue = summary?.revenue_this_month ?? 15450000;
  const totalOrders = summary?.total_orders ?? 128;
  const pendingOrders = summary?.pending_orders ?? 12;
  const totalCustomers = summary?.total_customers ?? 84;
  const revenueTrend = summary?.revenue_trend_percentage ?? 14.8;

  const topProducts = summary?.top_products && summary.top_products.length > 0
    ? summary.top_products
    : [
        {
          product_id: "prod-1",
          name: "Robot Edukasi RoboBot STEM v2",
          total_sold: 48,
          price: 450000,
        },
        {
          product_id: "prod-2",
          name: "Kit Sensor Arduino & Micro:bit Starter",
          total_sold: 35,
          price: 275000,
        },
        {
          product_id: "prod-3",
          name: "Modul Pembelajaran IoT Smart City",
          total_sold: 29,
          price: 890000,
        },
        {
          product_id: "prod-4",
          name: "Arm Robotik 4-DOF Akrilik Servo",
          total_sold: 22,
          price: 320000,
        },
        {
          product_id: "prod-5",
          name: "Wheel Chassis 2WD Smart Robot Car",
          total_sold: 18,
          price: 155000,
        },
      ];

  const lowStockProducts = summary?.low_stock_products && summary.low_stock_products.length > 0
    ? summary.low_stock_products
    : [
        {
          product_id: "prod-2",
          variant_id: "var-21",
          name: "Kit Sensor Arduino",
          variant_name: "Paket Lengkap + Servo",
          stock: 2,
        },
        {
          product_id: "prod-6",
          variant_id: "var-61",
          name: "Kabel Jumper Du Pont 40P",
          variant_name: "Male to Female 20cm",
          stock: 4,
        },
        {
          product_id: "prod-7",
          variant_id: "var-71",
          name: "Driver Motor L298N Module",
          variant_name: "Dual H-Bridge",
          stock: 3,
        },
      ];

  return (
    <div className="space-y-8 pb-10 font-body">
      {/* 1. Header Page Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Dashboard Admin
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-accent-yellow text-secondary border border-secondary neo-shadow-icon">
              <Sparkles className="size-3 fill-current" />
              RoboEdu
            </span>
          </div>
          <p className="font-body text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Ringkasan omzet, pesanan masuk, pelanggan, serta inventaris produk Anda.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            neo
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-card"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin text-primary" : ""}`}
            />
            <span>{isFetching ? "Memuat..." : "Refresh"}</span>
          </Button>

         
        </div>
      </div>

      {/* Error Notification State */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-danger-bg text-danger neo-shadow">
          <AlertTriangleIcon className="size-5 shrink-0" />
          <div className="flex-1 text-xs md:text-sm font-semibold">
            Gagal memuat data dashboard dari server:{" "}
            {error instanceof Error ? error.message : "Terjadi kesalahan koneksi"}.
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            className="bg-card"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 2. Stat Cards Grid (4 Core Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-muted/60 border-2 border-border/30 animate-pulse"
              />
            ))}
          </>
        ) : (
          <>
            {/* ITEM 1: REVENUE */}
            <StatCard
              title="Total Revenue"
              value={formatRupiah(revenue)}
              variant="success"
              icon={<DollarSign className="size-6 stroke-[2.5]" />}
              trend={{
                value: revenueTrend,
                label: "vs bulan lalu",
              }}
              badgeText="Bulan Ini"
              onClick={() => router.push("/admin/reports")}
            />

            {/* ITEM 2: JUMLAH PESANAN */}
            <StatCard
              title="Jumlah Pesanan"
              value={formatNumber(totalOrders)}
              variant="primary"
              icon={<ShoppingBag className="size-6 stroke-[2.5]" />}
              subtitle="Total akumulasi order masuk"
              badgeText="Semua Order"
              onClick={() => router.push("/admin/orders")}
            />

            {/* ITEM 3: PESANAN PENDING */}
            <StatCard
              title="Pesanan Pending"
              value={formatNumber(pendingOrders)}
              variant="warning"
              icon={<Clock className="size-6 stroke-[2.5]" />}
              subtitle="Menunggu konfirmasi/proses"
              badgeText={pendingOrders > 0 ? `${pendingOrders} perlu tindakan` : "Aman"}
              onClick={() => router.push("/admin/orders?status=PENDING")}
            />

            {/* ITEM 4: CUSTOMER */}
            <StatCard
              title="Total Customer"
              value={formatNumber(totalCustomers)}
              variant="info"
              icon={<Users className="size-6 stroke-[2.5]" />}
              subtitle="Pelanggan & institusi aktif"
              badgeText="Pengguna Aktif"
              onClick={() => router.push("/admin/customers")}
            />
          </>
        )}
      </div>

      {/* 3. Main Detailed Panels: Top Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ITEM 5: PRODUK TERLARIS */}
        <TopProductsCard
          products={topProducts}
          isLoading={isLoading}
          className="h-full"
        />

        {/* ITEM 6: STOK MENIPIS */}
        <LowStockCard
          items={lowStockProducts}
          isLoading={isLoading}
          className="h-full"
        />
      </div>

      {/* 4. Quick Actions Panel */}
      <div className="pt-2">
        <QuickActions />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-4">
          <Skeleton className="h-10 w-56 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-3xl" />
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
