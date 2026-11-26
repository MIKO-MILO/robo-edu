"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoucherCardMulti } from "./voucher-card-multi";
import { VoucherTicketSingle } from "./voucher-ticket-single";
import type { VoucherPromoItem } from "@/types/voucher";

// ==========================================
// Default Data Dummy (Backend-Ready & Extensible)
// Pola warna berulang 3 tema: Biru (0), Kuning (1), Ungu (2)
// ==========================================
export const DEFAULT_PROMOS: VoucherPromoItem[] = [
  {
    id: 1,
    kode: "MERDEKA24",
    nama: "Diskon Kemerdekaan",
    tipeDiskon: "PROMO TERBATAS",
    nilaiDiskon: "Diskon 20%",
    minPembelian: "Min. Rp 150rb",
    maxDiskon: "Maks. Rp 50rb",
    tanggalBerakhir: "31 Agt 2026",
    imgUrl: "/images/product.webp",
    secondaryImgUrl: "/images/robot2.webp",
  },
  {
    id: 2,
    nama: "Spesial Robotik Anak",
    tipeDiskon: "DISKON OTOMATIS",
    nilaiDiskon: "Potongan Rp 75rb",
    minPembelian: "Min. Rp 300rb",
    maxDiskon: null,
    tanggalBerakhir: "15 Jul 2026",
    imgUrl: "/images/product2.webp",
  },
  {
    id: 3,
    kode: "ROBOEDUFUN",
    nama: "Edukasi Robot Pintar",
    tipeDiskon: "PROMO SPESIAL",
    nilaiDiskon: "Diskon 25%",
    minPembelian: "Min. Rp 200rb",
    maxDiskon: "Maks. Rp 60rb",
    tanggalBerakhir: "20 Sep 2026",
    imgUrl: "/images/product.webp",
  },
];

export interface DiskonPromoProps {
  promos?: VoucherPromoItem[];
  /**
   * Mode tampilan promo dari backend:
   * - "auto": otomatis render single ticket jika 1 promo, atau 2-card carousel jika > 1 promo
   * - "single": selalu render tampilan tiket horizontal
   * - "multi": selalu render tampilan 2 card sejajar / carousel
   */
  displayMode?: "auto" | "single" | "multi";
  /** Alias backward-compatibility untuk displayMode */
  variant?: "auto" | "single" | "multi";
  className?: string;
  onUseDiscount?: () => void;
}

/**
 * Organism — Section Promo Voucher Landing Page.
 * Mendukung:
 * 1. Mode "single": 1 tiket horizontal (VoucherTicketSingle)
 * 2. Mode "multi": 2 card per layar (VoucherCardMulti), dan jika > 2 voucher bisa digeser/carousel
 *    dengan mempertahankan originalIndex saat slice agar pola warna (Biru, Kuning, Ungu) tetap konsisten.
 * 3. Fallback "auto": jika <= 1 promo otomatis "single", jika > 1 promo otomatis "multi".
 */
export default function DiskonPromo({
  promos = DEFAULT_PROMOS,
  displayMode,
  variant,
  className,
  onUseDiscount,
}: DiskonPromoProps) {
  // Mode aktif: prioritas displayMode, lalu variant, fallback "auto"
  const activeMode = useMemo(() => {
    const mode = displayMode ?? variant ?? "single";
    if (mode === "single") return "single";
    if (mode === "multi") return "multi";
    return promos.length <= 1 ? "single" : "multi";
  }, [displayMode, variant, promos.length]);

  // Index untuk carousel 2-card saat vouchers > 2
  const [startIndex, setStartIndex] = useState(0);

  // Jika multi card dan promos > 2, hitung batas navigasi
  const maxStartIndex = Math.max(0, promos.length - 2);

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : maxStartIndex));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < maxStartIndex ? prev + 1 : 0));
  };

  return (
    <section
      className={cn(
        "bg-background py-6 sm:py-10 px-3 xs:px-4 sm:px-6 font-sans flex flex-col items-center mb-5 md:mb-14 lg:mb-5 mt-5 overflow-hidden",
        className
      )}
    >
      <div className="max-w-6xl mx-auto w-full relative">
        {/* ======================================================== */}
        {/* MODE 1: SINGLE TICKET (VoucherTicketSingle)              */}
        {/* ======================================================== */}
        {activeMode === "single" ? (
          <div className="w-full flex justify-center">
            <VoucherTicketSingle
              item={promos[0] ?? DEFAULT_PROMOS[0]}
              onUseDiscount={onUseDiscount}
            />
          </div>
        ) : (
          /* ======================================================== */
          /* MODE 2: MULTI CARDS (VoucherCardMulti) — Grid 2 card     */
          /* ======================================================== */
          <div className="relative w-full">
            {/* Navigasi Panah Carousel jika voucher lebih dari 2 */}
            {promos.length > 2 && (
              <div className="flex items-center justify-end gap-2 mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Voucher sebelumnya"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card border border-foreground/15 flex items-center justify-center text-foreground hover:bg-card/80 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Voucher selanjutnya"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card border border-foreground/15 flex items-center justify-center text-foreground hover:bg-card/80 active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            {/* Grid 2 Card (Desktop/Tablet: 2 card sejajar, Mobile: stack / 1 card) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
              {promos.length <= 2 ? (
                promos.map((promo, idx) => (
                  <VoucherCardMulti
                    key={promo.id}
                    item={promo}
                    index={idx}
                    onUseDiscount={onUseDiscount}
                  />
                ))
              ) : (
                // Carousel 2 item aktif dengan mempertahankan originalIndex agar warna konsisten
                promos.slice(startIndex, startIndex + 2).map((promo, idx) => {
                  const originalIndex = startIndex + idx;
                  return (
                    <VoucherCardMulti
                      key={promo.id}
                      item={promo}
                      index={originalIndex}
                      onUseDiscount={onUseDiscount}
                    />
                  );
                })
              )}
            </div>

            {/* Indicator Dots jika voucher lebih dari 2 */}
            {promos.length > 2 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                {Array.from({ length: maxStartIndex + 1 }).map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setStartIndex(dotIdx)}
                    aria-label={`Slide ${dotIdx + 1}`}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-200 cursor-pointer",
                      startIndex === dotIdx
                        ? "w-7 bg-primary"
                        : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
