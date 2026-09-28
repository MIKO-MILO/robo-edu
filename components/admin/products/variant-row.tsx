import React from "react";
import type { ProductVariant, UUID } from "@/types";
import { Button } from "@/components/ui/button";
import { ProductStatusBadge } from "./product-status-badge";
import { Edit2Icon, Trash2Icon } from "lucide-react";

export type VariantItem = Pick<
  ProductVariant,
  "id" | "variant_name" | "sku" | "price" | "reseller_price" | "stock" | "status"
> & { weight?: number | null };

export interface VariantRowProps {
  variant: VariantItem;
  disabled?: boolean;
  onEdit?: (variant: VariantItem) => void;
  onDelete?: (variantId: UUID) => void;
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VariantRow({
  variant,
  disabled,
  onEdit,
  onDelete,
}: VariantRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-foreground text-base">
            {variant.variant_name}
          </span>
          <ProductStatusBadge status={variant.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-body">
          <span>SKU: <code className="font-mono">{variant.sku}</code></span>
          <span>Stok / Kuota: <strong className="text-foreground">{variant.stock}</strong></span>
          {variant.weight && <span>Berat: <strong>{variant.weight} kg</strong></span>}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* Prices */}
        <div className="text-right">
          <div className="font-heading font-bold text-foreground text-sm">
            {formatIDR(variant.price)}
          </div>
          {variant.reseller_price !== null && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Reseller: {formatIDR(variant.reseller_price)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="accent-yellow"
              size="icon-sm"
              neo={false}
              disabled={disabled}
              onClick={() => onEdit(variant)}
              title="Edit Varian"
            >
              <Edit2Icon className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="danger"
              size="icon-sm"
              neo={false}
              disabled={disabled}
              onClick={() => onDelete(variant.id)}
              title="Hapus Varian"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
