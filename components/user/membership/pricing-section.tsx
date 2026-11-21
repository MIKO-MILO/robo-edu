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
        "border-2 border-primary rounded-3xl overflow-hidden p-6 sm:p-8",
        "transition-all duration-200 shadow-sm hover:shadow-md",
        isHighlighted ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
      )}
    >
      {/* Top Section: Title & Icon Arrow */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className={cn(
              "inline-flex items-center px-3 py-1 rounded-full border font-body font-bold text-[10px] w-fit uppercase tracking-wider",
              isHighlighted ? "bg-white/20 text-white border-white/40" : "bg-white/80 border-primary/30 text-slate-800"
            )}>
              {badge}
            </span>
            <span className={cn(
              "font-body text-[10px] font-medium tracking-wide",
              isHighlighted ? "text-primary-foreground/70" : "text-foreground/50"
            )}>
              SKU: {sku}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-heading font-bold text-xl sm:text-2xl leading-snug mt-1",
          isHighlighted ? "text-primary-foreground" : "text-foreground"
        )}>
          {title}
        </h3>

        {/* Divider Line */}
        <div className={cn(
          "w-full h-[2px] my-1",
          isHighlighted ? "bg-white/20" : "bg-primary/20"
        )} />

        {/* Description */}
        <p className={cn(
          "font-body text-xs sm:text-sm leading-relaxed",
          isHighlighted ? "text-primary-foreground/90" : "text-foreground/75"
        )}>
          {description}
        </p>
      </div>

      {/* Price comparison & Savings Bottom Block */}
      <div className={cn("mt-8 flex flex-col gap-4 pt-4 border-t", isHighlighted ? "border-white/20" : "border-primary/20")}>
        <div className="flex flex-col gap-1.5">
          {/* Public price row */}
          <div className="flex items-center justify-between text-xs">
            <span className={isHighlighted ? "text-primary-foreground/70" : "text-foreground/60"}>
              Harga Eceran Publik:
            </span>
            <span className={cn("line-through", isHighlighted ? "text-primary-foreground/70" : "text-foreground/50")}>
              {publicPrice}
            </span>
          </div>
          {/* Reseller price row */}
          <div className="flex items-center justify-between">
            <span className={cn("font-bold text-sm sm:text-base", isHighlighted ? "text-primary-foreground" : "text-foreground")}>
              Harga Reseller:
            </span>
            <span className={cn("font-heading font-bold text-lg sm:text-xl", isHighlighted ? "text-amber-300" : "text-primary")}>
              {resellerPrice}
            </span>
          </div>
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
    <section className="w-full pt-16 sm:pt-20 pb-20 sm:pb-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10 sm:gap-14">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="flex flex-col gap-2 pt-0">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight leading-tight max-w-xl">
              Perbandingan Harga <br />
              <span className="inline-block mt-2 px-6 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-full text-xl sm:text-2xl lg:text-3xl shadow-sm">
                Publik vs Reseller
              </span>
            </h2>
          </div>

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