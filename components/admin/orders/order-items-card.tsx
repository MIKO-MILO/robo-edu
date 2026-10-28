import * as React from "react";
import { Package } from "lucide-react";
import { OrderInfoCard } from "./order-info-card";

export interface OrderLineItem {
  id: string;
  name: string;
  variant: string | null;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPricingSummary {
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
}

export interface OrderItemsCardProps {
  items: OrderLineItem[];
  pricing: OrderPricingSummary;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Organism — card daftar item pesanan + ringkasan harga.
 * Props `items` dan `pricing` mudah dipetakan dari `OrderDetail` saat backend siap.
 */
export function OrderItemsCard({ items, pricing }: OrderItemsCardProps) {
  return (
    <OrderInfoCard
      icon={<Package className="size-4" />}
      title={`Item Pesanan (${items.length})`}
    >
      {/* Item List */}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="font-medium text-sm text-foreground leading-snug">
                {item.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.variant ? `Varian: ${item.variant} • ` : ""}SKU: {item.sku}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatIDR(item.price)} &times; {item.quantity}
              </div>
            </div>
            <div className="font-heading font-bold text-sm text-foreground whitespace-nowrap shrink-0">
              {formatIDR(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="pt-3 border-t-2 border-border space-y-2 text-sm font-body">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal Produk</span>
          <span>{formatIDR(pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Biaya Pengiriman</span>
          <span>{formatIDR(pricing.shipping_cost)}</span>
        </div>
        {pricing.discount_amount > 0 && (
          <div className="flex justify-between text-success">
            <span>Diskon Voucher</span>
            <span>-{formatIDR(pricing.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-border font-heading font-bold text-base text-foreground">
          <span>Total Pembayaran</span>
          <span className="text-primary">{formatIDR(pricing.total)}</span>
        </div>
      </div>
    </OrderInfoCard>
  );
}
