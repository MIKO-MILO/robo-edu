/**
 * Barrel exports — components/admin/resellers
 *
 * Import individual components dari sini:
 *   import { ResellerTable, ResellerFilters, ResellerStatsGrid } from "@/components/admin/resellers";
 */

// Types
export type {
  AdminResellerRow,
  ResellerStats,
  AdminResellerDetailData,
  ResellerOrderSummary,
  ResellerStatusTabKey,
} from "./reseller-list-types";
export { RESELLER_STATUS_TABS } from "./reseller-list-types";

// Mock Data & Helpers
export {
  MOCK_ADMIN_RESELLERS,
  getResellerStats,
  getMockResellerDetail,
} from "./mock-data";

// Atoms
export { ResellerKpiCard } from "./reseller-kpi-card";
export type { ResellerKpiCardProps } from "./reseller-kpi-card";

// Molecules
export { ResellerStatsGrid } from "./reseller-stats";
export type { ResellerStatsProps } from "./reseller-stats";

export { ResellerFilters } from "./reseller-filters";
export type { ResellerFiltersProps } from "./reseller-filters";

export { ResellerDetailHeader } from "./reseller-detail-header";
export type { ResellerDetailHeaderProps } from "./reseller-detail-header";

export { ResellerInfoCard } from "./reseller-info-card";
export type { ResellerInfoCardProps } from "./reseller-info-card";

export { ResellerApprovalCard } from "./reseller-approval-card";
export type { ResellerApprovalCardProps } from "./reseller-approval-card";

export { ResellerOrdersTab } from "./reseller-orders-tab";
export type { ResellerOrdersTabProps } from "./reseller-orders-tab";

// Organisms
export { ResellerTable } from "./reseller-table";
export type { ResellerTableProps } from "./reseller-table";
