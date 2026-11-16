"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, Star, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Types ──────────────────────────────────────────
interface MembershipTier {
  id: string;
  tierName: string;
  subtitle: string;
  description: string;
  price: string;
  pricePeriod: string;
  priceColor: string;
  benefits: string[];
  isSpecial?: boolean;
}

interface PlanInfo {
  price: number;
  duration_months: number;
}

type AuthState = "loading" | "guest" | "member" | "not_member";

// ── Data ───────────────────────────────────────────
const BASE_TIERS: Omit<MembershipTier, "price" | "pricePeriod">[] = [
  {
    id: "regular",
    tierName: "Member Reguler",
    subtitle: "Akses Standar",
    description:
      "Cocok buat kamu mitra & reseller pemula yang mau mulai kerja sama dengan santai dan mudah.",
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
    tierName: "Member Spesial VIP",
    subtitle: "Akses Eksklusif & Penuh",
    description:
      "Pilihan terbaik buat kamu yang mau ngebut cuan dengan benefit super lengkap & prioritas utama!",
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

// ── Membership Card (Jauh Lebih Lebar ke Samping) ─
function MembershipCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between backdrop-blur-md rounded-3xl p-7 sm:p-12",
        "shadow-2xl hover:shadow-sky-900/20 transition-all duration-300 hover:-translate-y-2 border-2 w-full",
        tier.isSpecial
          ? "border-amber-300/60 bg-gradient-to-b from-white/20 via-white/10 to-white/5 text-white"
          : "border-white/35 bg-white/10 text-white"
      )}
    >
      <div>
        {/* Header Title */}
        <div className="text-center mb-4 mt-1">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-white drop-shadow-sm">
              {tier.tierName}
            </h3>
            {tier.isSpecial ? (
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            ) : (
              <Heart className="w-5 h-5 text-sky-200 fill-sky-200" />
            )}
          </div>
          <span className="inline-block text-xs font-bold text-sky-900 bg-amber-300/90 px-3.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {tier.subtitle}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sky-50 text-xs sm:text-sm text-center leading-relaxed mb-6 font-medium drop-shadow-sm max-w-xl mx-auto">
          {tier.description}
        </p>

        {/* Benefits List */}
        <ul className="space-y-3.5 mb-6 pt-4 border-t border-white/25">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-amber-400/25 border border-amber-300/50 p-1 text-amber-300 shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm text-white font-medium leading-snug drop-shadow-sm">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Price & Action */}
      <div className="pt-4 border-t border-white/25 text-center">
        <div className="mb-4">
          <span className="text-xs uppercase font-bold text-sky-100/80 block mb-1 drop-shadow-sm">
            Biaya Paket
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className={cn("text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm", tier.priceColor)}>
              {tier.price}
            </span>
            <span className="text-xs sm:text-sm text-sky-100/90 font-semibold drop-shadow-sm">
              {tier.pricePeriod}
            </span>
          </div>
        </div>

        <Link
          href="/contact"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all shadow-md hover:scale-105 active:scale-95",
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
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    // Fetch plan info (public, no auth needed)
    fetch("/api/membership/plan-info", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPlanInfo(json.data as PlanInfo);
        } else {
          setPlanError(true);
        }
      })
      .catch(() => setPlanError(true))
      .finally(() => setPlanLoading(false));

    // Fetch membership status to determine CTA label and auth state
    fetch("/api/membership/me", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          setAuthState("guest");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (!json) return; // was 401, already handled
        if (json.success) {
          setAuthState(
            json.data.membership_status === "MEMBER" ? "member" : "not_member",
          );
        } else {
          // unexpected error — treat as guest so CTA still works
          setAuthState("guest");
        }
      })
      .catch(() => setAuthState("guest"));
  }, []);

  // Build tier list — regular card keeps its static price/period
  const tiers: MembershipTier[] = [
    { ...BASE_TIERS[0]!, price: "Gratis", pricePeriod: "/ selamanya" },
    { ...BASE_TIERS[1]!, price: "", pricePeriod: "" }, // price rendered by SpecialPriceBlock
  ];

  return (
    <section className="relative w-full bg-[#F3EFE4] overflow-visible pt-13 sm:pt-32 flex flex-col justify-between pb-24 sm:pb-32">
      {/* Background Biru SVG Full-Width (Tanpa Lengkungan di Bawah) */}
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
               L 105,105 
               L 0,105 Z"
            fill="#BBE1FA"
            opacity="0.98"
          />

          {/* Layer Gradasi 2 */}
          <path
            d="M 0,0 
               C 13,32 24,6 35,23 
               C 47,38 58,6 70,25 
               C 82,41 93,10 105,28 
               L 105,105 
               L 0,105 Z"
            fill="#62B4EE"
            opacity="0.99"
          />

          {/* Layer Utama */}
          <path
            d="M 0,0 
               C 13,35 24,8 35,26 
               C 47,41 58,8 70,28 
               C 82,44 93,12 105,31 
               L 105,105 
               L 0,105 Z"
            fill="#3897e0"
          />
        </svg>
      </div>

      {/* Decorative SVG Pattern di Bawah */}
      <div className="absolute -bottom-4 sm:-bottom-6 left-0 right-0 z-10 w-full overflow-hidden leading-none pointer-events-none">
        {/* Background transparan tipis memutih persis di belakang pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-sky-200/30 to-transparent z-0" />
        
        <svg
          className="relative z-10 w-full h-24 sm:h-32 lg:h-40 text-sky-600/90 drop-shadow-sm"
          viewBox="0 0 1698 119"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Mask gradasi vertikal untuk efek transparan memudar ke atas */}
            <linearGradient id="blueFadeMask" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>
            <mask id="patternBlueMask">
              <rect x="0" y="0" width="1698" height="119" fill="url(#blueFadeMask)" />
            </mask>
          </defs>

          {/* Grup elemen kotak-kotak biru agak tua dengan mask */}
          <g mask="url(#patternBlueMask)">
            <rect x="55.0078" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1643.08" y="38.2871" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="109.836" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="218.148" y="38.6367" width="56.4443" height="40.1817" rx="8" fill="currentColor" />
            <rect x="329.516" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="439.352" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="547.664" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="657.5" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="765.812" y="38.6367" width="56.4443" height="40.1817" rx="8" fill="currentColor" />
            <rect x="877.18" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="985.484" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1095.32" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1203.63" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1313.48" y="38.6367" width="56.4443" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1424.84" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1533.14" y="38.6367" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="54.9219" y="77.2725" width="54.9187" height="41.7271" rx="8" fill="currentColor" />
            <rect x="163.234" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="164.852" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="274.258" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="274.688" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="384.086" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="384.531" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="492.391" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="492.836" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="602.234" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="602.68" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="710.555" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="710.984" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="821.906" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="822.352" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="931.758" y="78.8174" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="932.188" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1040.07" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1040.4" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1149.89" y="78.8174" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1150.34" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1258.21" y="78.8174" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1258.65" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1369.57" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1370.02" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1477.89" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1478.33" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1587.73" y="77.2725" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
            <rect x="1588.16" width="54.9187" height="40.1817" rx="8" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Gambar Ilustrasi Kanan */}
      <div className="hidden lg:block absolute -right-64 -top-24 bottom-0 z-20 pointer-events-none w-[73%] max-w-[1100px] h-[calc(100%+4rem)]">
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

      {/* Konten Utama (Container diperlebar menjadi max-w-7xl) */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-8 pt-44 sm:pt-52 mt-6 sm:mt-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 drop-shadow-sm">
            Pilihan Kemitraan Membership
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium leading-relaxed">
            Pilih paket yang paling pas buat nemenin perjalanan sukses bisnis kamu bersama RoboEdu! 
          </p>
        </div>

        {/* Grid Cards (Card lebih lebar, jarak gap agak dempet tapi tetap proporsional dengan gap-6 sm:gap-8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto items-stretch">
          {MEMBERSHIP_TIERS.map((tier) => (
            <MembershipCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}