/**
 * Barrel exports — components/admin/orders
 *
 * Import individual components dari sini:
 *   import { OrderTable, OrderFilters } from "@/components/admin/orders";
 */

// Types
export type { AdminOrderRow, OrderStats } from "./order-list-types";
export { ORDER_STATUS_TABS } from "./order-list-types";

// Atoms
export { OrderKpiCard } from "./order-kpi-card";
export type { OrderKpiCardProps } from "./order-kpi-card";

export { OrderInfoCard } from "./order-info-card";
export type { OrderInfoCardProps } from "./order-info-card";

// Molecules
export { OrderStatsGrid } from "./order-stats";
export type { OrderStatsProps } from "./order-stats";

export { OrderFilters } from "./order-filters";
export type { OrderFiltersProps } from "./order-filters";

export { OrderDetailHeader } from "./order-detail-header";
export type { OrderDetailHeaderProps } from "./order-detail-header";

export { OrderCustomerCard } from "./order-customer-card";
export type { OrderCustomerCardProps, OrderCustomerInfo } from "./order-customer-card";

export { OrderShippingCard } from "./order-shipping-card";
export type { OrderShippingCardProps, OrderShippingInfo } from "./order-shipping-card";

export { OrderPaymentCard } from "./order-payment-card";
export type { OrderPaymentCardProps, OrderPaymentInfo } from "./order-payment-card";

// Organisms
export { OrderTable } from "./order-table";
export type { OrderTableProps } from "./order-table";

export { OrderItemsCard } from "./order-items-card";
export type {
  OrderItemsCardProps,
  OrderLineItem,
  OrderPricingSummary,
} from "./order-items-card";
