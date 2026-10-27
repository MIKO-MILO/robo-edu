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
    priceColor: "text-amber-600",
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
    priceColor: "text-rose-600",
    benefits: [
      "Harga grosir & diskon eksklusif up to 35%",
      "Prioritas stok & akses pre-order duluan",
      "Bimbingan & strategi jualan rahasia",
      "Dukungan Account Manager personal 24/7",
    ],
    isSpecial: true,
  },
];

// ── Membership Card (Bersebelahan, Melebar ke Samping & Lucu) ─
function MembershipCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7",
        "shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 w-full",
        tier.isSpecial ? "border-amber-400 bg-gradient-to-b from-amber-50/60 via-white to-white" : "border-sky-100"
      )}
    >
      {/* Top Cute Badge */}
      {tier.badgeText && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-md whitespace-nowrap animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            {tier.badgeText}
          </span>
        </div>
      )}

      <div>
        {/* Header Title */}
        <div className="text-center mb-3 mt-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-800">
              {tier.tierName}
            </h3>
            {tier.isSpecial ? (
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            ) : (
              <Heart className="w-4 h-4 text-sky-400 fill-sky-200" />
            )}
          </div>
          <span className="inline-block text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            {tier.subtitle}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-slate-600 text-xs text-center leading-relaxed mb-4">
          {tier.description}
        </p>

        {/* Benefits List */}
        <ul className="space-y-2.5 mb-6 pt-3 border-t border-slate-100">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs text-slate-700 font-semibold leading-snug">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Price & Action */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <div className="mb-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Biaya Paket</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-xl sm:text-2xl font-black tracking-tight", tier.priceColor)}>
              {tier.price}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {tier.pricePeriod}
            </span>
          </div>
        </div>

        <Link
          href="/contact"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 font-bold text-xs py-3 px-4 rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95",
            tier.isSpecial
              ? "bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-amber-400/30"
              : "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/30"
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
    <section className="relative w-full bg-[#F3EFE4] overflow-visible py-20 sm:py-32 min-h-[1050px] flex items-center justify-center">
      {/* Background Biru SVG Full-Width (Dibuat Jauh Lebih Besar & Megah) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layer Gradasi 1 */}
          <path
            d="M 0,0 
               C 12,18 22,2 33,10 
               C 44,22 55,2 66,11 
               C 77,23 88,4 100,12 
               L 100,95 
               C 80,101 60,88 40,95 
               C 20,99 10,105 0,102 Z"
            fill="#BBE1FA"
            opacity="0.98"
          />

          {/* Layer Gradasi 2 */}
          <path
            d="M 0,0 
               C 12,20 22,4 33,13 
               C 44,24 55,4 66,14 
               C 77,25 88,6 100,15 
               L 100,92 
               C 80,98 60,85 40,92 
               C 20,96 10,102 0,99 Z"
            fill="#62B4EE"
            opacity="0.99"
          />

          {/* Layer Utama */}
          <path
            d="M 0,0 
               C 12,22 22,6 33,16 
               C 44,26 55,6 66,17 
               C 77,27 88,8 100,18 
               L 100,88 
               C 80,94 60,82 40,88 
               C 20,92 10,98 0,95 Z"
            fill="#3897e0"
          />
        </svg>
      </div>

      {/* Gambar Ilustrasi Kanan: Dinaikkan tinggi ke atas & digeser ke kanan */}
      <div className="hidden lg:block absolute -right-20 -top-36 bottom-0 z-10 pointer-events-none w-[55%] max-w-[800px] h-[calc(100%+8rem)]">
        <div className="relative w-full h-full flex items-start justify-end">
          <Image
            src="/images/iot.webp"
            alt="Roboedu IoT Illustration"
            width={1100}
            height={1300}
            className="object-contain object-top max-h-none w-full drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Konten Utama (Berada di Atas Gambar dengan z-30) */}
      <div className="relative z-30 w-full max-w-5xl mx-auto px-6 sm:px-8 py-18">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 drop-shadow-sm pt-16">
            Pilihan Kemitraan Membership
          </h2>          <p className="text-sky-100 text-xs sm:text-sm font-medium leading-relaxed">
            Pilih paket yang paling pas buat nemenin perjalanan sukses bisnis kamu bersama RoboEdu! 
          </p>
        </div>

        {/* Grid Cards (Bersebelahan 2 Kolom ke Samping) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {MEMBERSHIP_TIERS.map((tier) => (
            <MembershipCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}