"use client";

import { X, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UserAddress } from "@/types/user";

interface CheckoutAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: UserAddress[];
  selectedAddressId: string | null;
  onSelect: (address: UserAddress) => void;
  onAddNew: () => void;
}

/**
 * CheckoutAddressModal
 * Modal daftar alamat pengiriman untuk memilih atau menambah alamat baru.
 * Addresses di-fetch dari GET /profile/addresses (UserAddress[]).
 * Memilih alamat meng-update selectedAddressId yang akan dikirim di POST /orders body.
 */
export function CheckoutAddressModal({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
}: CheckoutAddressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-4 border-border rounded-2xl bg-background max-w-xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center font-bold text-foreground hover:bg-accent-pink transition-colors neo-shadow-icon"
        >
          <X className="w-4 h-4" />
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-foreground" />
            <DialogTitle className="font-heading font-black text-xl text-foreground">
              Daftar Alamat Pengiriman
            </DialogTitle>
          </div>
          <DialogDescription>
            Pilih alamat tujuan paket atau daftarkan alamat baru
          </DialogDescription>
        </DialogHeader>

        {/* Address List */}
        <div className="space-y-3 mt-4">
          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddressId;
            return (
              <div
                key={addr.id}
                onClick={() => {
                  onSelect(addr);
                  onOpenChange(false);
                }}
                className={`p-4 rounded-xl border-2 border-border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-accent-butter/60"
                    : "bg-card hover:bg-accent-soft-blue/20"
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {addr.is_primary && (
                      <span className="px-2.5 py-1 rounded-full bg-accent-green text-foreground text-xs font-extrabold border border-border neo-shadow-icon">
                        ✓ Alamat Utama
                      </span>
                    )}
                    {addr.label && (
                      <span className="px-2.5 py-1 rounded-full bg-card text-foreground text-xs font-bold border border-border">
                        {addr.label}
                      </span>
                    )}
                  </div>
                  {!isSelected && (
                    <span className="text-xs font-bold text-primary">
                      Pilih Alamat Ini →
                    </span>
                  )}
                </div>

                {/* Name + Phone */}
                <div className="font-heading font-bold text-sm text-foreground">
                  {addr.recipient_name}
                  <span className="ml-2 text-xs font-body font-normal text-muted-foreground">
                    ({addr.phone})
                  </span>
                </div>

                {/* Full Address */}
                <p className="text-xs text-foreground mt-1 leading-relaxed">
                  {addr.address}
                  {addr.village && `, ${addr.village}`}
                  {`, ${addr.district}, ${addr.city}, ${addr.province}`}
                  {addr.postal_code && ` ${addr.postal_code}`}
                </p>
              </div>
            );
          })}

          {/* Empty state */}
          {addresses.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              Belum ada alamat tersimpan
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t-2 border-border/20 flex gap-3">
          <Button
            onClick={onAddNew}
            variant="accent-yellow"
            neo
            className="flex-1 font-heading font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Alamat Baru
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            neo
            className="font-bold text-xs rounded-xl"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
