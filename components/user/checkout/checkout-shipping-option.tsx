"use client";

import { cn } from "@/lib/utils";

export interface ShippingOption {
  /** Maps to ShippingProvider.id from types/order.ts */
  provider_id: string;
  provider_name: string;
  /** Maps to Shipment.service */
  service: string;
  service_label: string;
  badge?: string;
  badge_variant?: "green" | "yellow" | "blue";
  estimate: string;
  cost: number;
  note?: string;
}

interface CheckoutShippingOptionProps {
  option: ShippingOption;
  isSelected: boolean;
  onSelect: (option: ShippingOption) => void;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * CheckoutShippingOption
 * Radio card pilihan layanan kurir pengiriman.
 * Data provider dari GET /shipping-providers (types/order.ts ShippingProvider).
 * Field `service` langsung dipakai sebagai shipping_service di POST /orders body.
 */
export function CheckoutShippingOption({
  option,
  isSelected,
  onSelect,
}: CheckoutShippingOptionProps) {
  const badgeBg =
    option.badge_variant === "yellow"
      ? "bg-accent-yellow"
      : option.badge_variant === "blue"
        ? "bg-accent-soft-blue"
        : "bg-accent-green";

  return (
    <label
      className={cn(
        "relative flex items-center justify-between p-4 rounded-xl border-2 border-border cursor-pointer transition-all",
        isSelected
          ? "bg-accent-soft-blue/20"
          : "bg-card hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3.5">
        {/* Radio input (accessible, hidden visually but functional) */}
        <input
          type="radio"
          name="shipping"
          value={option.service}
          checked={isSelected}
          onChange={() => onSelect(option)}
          className="w-5 h-5 text-primary border-2 border-border focus:ring-ring accent-primary cursor-pointer"
        />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-sm text-foreground">
              {option.provider_name} — {option.service_label}
            </span>
            {option.badge && (
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-black rounded-full border border-border",
                  badgeBg
                )}
              >
                {option.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimasi tiba:{" "}
            <strong className="text-foreground">{option.estimate}</strong>
            {option.note && ` · ${option.note}`}
          </p>
        </div>
      </div>

      {/* Price + sub-note */}
      <div className="text-right shrink-0">
        <span className="font-heading font-extrabold text-base text-foreground">
          {formatIDR(option.cost)}
        </span>
        {option.cost === 0 && (
          <span className="block text-[10px] text-emerald-700 font-bold">
            GRATIS
          </span>
        )}
      </div>
    </label>
  );
}
