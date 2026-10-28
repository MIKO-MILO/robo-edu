import * as React from "react";
import { Truck, MapPin, Phone, User } from "lucide-react";
import { OrderInfoCard } from "./order-info-card";
import type { OrderShippingSnapshot } from "./order-list-types";

/** Alias untuk backward-compatibility */
export type OrderShippingInfo = OrderShippingSnapshot;

export interface OrderShippingCardProps {
  shipping: OrderShippingSnapshot;
  /** ID admin order — untuk link input resi (TODO: backend) */
  orderId?: string;
}

/**
 * Molecule — card informasi pengiriman berdasarkan snapshot PRD Bab 13.3.
 * Menampilkan: kurir, no. resi, nama penerima, no. HP, dan alamat terstruktur.
 */
export function OrderShippingCard({ shipping }: OrderShippingCardProps) {
  const fullAddress = [
    shipping.shipping_address,
    shipping.shipping_village,
    shipping.shipping_district,
    shipping.shipping_city,
    shipping.shipping_province,
    shipping.shipping_postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <OrderInfoCard icon={<Truck className="size-4" />} title="Pengiriman">
      <div className="space-y-3 text-xs font-body">
        {/* Kurir & Resi */}
        <div>
          <div className="font-semibold text-foreground">
            {shipping.courier} ({shipping.service})
          </div>
          <div className="text-muted-foreground mt-0.5">
            No. Resi:{" "}
            <span className="font-bold text-foreground font-mono">
              {shipping.tracking_number ?? (
                <span className="text-warning italic font-sans font-normal">
                  Belum tersedia
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Penerima */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="font-semibold text-foreground">{shipping.recipient_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-3.5 shrink-0" />
            <span>{shipping.recipient_phone}</span>
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 mt-0.5" />
          <span>{fullAddress}</span>
        </div>
      </div>
    </OrderInfoCard>
  );
}

