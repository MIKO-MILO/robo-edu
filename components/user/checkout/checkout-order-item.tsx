"use client";

import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItemDetail } from "@/types/cart";
import type { ResellerStatus } from "@/types/enums";

interface CheckoutOrderItemProps {
  item: CartItemDetail;
  resellerStatus: ResellerStatus;
}

/** Format IDR currency */
function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * CheckoutOrderItem
 * Menampilkan satu baris item pesanan di section review order.
 * Data berasal dari CartItemDetail (cart.ts) yang di-fetch dari GET /cart.
 * Harga label ditentukan dari resellerStatus: APPROVED → tampilkan badge "Harga Reseller".
 */
export function CheckoutOrderItem({
  item,
  resellerStatus,
}: CheckoutOrderItemProps) {
  const isReseller = resellerStatus === "APPROVED";
  const thumbnailBg = "bg-accent-pink/40"; // TODO: rotate bg per item index via prop

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl border-2 border-border bg-card hover:bg-muted/20 transition-all">
      {/* Left: Thumbnail + Detail */}
      <div className="flex items-center gap-3.5">
        {/* Thumbnail */}
        <div
          className={cn(
            "w-20 h-20 rounded-xl border-2 border-border p-2 flex items-center justify-center shrink-0 neo-shadow-icon overflow-hidden",
            thumbnailBg
          )}
        >
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.product_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Package className="w-10 h-10 text-foreground/40" />
          )}
        </div>

        {/* Product Info */}
        <div>
          <h3 className="font-heading font-extrabold text-sm sm:text-base text-foreground mt-1">
            {item.product_name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {item.variant_name && (
              <span className="text-xs font-medium bg-muted text-foreground px-2 py-0.5 rounded border border-border/40">
                Varian: <strong>{item.variant_name}</strong>
              </span>
            )}
            <span className="text-xs font-bold text-foreground">
              Qty: {item.quantity}
            </span>
          </div>
          {item.available_stock < 5 && item.available_stock > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              Stok kuota:{" "}
              <span className="text-foreground font-bold">
                Tersisa {item.available_stock} pcs
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Price */}
      <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/20">
        {isReseller && (
          <span className="px-2 py-0.5 text-[10px] font-black rounded bg-accent-yellow text-foreground border border-border inline-block mb-1">
            Harga Reseller
          </span>
        )}
        {!isReseller && (
          <span className="px-2 py-0.5 text-[10px] font-black rounded bg-accent-green/60 text-emerald-900 border border-border inline-block mb-1">
            Harga Resmi
          </span>
        )}
        <div className="font-heading font-bold text-base sm:text-lg text-foreground">
          {formatIDR(item.line_total)}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {item.quantity} x {formatIDR(item.unit_price)}
        </div>
      </div>
    </div>
  );
}
