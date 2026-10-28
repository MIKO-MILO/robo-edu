"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingBag,
  MessageSquareWarning,
  Star,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CustomerDetailHeader,
  CustomerMetricCards,
  CustomerProfileCard,
  CustomerOrdersTab,
  CustomerComplaintsTab,
  CustomerReviewsTab,
} from "@/components/admin/customers";
import type { AdminCustomerDetailData } from "@/components/admin/customers";
import { useCustomer } from "@/hooks/admin/customers";
import { cn } from "@/lib/utils";

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

type TabKey = "orders" | "complaints" | "reviews";

export default function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading, isError, error, refetch } = useCustomer(id);
  const customer: AdminCustomerDetailData | undefined = data?.data;

  const [activeMainTab, setActiveMainTab] = useState<TabKey>("orders");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-14 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border-2 border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-heading font-bold text-sm">
              Gagal memuat detail pelanggan
            </p>
            <p className="text-xs opacity-90">
              {error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat menghubungi server."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/admin/customers">
                <ChevronLeft className="size-4 mr-1.5" />
                Kembali
              </Link>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-card rounded-2xl border-2 border-border p-12 text-center shadow-xs max-w-md mx-auto my-12 space-y-4">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <UserX className="size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-heading font-bold text-foreground">
            Pelanggan Tidak Ditemukan
          </h2>
          <p className="text-xs text-muted-foreground">
            Data pelanggan dengan ID &ldquo;{id}&rdquo; tidak dapat ditemukan di
            sistem.
          </p>
        </div>
        <Button asChild variant="default" size="sm" className="rounded-xl">
          <Link href="/admin/customers">
            <ChevronLeft className="size-4 mr-1.5" />
            Kembali ke Daftar Pelanggan
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] space-y-6">
      {/* 1. Header Pelanggan */}
      <CustomerDetailHeader
        id={customer.id}
        name={customer.name}
        email={customer.email}
        phone={customer.phone}
        resellerStatus={customer.reseller_status}
        isActive={customer.is_active}
        createdAt={customer.created_at}
      />

      {/* 2. Kartu Metrik Performa Finansial (LTV, Total Orders, AOV, Last Order) */}
      <CustomerMetricCards
        totalSpent={customer.metrics.total_spent}
        totalOrders={customer.metrics.total_orders}
        completedOrders={customer.metrics.completed_orders}
        averageOrderValue={customer.metrics.average_order_value}
        lastOrderAt={customer.metrics.last_order_at}
      />

      {/* 3. Grid Konten Utama: 2 Kolom (Kiri: Tabs Konten, Kanan: Profil & Alamat) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Kolom Kiri — Tabs Navigasi Aktivitas (Orders, Komplain, Reviews) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Tab Navigation Buttons */}
          <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border-2 border-border shadow-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveMainTab("orders")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer whitespace-nowrap",
                activeMainTab === "orders"
                  ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <ShoppingBag className="size-4" />
              <span>Histori Pesanan ({customer.orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("complaints")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer whitespace-nowrap",
                activeMainTab === "complaints"
                  ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageSquareWarning className="size-4" />
              <span>Klaim &amp; Garansi ({customer.complaints.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab("reviews")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer whitespace-nowrap",
                activeMainTab === "reviews"
                  ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className="size-4" />
              <span>Ulasan Produk ({customer.reviews.length})</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          {activeMainTab === "orders" && (
            <CustomerOrdersTab orders={customer.orders} />
          )}

          {activeMainTab === "complaints" && (
            <CustomerComplaintsTab complaints={customer.complaints} />
          )}

          {activeMainTab === "reviews" && (
            <CustomerReviewsTab reviews={customer.reviews} />
          )}
        </div>

        {/* Kolom Kanan — Profil Data Diri, Alamat Pengiriman, & Info Akun */}
        <div className="lg:col-span-1">
          <CustomerProfileCard
            name={customer.name}
            email={customer.email}
            phone={customer.phone}
            gender={customer.gender}
            taxId={customer.tax_id}
            taxCountry={customer.tax_country}
            resellerApprovedAt={customer.reseller_approved_at}
            createdAt={customer.created_at}
            lastLoginAt={customer.last_login_at}
            addresses={customer.addresses}
          />
        </div>
      </div>
    </div>
  );
}
