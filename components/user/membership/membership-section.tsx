"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, Star, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { MembershipPlanInfo, MembershipAuthState } from "@/types";

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

type PlanInfo = Pick<MembershipPlanInfo, "price" | "duration_months">;
type AuthState = MembershipAuthState;

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

// ── Membership Card ────────────────────────────────
function MembershipCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between backdrop-blur-md rounded-3xl p-6 sm:p-8 max-w-xl mx-auto w-full",
        "shadow-2xl hover:shadow-sky-900/20 transition-all duration-300 hover:-translate-y-2 border-2",
        tier.isSpecial
          ? "border-amber-300/60 bg-gradient-to-b from-white/20 via-white/10 to-white/5 text-white"
          : "border-white/35 bg-white/10 text-white"
      )}
    >
      <div>
        {/* Header Title & Badge (Rata Tengah) */}
        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-2.5">
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
              {tier.tierName}
            </h3>
          </div>
          <span className="inline-block text-xs font-bold text-sky-900 bg-amber-300/90 px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
            {tier.subtitle}
          </span>
        </div>

        {/* Short Description */}
        <p className="text-sky-50 text-xs sm:text-sm text-left leading-relaxed mb-5 font-medium drop-shadow-sm">
          {tier.description}
        </p>

        {/* Benefits List */}
        <ul className="space-y-3 mb-6 pt-3.5 border-t border-white/25">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-3 text-left">
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
      <div className="pt-3.5 border-t border-white/25 text-left">
        <div className="mb-4">
          <span className="text-xs uppercase font-bold text-sky-100/80 block mb-1 drop-shadow-sm">
            Biaya Paket
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm", tier.priceColor)}>
              {tier.price}
            </span>
            <span className="text-xs sm:text-sm text-sky-100/90 font-semibold drop-shadow-sm">
              {tier.pricePeriod}
            </span>
          </div>
        </div>

        <Button
          asChild
          neo={false}
          className={cn(
            "w-full font-bold text-xs sm:text-sm py-3 px-6 rounded-2xl",
            tier.isSpecial
              ? "bg-amber-400 hover:bg-amber-500 text-slate-900"
              : "bg-card text-sky-700 hover:bg-sky-50"
          )}
        >
          <Link href="/contact">
            {tier.isSpecial ? "Gabung VIP Sekarang" : "Mulai Gratis"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
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

    fetch("/api/membership/me", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          setAuthState("guest");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success) {
          setAuthState(
            json.data.membership_status === "MEMBER" ? "member" : "not_member",
          );
        } else {
          setAuthState("guest");
        }
      })
      .catch(() => setAuthState("guest"));
  }, []);

  const tiers: MembershipTier[] = [
    { ...BASE_TIERS[0]!, price: "Gratis", pricePeriod: "/ selamanya" },
    { ...BASE_TIERS[1]!, price: "", pricePeriod: "" },
  ];

  return (
    <section className="relative w-full bg-background overflow-visible pt-8 sm:pt-16 flex flex-col justify-between pb-24 sm:pb-32">
      {/* Background Biru: Tanpa lengkungan (sudut siku-siku standar) */}
      <div className="absolute top-20 bottom-8 inset-x-0 pointer-events-none z-0 overflow-hidden">
        <div className="w-full h-full bg-membership-gradient-1 relative flex flex-col justify-end">
          
          {/* Decorative SVG Pattern di Bawah */}
          <div className="absolute bottom-0 left-0 right-0 z-10 w-full overflow-hidden leading-none pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-membership-gradient-2/70 via-membership-gradient-1/20 to-transparent z-0" />
            
            <svg
              className="relative z-10 w-full h-24 sm:h-32 lg:h-40 drop-shadow-sm"
              viewBox="0 0 1698 119"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="whiteFadeMask" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-card)" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="var(--color-card)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--color-card)" stopOpacity="0.85" />
                </linearGradient>
                <mask id="patternWhiteMask">
                  <rect x="0" y="0" width="1698" height="119" fill="url(#whiteFadeMask)" />
                </mask>
              </defs>

              <g mask="url(#patternWhiteMask)" fill="white" fillOpacity="0.55">
                <rect x="55.0078" width="54.9187" height="40.1817" rx="8" />
                <rect y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="1643.08" y="38.2871" width="54.9187" height="40.1817" rx="8" />
                <rect x="109.836" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="218.148" y="38.6367" width="56.4443" height="40.1817" rx="8" />
                <rect x="329.516" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="439.352" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="547.664" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="657.5" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="765.812" y="38.6367" width="56.4443" height="40.1817" rx="8" />
                <rect x="877.18" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="985.484" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="1095.32" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="1203.63" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="1313.48" y="38.6367" width="56.4443" height="40.1817" rx="8" />
                <rect x="1424.84" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="1533.14" y="38.6367" width="54.9187" height="40.1817" rx="8" />
                <rect x="54.9219" y="77.2725" width="54.9187" height="41.7271" rx="8" />
                <rect x="163.234" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="164.852" width="54.9187" height="40.1817" rx="8" />
                <rect x="274.258" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="274.688" width="54.9187" height="40.1817" rx="8" />
                <rect x="384.086" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="384.531" width="54.9187" height="40.1817" rx="8" />
                <rect x="492.391" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="492.836" width="54.9187" height="40.1817" rx="8" />
                <rect x="602.234" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="602.68" width="54.9187" height="40.1817" rx="8" />
                <rect x="710.555" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="710.984" width="54.9187" height="40.1817" rx="8" />
                <rect x="821.906" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="822.352" width="54.9187" height="40.1817" rx="8" />
                <rect x="931.758" y="78.8174" width="54.9187" height="40.1817" rx="8" />
                <rect x="932.188" width="54.9187" height="40.1817" rx="8" />
                <rect x="1040.07" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="1040.4" width="54.9187" height="40.1817" rx="8" />
                <rect x="1149.89" y="78.8174" width="54.9187" height="40.1817" rx="8" />
                <rect x="1150.34" width="54.9187" height="40.1817" rx="8" />
                <rect x="1258.21" y="78.8174" width="54.9187" height="40.1817" rx="8" />
                <rect x="1258.65" width="54.9187" height="40.1817" rx="8" />
                <rect x="1369.57" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="1370.02" width="54.9187" height="40.1817" rx="8" />
                <rect x="1477.89" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="1478.33" width="54.9187" height="40.1817" rx="8" />
                <rect x="1587.73" y="77.2725" width="54.9187" height="40.1817" rx="8" />
                <rect x="1588.16" width="54.9187" height="40.1817" rx="8" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Gambar Ilustrasi Kanan */}
      <div className="hidden lg:block absolute -right-48 -top-16 bottom-0 z-20 pointer-events-none w-[58%] max-w-[880px] h-full">
        <div className="relative w-full h-full flex items-start justify-end">
          <Image
            src="/images/iot2.webp"
            alt="Roboedu IoT Illustration"
            width={1100}
            height={1300}
            className="object-contain object-top max-h-none w-full drop-shadow-2xl"
            priority
          />
        </div>
      </div>
      
      {/* Konten Utama */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-8 pt-20 sm:pt-28 mt-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-sm">
            Pilihan Kemitraan Membership
          </h2>
          <p className="text-sky-100 text-xs sm:text-sm font-medium leading-relaxed">
            Pilih paket yang paling pas buat nemenin perjalanan sukses bisnis kamu bersama RoboEdu! 
          </p>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto items-stretch">
          {tiers.map((tier) => (
            <MembershipCard key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}