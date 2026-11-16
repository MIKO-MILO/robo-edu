"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useSalesReport, useTopProductsReport, usePaymentMethodsReport, useOrderStatusReport, useCategorySalesReport } from "@/hooks/admin/reports";
import type { ReportDateRangeParams, SalesDateRangeParams } from "@/lib/api/services/admin.service";
import {
  ReportsHeader,
  ReportsFilters,
  SalesMetricsCards,
  RevenueChartCard,
  CategorySalesCard,
  TopProductsReportCard,
  PaymentMethodCard,
  OrderStatusBreakdownCard,
} from "@/components/admin/reports";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesReportQueryParams } from "@/lib/api/services/admin.service";
import type {
  SalesReportPoint,
  CategorySalesReportItem,
  TopProductReportItem,
  SalesMetricsOverview,
  PaymentMethodBreakdownItem,
  OrderStatusBreakdownItem,
} from "@/types";

// ── Display mappings ─────────────────────────────────────────────────────────

/**
 * Maps raw payment_channel (the specific Midtrans channel value stored at
 * checkout) to a UI display category. payment_channel is the more granular
 * value (e.g. "bca_va", "qris", "gopay") vs payment_type which is the broad
 * category ("bank_transfer", "gopay"). We prefer channel for grouping.
 *
 * Falls back to payment_type when channel is null (older rows without it).
 */
const CHANNEL_DISPLAY_MAP: Record<
  string,
  { key: string; name: string; color: string }
