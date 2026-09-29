"use client";

import React, { use, useState } from "react";
import {
  OrderDetailHeader,
  OrderItemsCard,
  OrderCustomerCard,
  OrderShippingCard,
  OrderPaymentCard,
  OrderStatusActionCard,
} from "@/components/admin/orders";
import type { AdminOrderDetailData } from "@/components/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types/enums";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Mock detail data generator — akan diganti dengan useOrderDetail(id) hook saat backend siap.
// Menggunakan struktur snapshot PRD Bab 13.3.
// ---------------------------------------------------------------------------
const MOCK_ORDERS_DATA: Record<string, AdminOrderDetailData> = {
  "ord-001": {
    id: "ord-001",
    order_number: "ORD-112-9876543-1234567",
    status: "DELIVERED" as OrderStatus,
    created_at: "2023-10-24T10:15:00Z",
    updated_at: "2023-10-26T14:30:00Z",
    customer_id: "cust-1",
    customer: {
      name: "Alex Student",
      email: "alex@example.com",
      phone: "+62 812-9876-5432",
    },
    shipping: {
      courier: "J&T Express",
      service: "Regular",
      tracking_number: "JNT98765431234",
      recipient_name: "Alex Student",
      recipient_phone: "+62 812-9876-5432",
      shipping_address: "Jl. Margonda Raya No. 120",
      shipping_village: "Pondok Cina",
      shipping_district: "Beji",
      shipping_city: "Depok",
      shipping_province: "Jawa Barat",
      shipping_postal_code: "16424",
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
    ],
    pricing: {
      subtotal: 1800000,
      shipping_cost: 50000,
      discount_amount: 100000,
      total: 1750000,
      voucher_code: "ROBOEDU10",
    },
  },
  "ord-004": {
    id: "ord-004",
    order_number: "ORD-20231105-0089",
    status: "PROCESSING" as OrderStatus,
    created_at: "2023-11-05T13:45:00Z",
    updated_at: "2023-11-05T14:10:00Z",
    customer_id: "cust-4",
    customer: {
      name: "Dimas Anggara",
      email: "dimas.ang@outlook.com",
      phone: "+62 817-7788-9900",
    },
    shipping: {
      courier: "SiCepat",
      service: "BEST",
      tracking_number: null,
      recipient_name: "Dimas Anggara",
      recipient_phone: "+62 817-7788-9900",
      shipping_address: "Jl. Dago Asri No. 45",
      shipping_village: "Dago",
      shipping_district: "Coblong",
      shipping_city: "Kota Bandung",
      shipping_province: "Jawa Barat",
      shipping_postal_code: "40135",
    },
    payment: {
      status: "PAID" as PaymentStatus,
      method: "QRIS",
      transaction_id: "TRX-QRIS-554433221",
    },
    items: [
      {
        id: "item-4",
        name: "ESP32 IoT Starter Experiment Board",
        variant: "Standard",
        sku: "ESP32-ST-01",
        price: 450000,
        quantity: 1,
        subtotal: 450000,
      },
    ],
    pricing: {
      subtotal: 450000,
      shipping_cost: 25000,
      discount_amount: 0,
      total: 475000,
      voucher_code: null,
    },
  },
  "ord-007": {
    id: "ord-007",
    order_number: "ORD-20231107-0130",
    status: "PAID" as OrderStatus,
    created_at: "2023-11-07T11:20:00Z",
    updated_at: "2023-11-07T11:25:00Z",
    customer_id: "cust-7",
    customer: {
      name: "Gita Permata",
      email: "gita.p@gmail.com",
      phone: "+62 812-3344-5566",
    },
    shipping: {
      courier: "JNE",
      service: "REG",
      tracking_number: null,
      recipient_name: "Gita Permata",
      recipient_phone: "+62 812-3344-5566",
      shipping_address: "Jl. Kaliurang KM 5 No. 18",
      shipping_village: "Caturtunggal",
      shipping_district: "Depok",
      shipping_city: "Kab. Sleman",
      shipping_province: "D.I. Yogyakarta",
      shipping_postal_code: "55281",
    },
    payment: {
      status: "PAID" as PaymentStatus,
      method: "BCA Virtual Account",
      transaction_id: "TRX-BCA-112233445",
    },
    items: [
      {
        id: "item-7",
        name: "Arduino Uno R4 WiFi Dev Board",
        variant: "Original",
        sku: "ARD-R4-WIFI",
        price: 520000,
        quantity: 1,
        subtotal: 520000,
      },
      {
        id: "item-8",
        name: "Sensor Kit 37-in-1 Starter Pack",
        variant: "Box Set",
        sku: "SEN-KIT-37",
        price: 370000,
        quantity: 1,
        subtotal: 370000,
      },
    ],
    pricing: {
      subtotal: 890000,
      shipping_cost: 30000,
      discount_amount: 50000,
      total: 870000,
      voucher_code: "ROBOEDU10",
    },
  },
};

