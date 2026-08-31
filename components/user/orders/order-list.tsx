import { OrderCard } from "./order-card";
import { OrderListSkeleton } from "./order-card-skeleton";
import { OrderEmptyState } from "./order-empty-state";
import type { OrderTabValue } from "./order-status-tabs";
import type { OrderListItem } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Component — render kondisional: loading | empty | list
// ─────────────────────────────────────────────────────────────────────────────
interface OrderListProps {
  orders: OrderListItem[];
  isLoading: boolean;
  activeTab: OrderTabValue;
  skeletonCount?: number;
}

export function OrderList({
  orders,
  isLoading,
  activeTab,
  skeletonCount = 3,
}: OrderListProps) {
  // Loading state
  if (isLoading) {
    return <OrderListSkeleton count={skeletonCount} />;
  }

  // Empty state
  if (orders.length === 0) {
    return <OrderEmptyState activeTab={activeTab} />;
  }

  // Data
  return (
    <ul className="flex flex-col gap-4 list-none p-0 m-0">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}
