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

// Orders Components
export {
  OrderKpiCard,
  OrderInfoCard,
  OrderStatsGrid,
  OrderFilters,
  OrderDetailHeader,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
  OrderTable,
  OrderItemsCard,
  ORDER_STATUS_TABS,
} from "./orders";
export type {
  AdminOrderRow,
  OrderStats,
  OrderKpiCardProps,
  OrderInfoCardProps,
  OrderStatsProps,
  OrderFiltersProps,
  OrderDetailHeaderProps,
  OrderCustomerCardProps,
  OrderCustomerInfo,
  OrderShippingCardProps,
  OrderShippingInfo,
  OrderPaymentCardProps,
  OrderPaymentInfo,
  OrderTableProps,
  OrderItemsCardProps,
  OrderLineItem,
  OrderPricingSummary,
} from "./orders";

// Customers Components
export {
  CustomerKpiCard,
  CustomerStatsGrid,
  CustomerFilters,
  CustomerTable,
  CustomerDetailHeader,
  CustomerMetricCards,
  CustomerProfileCard,
  CustomerOrdersTab,
  CustomerComplaintsTab,
  CustomerReviewsTab,
  CUSTOMER_RESELLER_TABS,
  MOCK_ADMIN_CUSTOMERS,
  getCustomerStats,
  getMockCustomerDetail,
} from "./customers";
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
// Dashboard Components
export * from "./dashboard";

// Reviews Components
export {
  ReviewStatsCards,
  ReviewTable,
  MOCK_ADMIN_REVIEWS,
  getReviewStats,
} from "./reviews";
export type {
  AdminReviewRow,
  ReviewStats,
  ReviewTableProps,
} from "./reviews";


// Reports Components
export * from "./reports";
