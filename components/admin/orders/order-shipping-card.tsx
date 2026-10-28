import * as React from "react";
import { Truck, MapPin } from "lucide-react";
import { OrderInfoCard } from "./order-info-card";

export interface OrderShippingInfo {
  courier: string;
  service: string;
  tracking_number: string | null;
  address: string;
}

export interface OrderShippingCardProps {
  shipping: OrderShippingInfo;
}

/**
 * Molecule — card informasi pengiriman (kurir, no. resi, alamat tujuan).
 */
export function OrderShippingCard({ shipping }: OrderShippingCardProps) {
  return (
    <OrderInfoCard icon={<Truck className="size-4" />} title="Pengiriman">
      <div className="space-y-2 text-xs font-body">
        <div className="font-semibold text-foreground">
          {shipping.courier} ({shipping.service})
        </div>
        <div className="text-muted-foreground">
          No. Resi:{" "}
          <span className="font-bold text-foreground">
            {shipping.tracking_number ?? "Belum tersedia"}
          </span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground pt-1">
          <MapPin className="size-3.5 shrink-0 mt-0.5" />
          <span>{shipping.address}</span>
        </div>
      </div>
    </OrderInfoCard>
  );
}
