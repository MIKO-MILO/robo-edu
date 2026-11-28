"use client";

import { useState, useMemo } from "react";
import { X, MapPin, Plus, Search, CheckCircle, Pencil } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { UserAddress } from "@/types/user";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckoutAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: UserAddress[];
  selectedAddressId: string | null;
  onSelect: (address: UserAddress) => void;
  onAddNew: () => void;
  onEdit?: (address: UserAddress) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hitung unique label groups dari list alamat untuk filter pills */
function buildFilterPills(addresses: UserAddress[]) {
  const counts: Record<string, number> = {};
  for (const addr of addresses) {
    const key = addr.label ?? "Lainnya";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts).map(([label, count]) => ({ label, count }));
}

/** Format full address string */
function formatAddress(addr: UserAddress): string {
  return [addr.address, addr.village, addr.district, addr.city, addr.province, addr.postal_code]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Sub-component: AddressCard inside modal
// ---------------------------------------------------------------------------

interface ModalAddressCardProps {
  address: UserAddress;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
}

function ModalAddressCard({ address, isSelected, onSelect, onEdit }: ModalAddressCardProps) {
  return (
    <article
      className={`rounded-2xl p-4 relative transition-all shadow-xs ${isSelected
          ? "bg-card border border-dashed border-primary/60"
          : "bg-card border border-border/20 hover:bg-muted/10"
        }`}
    >
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {address.is_primary && (
            <span className="bg-accent-green/30 text-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
              Alamat Utama
            </span>
          )}
          {address.label && (
            <span className="bg-accent-soft-blue/50 text-foreground rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
              {address.label}
            </span>
          )}
        </div>
        {isSelected && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-100 px-2 py-0.5 rounded-full shadow-xs">
            <CheckCircle className="w-3 h-3 text-primary" />
            Terpilih
          </span>
        )}
      </div>

      {/* Recipient Name & Phone */}
      <div className="flex items-baseline gap-2 flex-wrap mb-1">
        <h3 className="font-heading font-extrabold text-base text-foreground">
          {address.recipient_name}
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">({address.phone})</span>
      </div>

      {/* Full Address */}
      <p className="text-xs text-foreground/75 leading-relaxed font-normal mb-2.5">
        {formatAddress(address)}
      </p>

      {/* Pinpoint status — only for selected */}
      {isSelected && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Pinpoint Maps Terverifikasi (Kurir Akurat)
        </div>
      )}

      {/* Card Action Footer */}
      <div
        className={`flex items-center justify-between pt-2.5 border-t ${isSelected ? "border-primary/15" : "border-border/10"
          }`}
      >
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted transition-colors shadow-xs"
        >
          <Pencil className="w-3 h-3" />
          Ubah Alamat
        </button>

        {isSelected ? (
          <div className="bg-primary text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Digunakan
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="bg-accent-soft-blue px-3.5 py-1.5 rounded-full font-semibold text-xs text-foreground hover:bg-accent-soft-blue/80 shadow-xs active:scale-95 transition flex items-center gap-1"
          >
            Pilih Alamat Ini →
          </button>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main Modal Component
// ---------------------------------------------------------------------------

/**
 * CheckoutAddressModal
 * Modal daftar alamat pengiriman — memilih, mencari, filter, ubah, atau tambah baru.
 *
 * Menggunakan DialogPrimitive.Root + Portal + Backdrop secara langsung
 * (bukan DialogContent wrapper) agar positioning bottom-sheet mobile
 * tidak dikonflik oleh base-ui inline styles.
 *
 * - Mobile  : bottom sheet (slide-up dari bawah, drag handle, rounded-t-3xl)
 * - Desktop : centered dialog (sm+, rounded-3xl, neo-shadow)
 */
export function CheckoutAddressModal({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelect,
  onAddNew,
  onEdit,
}: CheckoutAddressModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterPills = useMemo(() => buildFilterPills(addresses), [addresses]);

  const filteredAddresses = useMemo(() => {
    let list = addresses;
    if (activeFilter) list = list.filter((a) => a.label === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.recipient_name.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q) ||
          (a.label?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [addresses, activeFilter, searchQuery]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* ── Backdrop ── */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200" />

        {/*
         * ── Panel wrapper ──
         * Centring container: flex, items-end on mobile (sheet sticks to bottom),
         * items-center on sm+ (centered dialog).
         */}
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center overflow-hidden pointer-events-none">
          <DialogPrimitive.Popup
            className={[
              // shared
              "pointer-events-auto w-full bg-[#FDFBF7] flex flex-col overflow-hidden",
              "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200",
              // mobile: bottom sheet
              "max-h-[92vh]",
              "rounded-t-3xl shadow-2xl",
              "data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4",
              // desktop (sm+): centered dialog
              "sm:max-w-md md:max-w-3xl sm:max-h-[90vh]",
              "sm:rounded-3xl sm:shadow-2xl",
              "sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95",
              "sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0",
            ].join(" ")}
          >
            {/* ── Drag Handle (mobile only) ── */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 sm:hidden">
              <div className="w-12 h-1.5 bg-[#3D2900]/20 rounded-full" />
            </div>

            {/* ── Modal Header ── */}
            <div className="px-4 pt-2 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-border/15 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-2.5">
                <div>
                  <DialogPrimitive.Title className="font-heading font-bold text-base sm:text-xl text-foreground leading-tight">
                    Daftar Alamat Pengiriman
                  </DialogPrimitive.Title>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                    Pilih alamat pengiriman pesanan Anda
                  </p>
                </div>
              </div>
              <DialogPrimitive.Close
                aria-label="Tutup jendela modal"
                className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted transition shadow-xs flex items-center justify-center text-foreground shrink-0 active:scale-95"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </DialogPrimitive.Close>
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="px-4 sm:px-6 pt-3 pb-2.5 bg-[#FBF8F1] border-b border-border/10 shrink-0">
              <div className="relative mb-2.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama penerima atau alamat..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white text-xs text-foreground placeholder-muted-foreground border border-border/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium shadow-xs transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 pb-1 overflow-x-auto">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold shadow-xs whitespace-nowrap transition-all ${activeFilter === null
                      ? "bg-primary text-white"
                      : "bg-card border border-border/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                  Semua ({addresses.length})
                </button>
                {filterPills.map(({ label, count }) => (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(activeFilter === label ? null : label)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow-xs whitespace-nowrap transition-all ${activeFilter === label
                        ? "bg-primary text-white"
                        : "bg-card border border-border/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* ── Address Cards (Scrollable) ── */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              {filteredAddresses.map((addr) => (
                <ModalAddressCard
                  key={addr.id}
                  address={addr}
                  isSelected={addr.id === selectedAddressId}
                  onSelect={() => {
                    onSelect(addr);
                    onOpenChange(false);
                  }}
                  onEdit={() => onEdit?.(addr)}
                />
              ))}

              {filteredAddresses.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {searchQuery
                      ? `Tidak ada alamat untuk "${searchQuery}"`
                      : "Belum ada alamat tersimpan"}
                  </p>
                </div>
              )}
            </div>

            {/* ── Sticky Footer ── */}
            <footer className="bg-[#F3EFE4] sm:bg-[#FDFBF7] border-t border-border/15 p-4 sm:px-6 sm:py-4 flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => { onOpenChange(false); onAddNew(); }}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary-600 text-white shadow-sm py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Tambah Alamat Baru
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="bg-white sm:bg-muted hover:bg-muted text-foreground shadow-xs py-3 sm:py-2.5 px-4 sm:px-5 rounded-xl font-bold text-xs active:scale-95 transition shrink-0"
              >
                Tutup
              </button>
            </footer>
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}