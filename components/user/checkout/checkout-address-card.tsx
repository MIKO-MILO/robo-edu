"use client";

import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserAddress } from "@/types/user";

interface CheckoutAddressCardProps {
  address: UserAddress;
  onManage: () => void;
  onEdit: () => void;
  onChangeAddress: () => void;
}

/**
 * CheckoutAddressCard
 * Menampilkan kartu alamat pengiriman aktif yang dipilih customer.
 * Konten datang dari UserAddress entity (types/user.ts).
 * Saat backend ready, address di-fetch dari GET /profile/addresses.
 */
export function CheckoutAddressCard({
  address,
  onManage,
  onEdit,
  onChangeAddress,
}: CheckoutAddressCardProps) {
  return (
    <div className="relative bg-accent-butter/60 border-2 border-border rounded-xl p-5">
      {/* Header: Badges + Kelola */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-accent-green text-foreground text-xs font-extrabold border border-border neo-shadow-icon">
            ✓ Alamat Utama
          </span>
          {address.label && (
            <span className="px-2.5 py-1 rounded-full bg-card text-foreground text-xs font-bold border border-border">
              {address.label}
            </span>
          )}
        </div>
        <button
          onClick={onManage}
          className="flex items-center gap-1.5 text-xs font-bold text-primary cursor-pointer hover:underline"
        >
          <span>Kelola</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recipient Name + Phone */}
      <div className="mb-3">
        <div className="font-heading font-bold text-base sm:text-lg text-foreground flex items-center gap-2.5 flex-wrap">
          <span>{address.recipient_name}</span>
          <span className="text-xs font-body font-normal text-muted-foreground bg-card/80 px-2.5 py-1 rounded-md border border-border/40">
            {address.phone}
          </span>
        </div>
        <p className="text-sm text-foreground mt-2 leading-relaxed font-medium">
          {address.address}
          {address.village && `, ${address.village}`}
          {`, ${address.district}, ${address.city}, ${address.province}`}
          {address.postal_code && ` ${address.postal_code}`}
        </p>
      </div>

      {/* Footer: Confirmation Dot + Actions */}
      <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between flex-wrap gap-3 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          Titik Pinpoint Maps Terkonfirmasi
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 rounded-lg bg-card border border-border font-semibold text-xs hover:bg-muted/40 transition-colors"
          >
            Ubah Alamat
          </button>
          <button
            onClick={onChangeAddress}
            className="px-3 py-1.5 rounded-lg bg-card border border-border font-semibold text-xs hover:bg-muted/40 transition-colors"
          >
            Pilih Alamat Lain
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CheckoutAddressEmpty
 * State ketika user belum memiliki alamat pengiriman yang tersimpan.
 */
export function CheckoutAddressEmpty({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="p-6 rounded-xl border-2 border-dashed border-border/40 bg-muted/20 flex flex-col items-center justify-center text-center gap-3">
      <MapPin className="w-10 h-10 text-muted-foreground/50" />
      <div>
        <p className="font-heading font-bold text-foreground text-sm">
          Belum ada alamat pengiriman
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Tambahkan alamat tujuan paket terlebih dahulu
        </p>
      </div>
      <Button variant="accent-yellow" size="sm" onClick={onAddNew} neo>
        + Tambah Alamat Baru
      </Button>
    </div>
  );
}