> = {
  // Virtual Account / Bank Transfer
  bca_va:     { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  bni_va:     { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  bri_va:     { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  mandiri_va: { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  permata_va: { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  cimb_va:    { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  bank_transfer: { key: "BANK_TRANSFER", name: "Transfer Bank & Virtual Account", color: "bg-accent-blue text-[#0C4A6E]" },
  // QRIS
  qris:       { key: "QRIS", name: "QRIS & Instant Payment", color: "bg-accent-yellow text-secondary" },
  // E-Wallet
  gopay:      { key: "E_WALLET", name: "E-Wallet (GoPay/OVO/ShopeePay)", color: "bg-accent-green text-[#1A472A]" },
  shopeepay:  { key: "E_WALLET", name: "E-Wallet (GoPay/OVO/ShopeePay)", color: "bg-accent-green text-[#1A472A]" },
  ovo:        { key: "E_WALLET", name: "E-Wallet (GoPay/OVO/ShopeePay)", color: "bg-accent-green text-[#1A472A]" },
  dana:       { key: "E_WALLET", name: "E-Wallet (GoPay/OVO/ShopeePay)", color: "bg-accent-green text-[#1A472A]" },
  // Retail / Convenience Store
  alfamart:   { key: "RETAIL", name: "Minimarket (Alfamart/Indomaret)", color: "bg-muted text-muted-foreground" },
  indomaret:  { key: "RETAIL", name: "Minimarket (Alfamart/Indomaret)", color: "bg-muted text-muted-foreground" },
  // Credit / Debit Card
  credit_card: { key: "CREDIT_CARD", name: "Kartu Kredit & Debit Online", color: "bg-accent-purple text-[#2E1065]" },
};

const DEFAULT_PAYMENT_DISPLAY = {
  key: "OTHER",
  name: "Metode Pembayaran Lainnya",
  color: "bg-muted text-muted-foreground",
};

function resolvePaymentDisplay(paymentType: string, paymentChannel: string | null) {
  // Prefer channel (more specific), fall back to type
  const lookup = paymentChannel ?? paymentType;
  return CHANNEL_DISPLAY_MAP[lookup.toLowerCase()] ?? DEFAULT_PAYMENT_DISPLAY;
}

/** Maps uppercase order status to a display label and color. */
const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Menunggu Pembayaran (Pending)", color: "bg-accent-yellow/50 text-secondary border-secondary/30" },
  PAID: { label: "Sudah Dibayar (Paid)", color: "bg-accent-blue/40 text-primary border-primary/30" },
  PROCESSING: { label: "Diproses & Dikirim (Processing)", color: "bg-accent-blue/40 text-primary border-primary/30" },
  SHIPPED: { label: "Dikirim (Shipped)", color: "bg-accent-blue/40 text-primary border-primary/30" },
  DELIVERED: { label: "Sampai Tujuan (Delivered)", color: "bg-accent-green/40 text-success border-success/30" },
  COMPLETED: { label: "Pesanan Selesai (Completed)", color: "bg-accent-green/40 text-success border-success/30" },
  CANCELLED: { label: "Pesanan Dibatalkan (Cancelled)", color: "bg-accent-peach/60 text-danger border-danger/30" },
  REFUNDED: { label: "Pengembalian Dana (Refunded)", color: "bg-accent-pink/50 text-[#831843] border border-[#831843]/30" },
};

// ── Component ────────────────────────────────────────────────────────────────

function AdminReportsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Compute default date range (current calendar month)
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultTo = now.toISOString().split("T")[0];

  // Extract query filters from URL
  const filters: SalesReportQueryParams = {
    date_from: searchParams.get("date_from") || defaultFrom,
    date_to: searchParams.get("date_to") || defaultTo,
    group_by:
      (searchParams.get("group_by") as "day" | "week" | "month") || "day",
  };

  // Params for the breakdown endpoints (use start_date/end_date; API defaults
  // to current month when not provided)
  const breakdownParams: ReportDateRangeParams = {
    start_date: searchParams.get("date_from") || undefined,
    end_date: searchParams.get("date_to") || undefined,
  };

  // Params for the top-products endpoint (uses from/to like the sales endpoint)
  const topProductsParams: SalesDateRangeParams & { limit?: number } = {
    from: filters.date_from,
    to: filters.date_to,
    limit: 10,
  };

  // React Query Hooks
  const {
    data: salesResponse,
    isLoading: isSalesLoading,
    isError: isSalesError,
    error: salesError,
    refetch: refetchSales,
    isFetching: isSalesFetching,
  } = useSalesReport(filters);

  const {
    data: topProductsResponse,
    isLoading: isTopProductsLoading,
    refetch: refetchTopProducts,
  } = useTopProductsReport(topProductsParams);

  const {
    data: paymentMethodsResponse,
    isLoading: isPaymentMethodsLoading,
    refetch: refetchPaymentMethods,
  } = usePaymentMethodsReport(breakdownParams);

  const {
    data: orderStatusResponse,
    isLoading: isOrderStatusLoading,
    refetch: refetchOrderStatus,
  } = useOrderStatusReport(breakdownParams);

  const {
    data: categorySalesResponse,
    isLoading: isCategorySalesLoading,
    refetch: refetchCategorySales,
  } = useCategorySalesReport(breakdownParams);

  const handleFilterChange = (newFilters: SalesReportQueryParams) => {
    const params = new URLSearchParams();
    if (newFilters.date_from) params.set("date_from", newFilters.date_from);
    if (newFilters.date_to) params.set("date_to", newFilters.date_to);
    if (newFilters.group_by && newFilters.group_by !== "day") {
      params.set("group_by", newFilters.group_by);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleRefresh = () => {
    refetchSales();
    refetchTopProducts();
    refetchPaymentMethods();
    refetchOrderStatus();
    refetchCategorySales();
  };

  // CSV Export logic
  const handleExportCSV = () => {
    const reportPoints = salesData;
    const csvRows: string[] = [];

    // Header CSV
    csvRows.push("Periode,Total Order,Total Revenue (Rp)");

    reportPoints.forEach((pt) => {
      csvRows.push(`"${pt.period}",${pt.total_orders},${pt.total_revenue}`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan-penjualan-roboedu-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Data mapping ──────────────────────────────────────────────────────────

  // Map sales report response to SalesReportPoint[] based on group_by
  const salesReport = salesResponse?.data;
  const groupBy = filters.group_by || "day";

  const salesData: SalesReportPoint[] = (() => {
    if (!salesReport) return [];
    if (groupBy === "week") {
      return salesReport.by_week.map((r) => ({
        period: r.week,
        total_orders: r.transaction_count,
        total_revenue: r.revenue,
      }));
    }
    if (groupBy === "month") {
      return salesReport.by_month.map((r) => ({
        period: r.month,
        total_orders: r.transaction_count,
        total_revenue: r.revenue,
      }));
    }
    return salesReport.by_day.map((r) => ({
      period: r.date,
      total_orders: r.transaction_count,
      total_revenue: r.revenue,
    }));
  })();

  // Extract order status counts for the metrics overview
  const orderStatusData = orderStatusResponse?.data?.statuses ?? [];
  const statusCount = (status: string) =>
    orderStatusData.find((s) => s.status === status)?.count ?? 0;

  // Calculated Sales Metrics Overview
  const salesReportSummary = salesReport?.summary;
  const calculatedTotalRevenue = salesReportSummary?.total_revenue ?? 0;
  const calculatedTotalOrders = salesReportSummary?.transaction_count ?? 0;
  const allOrdersCount = orderStatusResponse?.data?.summary?.total_orders ?? calculatedTotalOrders;
  const totalItemsSold = categorySalesResponse?.data?.summary?.total_sold ?? 0;
  const avgOrderValue =
    calculatedTotalOrders > 0
      ? Math.round(calculatedTotalRevenue / calculatedTotalOrders)
      : 0;

  const salesMetrics: SalesMetricsOverview = {
    total_revenue: calculatedTotalRevenue,
    total_orders: allOrdersCount,
    completed_orders: statusCount("COMPLETED"),
    pending_orders: statusCount("PENDING"),
    cancelled_orders: statusCount("CANCELLED"),
    refunded_orders: statusCount("REFUNDED"),
    average_order_value: avgOrderValue,
    total_items_sold: totalItemsSold,
    growth_percentage: salesReportSummary?.growth_percentage ?? 0,
    repeat_customer_rate: 0,
  };

  // 1. Breakdown Metode Pembayaran — map and aggregate by display category
  const paymentMethods: PaymentMethodBreakdownItem[] = (() => {
    const methods = paymentMethodsResponse?.data?.methods ?? [];
    const aggregated = new Map<
      string,
      { name: string; color: string; total_transactions: number; total_revenue: number }
    >();

    for (const m of methods) {
      const display = resolvePaymentDisplay(m.payment_type, m.payment_channel);
      const existing = aggregated.get(display.key);
      if (existing) {
        existing.total_transactions += m.transaction_count;
        existing.total_revenue += m.total_revenue;
      } else {
        aggregated.set(display.key, {
          name: display.name,
          color: display.color,
          total_transactions: m.transaction_count,
          total_revenue: m.total_revenue,
        });
      }
    }

    const grandTotal = Array.from(aggregated.values()).reduce(
      (s, v) => s + v.total_revenue,
      0,
    );

    return Array.from(aggregated.entries())
      .map(([key, val]) => ({
        method_key: key,
        name: val.name,
        total_transactions: val.total_transactions,
        total_revenue: val.total_revenue,
        percentage:
          grandTotal > 0
            ? Math.round((val.total_revenue / grandTotal) * 1000) / 10
            : 0,
        color_class: val.color,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);
  })();

  // 2. Detail Status Pesanan Lengkap
  const orderStatusList: OrderStatusBreakdownItem[] = (() => {
    const statuses = orderStatusResponse?.data?.statuses ?? [];
    const totalOrders = orderStatusResponse?.data?.summary?.total_orders ?? 0;

    return statuses.map((s) => {
      const display = STATUS_DISPLAY[s.status] ?? {
        label: s.status,
        color: "bg-muted text-muted-foreground border-border/30",
      };
      return {
        status_key: s.status as OrderStatusBreakdownItem["status_key"],
        label: display.label,
        count: s.count,
        total_amount: s.total_amount,
        percentage:
          totalOrders > 0
            ? Math.round((s.count / totalOrders) * 1000) / 10
            : 0,
        color: display.color,
      };
    });
  })();

  // 3. Category sales breakdown
  const categorySales: CategorySalesReportItem[] = (() => {
    const cats = categorySalesResponse?.data?.categories ?? [];
    const totalRevenue = categorySalesResponse?.data?.summary?.total_revenue ?? 0;

    return cats.map((c, idx) => ({
      category_id: c.category_id,
      category_name: c.category_name,
      total_sold: c.total_sold,
      total_revenue: c.total_revenue,
      percentage: c.percentage,
      // Heuristic: top half is fast-moving, bottom half is slow-moving
      movement_type: idx < Math.ceil(cats.length / 2) ? "FAST_MOVING" : "SLOW_MOVING",
      profit_margin: Math.max(38 - idx * 4, 15),
    }));
  })();

  // 4. Top products report mapping
  const topProductsList: TopProductReportItem[] = (() => {
    const products = topProductsResponse?.data?.products ?? [];

    return products.map((p, idx) => ({
      product_id: p.product_id,
      name: p.product_name,
      total_sold: p.total_sold,
      total_revenue: p.total_revenue,
      average_price: p.total_sold > 0 ? Math.round(p.total_revenue / p.total_sold) : 0,
      movement_type: idx <= 2 ? "FAST_MOVING" : "SLOW_MOVING",
      profit_margin: Math.max(35 - idx * 3, 15),
    }));
  })();

  const isLoading =
    isSalesLoading ||
    isTopProductsLoading ||
    isPaymentMethodsLoading ||
    isOrderStatusLoading ||
    isCategorySalesLoading ||
    isPending;

  return (
    <div className="space-y-8 pb-12 font-body">
      {/* 1. Page Header */}
      <ReportsHeader
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        isFetching={isSalesFetching}
      />

      {/* 2. Filters & Range Selector */}
      <ReportsFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 3. Metrik Penjualan & Summary Cards */}
      <SalesMetricsCards metrics={salesMetrics} isLoading={isLoading} />

      {/* 4. Charts & Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Laporan Revenue & Trend Chart (Spans 2 cols) */}
        <RevenueChartCard
          data={salesData}
          isLoading={isLoading}
          className="lg:col-span-2 h-full"
        />

        {/* Penjualan Per Kategori + Fast/Slow Moving & Margin (Spans 1 col) */}
        <CategorySalesCard
          categories={categorySales}
          isLoading={isLoading}
          className="lg:col-span-1 h-full"
        />
      </div>

      {/* 5. Breakdown Metode Pembayaran & Detail Status Pesanan Lengkap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Breakdown Metode Pembayaran (QRIS, Transfer Bank, E-Wallet, Kartu Kredit) */}
        <PaymentMethodCard
          methods={paymentMethods}
          isLoading={isLoading}
          className="h-full"
        />

        {/* Detail Status Pesanan Lengkap (Completed, Processing, Pending, Cancelled, Refunded) */}
        <OrderStatusBreakdownCard
          statuses={orderStatusList}
          isLoading={isLoading}
          className="h-full"
        />
      </div>

      {/* 6. Laporan Produk Terlaris Table (With Sisa Stok Column & Fast/Slow Moving tag) */}
      <TopProductsReportCard
        products={topProductsList}
        isLoading={isLoading}
      />
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 p-4">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      }
    >
      <AdminReportsContent />
    </Suspense>
  );
}
