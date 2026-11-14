/**
 * Barrel exports — components/admin/membership
 *
 * Import individual components dari sini:
 *   import { ResellerTable, ResellerFilters, ResellerStatsGrid } from "@/components/admin/membership";
 */

// Types (new API-shaped)
export type {
  AdminMemberRow,
  AdminMemberStats,
} from "./membership-list-types";

// Types (legacy — kept for reference, not used by pages)
export type {
  AdminResellerRow,
  ResellerStats,
  AdminResellerDetailData,
  ResellerOrderSummary,
  ResellerStatusTabKey,
} from "./membership-list-types";
export { RESELLER_STATUS_TABS } from "./membership-list-types";

// Mock Data & Helpers (kept as reference, NOT imported by pages)
export {
  MOCK_ADMIN_RESELLERS,
  getResellerStats,
  getMockResellerDetail,
} from "./mock-data";

// Atoms
export { ResellerKpiCard } from "./membership-kpi-card";
export type { ResellerKpiCardProps } from "./membership-kpi-card";

export { ResellerStepper } from "./membership-stepper";
export type { ResellerStepperProps } from "./membership-stepper";

export { ResellerRejectModal } from "./membership-reject-modal";
export type { ResellerRejectModalProps, RejectReason } from "./membership-reject-modal";

// Molecules
export { ResellerStatsGrid } from "./membership-stats";
export type { ResellerStatsProps } from "./membership-stats";

export { ResellerFilters } from "./membership-filters";
export type { ResellerFiltersProps } from "./membership-filters";

export { ResellerDetailHeader } from "./membership-detail-header";
export type { ResellerDetailHeaderProps } from "./membership-detail-header";

export { ResellerInfoCard } from "./membership-info-card";
export type { ResellerInfoCardProps } from "./membership-info-card";

export { ResellerApprovalCard } from "./membership-approval-card";
export type { ResellerApprovalCardProps } from "./membership-approval-card";

export { ResellerOrdersTab } from "./membership-orders-tab";
export type { ResellerOrdersTabProps } from "./membership-orders-tab";

// Organisms
export { ResellerTable } from "./membership-table";
export type { ResellerTableProps } from "./membership-table";