function getMockOrder(id: string): AdminOrderDetailData {
  if (MOCK_ORDERS_DATA[id]) {
    return MOCK_ORDERS_DATA[id];
  }

  // Fallback data generator jika ID lain dibuka
  return {
    ...MOCK_ORDERS_DATA["ord-001"],
    id,
    order_number: `ORD-${id.toUpperCase()}-2023`,
  };
}

export default function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = use(params);
  const initialOrder = getMockOrder(id);

  // Optimistic UI state untuk status dan tracking number
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(initialOrder.status);
  const [currentTracking, setCurrentTracking] = useState<string | null>(
    initialOrder.shipping.tracking_number
  );
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const handleUpdateStatus = (newStatus: OrderStatus, trackingNumber?: string) => {
    setCurrentStatus(newStatus);
    if (trackingNumber !== undefined) {
      setCurrentTracking(trackingNumber);
    }
    setStatusNotification(`Status pesanan berhasil diubah menjadi "${newStatus}".`);

    // Auto dismiss notification banner setelah 4 detik
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const handleUpdateTrackingNumber = (trackingNumber: string) => {
    setCurrentTracking(trackingNumber);
    setStatusNotification(`Nomor resi berhasil diperbarui: ${trackingNumber}`);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4000);
  };

  const currentShipping = {
    ...initialOrder.shipping,
    tracking_number: currentTracking,
  };

  const currentCustomerInfo = {
    id: initialOrder.customer_id,
    name: initialOrder.customer.name,
    email: initialOrder.customer.email,
    phone: initialOrder.customer.phone,
  };

  return (
    <div className="space-y-6">
      {/* Back + Title + Status */}
      <OrderDetailHeader
        orderNumber={initialOrder.order_number}
        status={currentStatus}
        createdAt={initialOrder.created_at}
        customerId={initialOrder.customer_id}
      />

      {/* Optimistic Status Update Toast/Banner */}
      {statusNotification && (
        <div className="p-3.5 rounded-2xl bg-success-bg border-2 border-success/30 text-success text-xs font-heading font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>✓ {statusNotification}</span>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            className="text-success hover:underline text-[11px] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items & pricing (spans 2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsCard items={initialOrder.items} pricing={initialOrder.pricing} />
        </div>

        {/* Right sidebar — Tindak Lanjut Status, Customer, Shipping, Payment */}
        <div className="space-y-6">
          {/* Kartu aksi update status fulfillment & input resi (PRD Bab 13) */}
          <OrderStatusActionCard
            currentStatus={currentStatus}
            trackingNumber={currentTracking}
            courierName={initialOrder.shipping.courier}
            onUpdateStatus={handleUpdateStatus}
            onUpdateTrackingNumber={handleUpdateTrackingNumber}
          />

          <OrderCustomerCard customer={currentCustomerInfo} />
          <OrderShippingCard shipping={currentShipping} />
          <OrderPaymentCard payment={initialOrder.payment} />
        </div>
      </div>
    </div>
  );
}
