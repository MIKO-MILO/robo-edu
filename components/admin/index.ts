"use client";

// Data Table
export { DataTable } from "./data-table";
export type { ColumnDef, DataTableFilter, DataTableProps } from "./data-table";

// Form Components (CVA)
export { AdminInput } from "./form/input";
export type { AdminInputProps } from "./form/input";

export { AdminSelect } from "./form/select";
export type { AdminSelectProps, AdminSelectOption } from "./form/select";

export { AdminTextarea } from "./form/textarea";
export type { AdminTextareaProps } from "./form/textarea";

export { AdminImageUpload } from "./form/image-upload";
export type { AdminImageUploadProps } from "./form/image-upload";

// Status Badge
export { StatusBadge } from "./status-badge";
export type { StatusBadgeProps, StatusEnum } from "./status-badge";

// Confirm Delete Dialog
export { ConfirmDeleteDialog } from "./confirm-delete-dialog";
export type { ConfirmDeleteDialogProps } from "./confirm-delete-dialog";

// Toast System
export { Toaster } from "./toast";
export { useToast, toast, dismissToast } from "./use-toast";
export type { ToastItem, ToastVariant } from "./use-toast";

// Layout Components
export { AdminSidebar } from "./sidebar";
export type { AdminSidebarProps, NavItem } from "./sidebar";

export { AdminTopBar } from "./top-bar";
export type { AdminTopBarProps, AdminUserProps } from "./top-bar";

// Dashboard Components
export * from "./dashboard";

// Complaints Components
export {
  ComplaintStatsGrid,
  ComplaintFilters,
  ComplaintTable,
  ComplaintDetailHeader,
  ComplaintOrderInfoCard,
  ComplaintCustomerCard,
  ComplaintDescriptionCard,
  ComplaintAttachmentGallery,
  ComplaintActionPanel,
  COMPLAINT_STATUS_TABS,
  MOCK_ADMIN_COMPLAINTS,
  getMockComplaintDetail,
  getComplaintStats,
  deriveMediaType,
} from "./complaints";
export type {
  AdminCustomerRow,
  CustomerStats,
  CustomerOrderHistoryRow,
  CustomerComplaintRow,
  CustomerReviewRow,
  AdminCustomerDetailData,
  CustomerKpiCardProps,
  CustomerStatsProps,
  CustomerFiltersProps,
  CustomerTableProps,
  CustomerDetailHeaderProps,
  CustomerMetricCardsProps,
  CustomerProfileCardProps,
  CustomerOrdersTabProps,
  CustomerComplaintsTabProps,
  CustomerReviewsTabProps,
} from "./customers";

// Resellers Components
export {
  ResellerKpiCard,
  ResellerStatsGrid,
  ResellerFilters,
  ResellerTable,
  ResellerDetailHeader,
  ResellerInfoCard,
  ResellerApprovalCard,
  ResellerOrdersTab,
  RESELLER_STATUS_TABS,
  MOCK_ADMIN_RESELLERS,
  getResellerStats,
  getMockResellerDetail,
} from "./resellers";
export type {
  AdminResellerRow,
  ResellerStats,
  AdminResellerDetailData,
  ResellerOrderSummary,
  ResellerStatusTabKey,
  ResellerKpiCardProps,
  ResellerStatsProps,
  ResellerFiltersProps,
  ResellerTableProps,
  ResellerDetailHeaderProps,
  ResellerInfoCardProps,
  ResellerApprovalCardProps,
  ResellerOrdersTabProps,
} from "./resellers";
export type {
  AdminComplaintRow,
  AdminComplaintDetail,
  AdminComplaintAttachment,
  ComplaintStats,
  ComplaintStatsGridProps,
  ComplaintFiltersProps,
  ComplaintTableProps,
  ComplaintDetailHeaderProps,
  ComplaintOrderInfoCardProps,
  ComplaintCustomerCardProps,
  ComplaintAttachmentGalleryProps,
  ComplaintActionPanelProps,
} from "./complaints";

