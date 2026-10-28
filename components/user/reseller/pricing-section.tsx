"use client";

import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  badge: string;
  sku: string;
  title: string;
  description: string;
  publicPrice: string;
  resellerPrice: string;
  savings: string;
  savingsPercent: string;
  badgeColor: string;
  isHighlighted?: boolean;
}

function PricingCard({
  badge,
  sku,
  title,
  description,
  publicPrice,
  resellerPrice,
  savings,
  savingsPercent,
  badgeColor,
  isHighlighted = false,
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-between",
        "border-2 border-[#1C6CAE] rounded-[3rem] overflow-hidden p-6 sm:p-8",
        "transition-all duration-200 shadow-sm hover:shadow-md",
        isHighlighted ? "bg-[#1C6CAE] text-white" : "bg-[#F3EFE4] text-foreground"
      )}
    >
      {/* Top Section: Title & Icon Arrow */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full border font-body font-bold text-[10px] w-fit uppercase tracking-wider",
              isHighlighted ? "bg-white/20 text-white border-white/40" : "bg-white/80 border-[#1C6CAE]/30 text-slate-800"
            )}>
              {badge}
            </span>
            <span className={cn(
              "font-body text-[10px] font-medium tracking-wide",
              isHighlighted ? "text-white/70" : "text-foreground/50"
            )}>
              SKU: {sku}
            </span>
          </div>

          {/* Arrow Icon Button */}
          <div className={cn(
            "w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-transform hover:scale-105",
            isHighlighted ? "bg-white border-[#1C6CAE] text-[#1C6CAE]" : "bg-[#1C6CAE] text-white border-[#1C6CAE]"
          )}>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-heading font-bold text-xl sm:text-2xl leading-snug mt-1",
          isHighlighted ? "text-white" : "text-foreground"
        )}>
          {title}
        </h3>

        {/* Divider Line */}
        <div className={cn(
          "w-full h-[2px] my-1",
          isHighlighted ? "bg-white/20" : "bg-[#1C6CAE]/20"
        )} />

        {/* Description */}
        <p className={cn(
          "font-body text-xs sm:text-sm leading-relaxed",
          isHighlighted ? "text-white/90" : "text-foreground/75"
        )}>
          {description}
        </p>
      </div>

      {/* Price comparison & Savings Bottom Block */}
      <div className={cn("mt-8 flex flex-col gap-4 pt-4 border-t", isHighlighted ? "border-white/20" : "border-[#1C6CAE]/20")}>
        <div className="flex flex-col gap-1.5">
          {/* Public price row */}
          <div className="flex items-center justify-between text-xs">
            <span className={isHighlighted ? "text-white/70" : "text-foreground/60"}>
              Harga Eceran Publik:
            </span>
            <span className={cn("line-through", isHighlighted ? "text-white/70" : "text-foreground/50")}>
              {publicPrice}
            </span>
          </div>
          {/* Reseller price row */}
          <div className="flex items-center justify-between">
            <span className={cn("font-bold text-sm sm:text-base", isHighlighted ? "text-white" : "text-foreground")}>
              Harga Reseller:
            </span>
            <span className={cn("font-heading font-bold text-lg sm:text-xl", isHighlighted ? "text-amber-300" : "text-[#1C6CAE]")}>
              {resellerPrice}
            </span>
          </div>
        </div>

        {/* Savings Badge Strip */}
        <div className={cn(
          "px-4 py-3 rounded-2xl flex items-center justify-between border",
          isHighlighted ? "bg-white/10 text-white border-white/30" : "bg-white/60 text-foreground border-[#1C6CAE]/30"
        )}>
          <span className="font-body text-[10px] sm:text-[11px] font-medium opacity-90">
            Keuntungan per Unit:
          </span>
          <span className={cn(
            "font-heading font-bold text-[10px] sm:text-[11px] px-3.5 py-1.5 rounded-xl border inline-flex items-center gap-1",
            isHighlighted ? "bg-white text-[#1C6CAE] border-white" : "bg-[#1C6CAE] text-white border-[#1C6CAE]"
          )}>
            Hemat {savings} <span className="opacity-75 text-[9px] sm:text-[10px]">({savingsPercent})</span>
          </span>
        </div>
      </div>
    </article>
  );
}

const products: PricingCardProps[] = [
  {
    badge: "BEST SELLER KIT",
    sku: "RB-CAR-PRO",
    title: "Robo Kit Car Pro",
    description:
      "Kit robot cerdas berbasis ESP32 dengan sensor ultrasonik, line tracking, dan kontrol via Bluetooth.",
    publicPrice: "Rp 450.000",
    resellerPrice: "Rp 335.000",
    savings: "Rp 115.000",
    savingsPercent: "25,5%",
    badgeColor: "bg-accent-soft-blue",
  },
  {
    badge: "EDU STEM KIT",
    sku: "RB-WIND-01",
    title: "Robo Kit Wind Mill",
    description:
      "Model turbin angin kinetik edukasi energi terbarukan dengan dinamo generator mikro & LED indikator.",
    publicPrice: "Rp 320.000",
    resellerPrice: "Rp 240.000",
    savings: "Rp 80.000",
    savingsPercent: "25,0%",
    badgeColor: "bg-amber-200",
    isHighlighted: true,
  },
  {
    badge: "SPAREPART GROSIR",
    sku: "SP-MOT-5PK",
    title: "DC Motor 12V (Pack 5)",
    description:
      "High-torque motor metal gearbox presisi tinggi untuk prototipe mekanik dan robot kompetisi.",
    publicPrice: "Rp 250.000",
    resellerPrice: "Rp 185.000",
    savings: "Rp 65.000",
    savingsPercent: "26,0%",
    badgeColor: "bg-pink-200",
  },
];

export function ResellerPricingSection() {
  return (
    <section className="w-full pt-1 sm:pt-1 pb-20 sm:pb-28 bg-background">
      
      {/* Decorative SVG Pattern di Paling Atas */}
      <div className="w-full mt-12 sm:mt-16 overflow-hidden leading-none mb-25">
        <svg
          className="w-full h-25 sm:h-28 lg:h-35 text-[#2483D0]"
          viewBox="0 0 1698 119"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
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
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 sm:gap-14">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight leading-tight max-w-xl">
            Perbandingan Harga <br />
            <span className="relative inline-block my-1 px-3 py-0.5 bg-[#60B9F8]/30 rounded-xl border border-[#1C6CAE] text-foreground">
              Publik vs Reseller
            </span>
          </h2>

          <p className="font-body text-xs sm:text-sm text-muted-foreground max-w-md lg:text-right leading-relaxed">
            Lihat selisih harga nyata yang bisa kamu raih sebagai mitra reseller
            resmi RoboEdu — langsung dari harga grosir pabrik, tanpa markup distributor.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <PricingCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}