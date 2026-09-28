"use client";

import React, { use } from "react";
import {
  OrderDetailHeader,
  OrderItemsCard,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
} from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";
import type { OrderLineItem, OrderPricingSummary } from "@/components/admin/orders";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Mock detail data — akan diganti dengan useOrderDetail(id) hook saat backend siap.
// Shape-nya sudah sesuai dengan OrderDetail dari types/order.ts.
// ---------------------------------------------------------------------------
function getMockOrder(id: string) {
  return {
    id,
    order_number: "ORD-112-9876543-1234567",
    status: "DELIVERED" as OrderStatus,
    created_at: "2023-10-24T10:15:00Z",
    customer: {
      name: "Alex Student",
      email: "alex@example.com",
      phone: "+62 812-9876-5432",
    },
    shipping: {
      courier: "J&T Express",
      service: "Regular",
      tracking_number: "JNT98765431234",
      address: "Jl. Margonda Raya No. 120, Beji, Depok, Jawa Barat 16424",
    },
    payment: {
      status: "PAID" as PaymentStatus,
      method: "BCA Virtual Account",
      transaction_id: "TRX-BCA-987654321",
    },
    items: [
      {
        id: "item-1",
        name: "Advanced Servo Motor Controller Board V2 - Arduino Compatible",
        variant: "Arduino Edition / 16 Channel",
        sku: "SRV-ARD-16CH",
        price: 850000,
        quantity: 1,
        subtotal: 850000,
      },
      {
        id: "item-2",
        name: "Micro Servo SG90 9g Metal Gear (Pack of 4)",
        variant: "Standard",
        sku: "SRV-SG90-4P",
        price: 350000,
        quantity: 2,
        subtotal: 700000,
      },
      {
        id: "item-3",
        name: "Jumper Wire Dupont Cables Set (120 pcs)",
        variant: "Male to Female",
        sku: "CAB-DUP-120",
        price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ] satisfies OrderLineItem[],
    pricing: {
      subtotal: 1800000,
      shipping_cost: 50000,
      discount_amount: 0,
      total: 1850000,
    } satisfies OrderPricingSummary,
  };
}

export default function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = use(params);
  const order = getMockOrder(id);

  return (
    <div className="space-y-6">
      {/* Back + Title + Status */}
      <OrderDetailHeader
        orderNumber={order.order_number}
        status={order.status}
        createdAt={order.created_at}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items & pricing (spans 2 cols on large screens) */}
        <div className="lg:col-span-2">
          <OrderItemsCard items={order.items} pricing={order.pricing} />
        </div>

        {/* Right sidebar — Customer, Shipping, Payment */}
        <div className="space-y-6">
          <OrderCustomerCard customer={order.customer} />
          <OrderShippingCard shipping={order.shipping} />
          <OrderPaymentCard payment={order.payment} />
        </div>
      </div>
    </div>
  );
}
