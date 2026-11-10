"use client";

import { cn } from "@/lib/utils";
import { Check, ArrowRight, Sparkles, Star, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ──────────────────────────────────────────
interface MembershipTier {
  id: string;
  badgeText?: string;
  tierName: string;
  subtitle: string;
  description: string;
  price: string;
  pricePeriod: string;
  priceColor: string;
  benefits: string[];
  isSpecial?: boolean;
}

// ── Data ───────────────────────────────────────────
const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "regular",
    tierName: "Member Reguler",
    subtitle: "Akses Standar",
    description:
      "Cocok buat kamu mitra & reseller pemula yang mau mulai kerja sama dengan santai dan mudah.",
    price: "Gratis",
    pricePeriod: "/ selamanya",
    priceColor: "text-amber-300",
    benefits: [
      "Harga reseller standar (diskon up to 15%)",
      "Akses katalog produk lengkap",
      "Materi promosi digital siap pakai",
    ],
    isSpecial: false,
  },
  {
    id: "special",
    badgeText: "⭐ PALING FAVORIT & HITS",
    tierName: "Member Spesial VIP",
    subtitle: "Akses Eksklusif & Penuh",
    description:
      "Pilihan terbaik buat kamu yang mau ngebut cuan dengan benefit super lengkap & prioritas utama!",
    price: "Rp 500.000",
    pricePeriod: "/ 6 bulan",
    priceColor: "text-amber-300",
    benefits: [
      "Harga grosir & diskon eksklusif up to 35%",
      "Prioritas stok & akses pre-order duluan",
      "Bimbingan & strategi jualan rahasia",
      "Dukungan Account Manager personal 24/7",
    ],
    isSpecial: true,
  },
];

// ── Membership Card (Transparan & Blur / Glassmorphism) ─
function MembershipCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between backdrop-blur-xl rounded-3xl p-5 sm:p-6",
        "shadow-2xl hover:shadow-sky-900/20 transition-all duration-300 hover:-translate-y-2 border-2 w-full",
        tier.isSpecial
          ? "border-amber-300/60 bg-gradient-to-b from-white/35 via-white/20 to-white/10 text-white"
          : "border-white/40 bg-white/20 text-white"
      )}
    >
      {/* Top Cute Badge */}
      {tier.badgeText && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-lg whitespace-nowrap animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {tier.badgeText}
          </span>
        </div>
      )}

      <div>
        {/* Header Title */}
        <div className="text-center mb-2.5 mt-1">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h3 className="font-heading text-base sm:text-lg font-extrabold text-white drop-shadow-sm">
              {tier.tierName}
            </h3>
            {tier.isSpecial ? (
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            ) : (
              <Heart className="w-4 h-4 text-sky-200 fill-sky-200" />
            )}
          </div>
          <span className="inline-block text-[10px] font-bold text-sky-900 bg-amber-300/90 px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {tier.subtitle}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sky-50 text-[11px] sm:text-xs text-center leading-relaxed mb-3 font-medium opacity-90">
          {tier.description}
        </p>

        {/* Benefits List */}
        <ul className="space-y-2 mb-4 pt-2.5 border-t border-white/20">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 p-0.5 text-amber-300 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs text-white font-medium leading-snug drop-shadow-sm">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Price & Action */}
      <div className="pt-3 border-t border-white/20 text-center">
        <div className="mb-2.5">
          <span className="text-[9px] uppercase font-bold text-sky-100/70 block mb-0.5">Biaya Paket</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-lg sm:text-xl font-black tracking-tight drop-shadow-sm", tier.priceColor)}>
              {tier.price}
            </span>
            <span className="text-[11px] text-sky-100/80 font-semibold">
              {tier.pricePeriod}
            </span>
          </div>
        </div>

        <Link
          href="/contact"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 font-bold text-xs py-2.5 px-4 rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95",
            tier.isSpecial
              ? "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/30"
              : "bg-white text-sky-700 hover:bg-sky-50 shadow-white/20"
          )}
        >
          {tier.isSpecial ? "Gabung VIP Sekarang" : "Mulai Gratis"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────
export function ResellerMembershipSection() {
  return (
    <section className="relative w-full bg-[#F3EFE4] overflow-visible py-20 sm:py-32 min-h-[1250px] flex items-center justify-center">
      {/* Background Biru SVG Full-Width */}
      <div className="absolute -inset-6 pointer-events-none z-0 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 105 105"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer Gradasi 1 */}
          <path
            d="M 0,0 
               C 13,30 24,4 35,20 
               C 47,35 58,4 70,22 
               C 82,38 93,8 105,25 
               L 105,90 
               C 85,96 63,83 43,90 
               C 22,94 11,100 0,97 Z"
            fill="#BBE1FA"
            opacity="0.98"
          />

          {/* Layer Gradasi 2 */}
          <path
            d="M 0,0 
               C 13,32 24,6 35,23 
               C 47,38 58,6 70,25 
               C 82,41 93,10 105,28 
               L 105,87 
               C 85,93 63,80 43,87 
               C 22,91 11,97 0,94 Z"
            fill="#62B4EE"
            opacity="0.99"
          />

          {/* Layer Utama */}
          <path
            d="M 0,0 
               C 13,35 24,8 35,26 
               C 47,41 58,8 70,28 
               C 82,44 93,12 105,31 
               L 105,83 
               C 85,89 63,77 43,83 
               C 22,87 11,93 0,90 Z"
            fill="#3897e0"
          />
        </svg>
      </div>

      {/* Gambar Ilustrasi Kanan */}
      <div className="hidden lg:block absolute -right-32 -top-26 bottom-0 z-10 pointer-events-none w-[70%] max-w-[1050px] h-[calc(100%+6rem)]">
        <div className="relative w-full h-full flex items-start justify-end">
          <Image
            src="/images/iot.webp"
            alt="Roboedu IoT Illustration"
            width={1300}
            height={1500}
            className="object-contain object-top max-h-none w-full drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Konten Utama (Posisi dinaikkan sedikit dengan pt-44 sm:pt-52) */}
      <div className="relative z-30 w-full max-w-6xl mx-auto px-6 sm:px-8 pt-44 sm:pt-52 pb-18">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 drop-shadow-sm">
            Pilihan Kemitraan Membership
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium leading-relaxed">
            Pilih paket yang paling pas buat nemenin perjalanan sukses bisnis kamu bersama RoboEdu! 
          </p>
        </div>

        {/* Grid Cards (Transparan & Blur) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          {MEMBERSHIP_TIERS.map((tier) => (
            <MembershipCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}