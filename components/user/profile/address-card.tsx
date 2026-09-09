"use client";

import { MapPin, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AddressData {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  isPrimary: boolean;
}

interface AddressCardProps {
  address: AddressData;
  onEdit: (address: AddressData) => void;
  onDelete: (address: AddressData) => void;
  onSetPrimary: (address: AddressData) => void;
  isSettingPrimary?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetPrimary,
  isSettingPrimary = false,
}: AddressCardProps) {
  const fullAddress = [
    address.address,
    address.village,
    address.district,
    address.city,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className={`relative rounded-2xl border-2 p-5 transition-colors ${
        address.isPrimary
          ? "border-primary bg-primary-100/20"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      {/* Primary badge */}
      {address.isPrimary && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-100">
          <Star className="w-3 h-3 fill-current" />
          Utama
        </span>
      )}

      {/* Label */}
      <p className="font-heading font-bold text-sm uppercase tracking-wide text-primary mb-2">
        {address.label}
      </p>

      {/* Recipient & phone */}
      <p className="font-body font-semibold text-sm text-foreground">
        {address.recipientName}
      </p>
      <p className="font-body text-sm text-muted-foreground mb-3">{address.phone}</p>

      {/* Full address */}
      <div className="flex items-start gap-2 text-sm text-foreground font-body">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <span>{fullAddress}</span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/60">
        {!address.isPrimary && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetPrimary(address)}
            disabled={isSettingPrimary}
            className="text-xs"
          >
            <Star className="w-3.5 h-3.5" />
            Jadikan Utama
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
          className="text-xs"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address)}
          className="text-xs text-danger hover:text-danger hover:bg-danger-bg"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus
        </Button>
      </div>
    </div>
  );
}
