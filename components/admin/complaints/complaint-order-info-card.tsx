import * as React from "react";
import { Package, ShoppingCart, Banknote } from "lucide-react";

export interface ComplaintOrderInfoCardProps {
  productName: string;
  orderNumber: string;
  priceSnapshot: number | null;
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
 * Molecule — kartu info order item yang diklaim.
 * Menampilkan nama produk, nomor order, dan harga saat pembelian (price_snapshot).
 */
export function ComplaintOrderInfoCard({
  productName,
  orderNumber,
  priceSnapshot,
}: ComplaintOrderInfoCardProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b-2 border-border pb-3">
        <Package className="size-4 text-primary" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Item yang Diklaim
        </h3>
      </div>

      <div className="space-y-3">
        {/* Product name */}
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            <Package className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Nama Produk
            </p>
            <p className="font-semibold text-foreground text-sm leading-snug">
              {productName}
            </p>
          </div>
        </div>

        {/* Order number */}
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-info-bg text-info shrink-0 mt-0.5">
            <ShoppingCart className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Nomor Order
            </p>
            <p className="font-mono font-bold text-foreground text-sm">{orderNumber}</p>
          </div>
        </div>

        {/* Price snapshot */}
        {priceSnapshot !== null && (
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-success-bg text-success shrink-0 mt-0.5">
              <Banknote className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Harga Saat Pembelian
              </p>
              <p className="font-heading font-bold text-foreground text-sm">
                {formatIDR(priceSnapshot)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
