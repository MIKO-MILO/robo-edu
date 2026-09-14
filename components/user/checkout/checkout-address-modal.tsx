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
      className={`rounded-2xl p-3.5 relative transition-all ${
        isSelected
          ? "border-2 border-[#3D2900] bg-[#FAF1CA] shadow-[2px_2px_0px_#3D2900]"
          : "border-2 border-dashed border-[#3D2900] bg-white"
      }`}
    >
      {/* Top Badges Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {address.is_primary && (
            <span className="bg-[#A9E8AE] border border-[#3D2900] rounded-full px-2 py-0.5 text-[11px] font-bold text-[#3D2900]">
              ✓ Alamat Utama
            </span>
          )}
          {address.label && (
            <span className="bg-[#8ED8FF] border border-[#3D2900] rounded-full px-2 py-0.5 text-[11px] font-bold text-[#3D2900]">
              {address.label}
            </span>
          )}
        </div>
        {isSelected && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1a5b23] bg-white/90 border border-[#3D2900] px-1.5 py-0.5 rounded-md">
            <CheckCircle className="w-3 h-3 text-green-600" />
            Terpilih
          </span>
        )}
      </div>

      {/* Recipient Name & Phone */}
      <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
        <h3 className="font-heading font-bold text-sm text-[#3D2900]">
          {address.recipient_name}
        </h3>
        <span className="text-[11px] font-semibold text-[#3D2900]/80">({address.phone})</span>
      </div>

      {/* Full Address */}
      <p className="text-xs text-[#3D2900]/90 leading-relaxed font-normal mb-2">
        {formatAddress(address)}
      </p>

      {/* Pinpoint status — only for selected */}
      {isSelected && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#14532d] mb-3">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
          Pinpoint Maps Terverifikasi (Kurir Akurat)
        </div>
      )}

      {/* Card Action Footer */}
      <div
        className={`flex items-center justify-between pt-2 border-t ${
          isSelected ? "border-[#3D2900]/20" : "border-[#3D2900]/10"
        }`}
      >
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#3D2900] px-2.5 py-1 rounded-lg border border-[#3D2900] bg-white shadow-[1.5px_1.5px_0px_#3D2900]"
        >
          <Pencil className="w-3 h-3" />
          Ubah Alamat
        </button>

        {isSelected ? (
          <div className="bg-[#2483D0] text-white border-2 border-[#3D2900] font-bold text-xs px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#3D2900] flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Digunakan
          </div>
        ) : (
          <button
            onClick={onSelect}
            className="bg-[#FFF37E] border-2 border-[#3D2900] shadow-[2px_2px_0px_#3D2900] px-3 py-1.5 rounded-xl font-bold text-xs text-[#3D2900] hover:translate-x-0.5 active:translate-x-0 active:translate-y-0 transition flex items-center gap-1"
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
              "border-t-2 border-[#3D2900] rounded-t-3xl",
              "shadow-[0px_-4px_0px_#3D2900]",
              "data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4",
              // desktop (sm+): centered dialog
              "sm:max-w-md md:max-w-3xl sm:max-h-[90vh]",
              "sm:border-2 sm:rounded-3xl",
              "sm:shadow-[6px_6px_0px_#3D2900]",
              "sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95",
              "sm:data-open:slide-in-from-bottom-0 sm:data-closed:slide-out-to-bottom-0",
            ].join(" ")}
          >
            {/* ── Drag Handle (mobile only) ── */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 sm:hidden">
              <div className="w-12 h-1.5 bg-[#3D2900]/30 rounded-full" />
            </div>

            {/* ── Modal Header ── */}
            <div className="px-4 pt-2 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b-2 border-[#3D2900]/15 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF37E] border-2 border-[#3D2900] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#3D2900] mt-0.5">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D2900]" />
                </div>
                <div>
                  <DialogPrimitive.Title className="font-heading font-bold text-base sm:text-xl text-[#3D2900] leading-tight">
                    Daftar Alamat Pengiriman
                  </DialogPrimitive.Title>
                  <p className="text-[11px] sm:text-xs text-[#8F8267] font-medium mt-0.5">
                    Pilih alamat pengiriman pesanan Anda
                  </p>
                </div>
              </div>
              <DialogPrimitive.Close
                aria-label="Tutup jendela modal"
                className="w-8 h-8 rounded-full border-2 border-[#3D2900] bg-white hover:bg-red-100 transition shadow-[1.5px_1.5px_0px_#3D2900] flex items-center justify-center text-[#3D2900] shrink-0 active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </DialogPrimitive.Close>
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="px-4 sm:px-6 pt-3 pb-2.5 bg-[#FBF8F1] border-b border-[#3D2900]/10 shrink-0">
              <div className="relative mb-2.5">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#3D2900]">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama penerima atau alamat..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white text-xs text-[#3D2900] placeholder-[#8F8267] border-2 border-[#3D2900] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2483D0] focus:border-[#3D2900] font-medium shadow-[1.5px_1.5px_0px_#3D2900] transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 pb-1 overflow-x-auto">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold border-2 border-[#3D2900] shadow-[1.5px_1.5px_0px_#3D2900] whitespace-nowrap transition ${
                    activeFilter === null
                      ? "bg-[#3D2900] text-white"
                      : "bg-[#C9E9F6] text-[#3D2900] hover:-translate-y-0.5"
                  }`}
                >
                  Semua ({addresses.length})
                </button>
                {filterPills.map(({ label, count }) => (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(activeFilter === label ? null : label)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border-2 border-[#3D2900] shadow-[1.5px_1.5px_0px_#3D2900] whitespace-nowrap transition hover:-translate-y-0.5 ${
                      activeFilter === label
                        ? "bg-[#3D2900] text-white"
                        : "bg-[#FFD9A0] text-[#3D2900]"
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
                  <p className="text-sm font-semibold text-[#8F8267]">
                    {searchQuery
                      ? `Tidak ada alamat untuk "${searchQuery}"`
                      : "Belum ada alamat tersimpan"}
                  </p>
                </div>
              )}
            </div>

            {/* ── Sticky Footer ── */}
            <footer className="bg-[#F3EFE4] sm:bg-[#FDFBF7] border-t-2 border-[#3D2900] p-4 sm:px-6 sm:py-4 flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => { onOpenChange(false); onAddNew(); }}
                className="flex-1 sm:flex-none bg-[#2483D0] hover:bg-[#1F6FB1] text-white border-2 border-[#3D2900] shadow-[2.5px_2.5px_0px_#3D2900] py-3 sm:py-2.5 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                + Tambah Alamat Baru
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="bg-white sm:bg-[#ECEAE6] hover:bg-[#ECEAE6] sm:hover:bg-[#DDD7C9] text-[#3D2900] border-2 border-[#3D2900] shadow-[2px_2px_0px_#3D2900] py-3 sm:py-2.5 px-4 sm:px-5 rounded-xl font-bold text-xs active:translate-x-0.5 active:translate-y-0.5 transition shrink-0"
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