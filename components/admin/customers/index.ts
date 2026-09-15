/**
 * Barrel exports — components/admin/customers
 *
 * Import individual components dari sini:
 *   import { CustomerTable, CustomerFilters, CustomerStatsGrid } from "@/components/admin/customers";
 */

// Types
export type {
  AdminCustomerRow,
  CustomerStats,
  CustomerOrderHistoryRow,
  CustomerComplaintRow,
  CustomerReviewRow,
  AdminCustomerDetailData,
} from "./customer-list-types";
export { CUSTOMER_RESELLER_TABS } from "./customer-list-types";

// Mock Data & Helpers
export {
  MOCK_ADMIN_CUSTOMERS,
  getCustomerStats,
  getMockCustomerDetail,
} from "./mock-data";

// Atoms
export { CustomerKpiCard } from "./customer-kpi-card";
export type { CustomerKpiCardProps } from "./customer-kpi-card";

// Molecules
export { CustomerStatsGrid } from "./customer-stats";
export type { CustomerStatsProps } from "./customer-stats";

export { CustomerFilters } from "./customer-filters";
export type { CustomerFiltersProps } from "./customer-filters";

export { CustomerDetailHeader } from "./customer-detail-header";
export type { CustomerDetailHeaderProps } from "./customer-detail-header";

export { CustomerMetricCards } from "./customer-metric-cards";
export type { CustomerMetricCardsProps } from "./customer-metric-cards";

export { CustomerProfileCard } from "./customer-profile-card";
export type { CustomerProfileCardProps } from "./customer-profile-card";

export { CustomerComplaintsTab } from "./customer-complaints-tab";
export type { CustomerComplaintsTabProps } from "./customer-complaints-tab";

export { CustomerReviewsTab } from "./customer-reviews-tab";
export type { CustomerReviewsTabProps } from "./customer-reviews-tab";

// Organisms
export { CustomerTable } from "./customer-table";
export type { CustomerTableProps } from "./customer-table";

export { CustomerOrdersTab } from "./customer-orders-tab";
export type { CustomerOrdersTabProps } from "./customer-orders-tab";
