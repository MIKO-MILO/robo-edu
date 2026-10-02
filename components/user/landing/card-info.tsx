"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeaturePoint {
  id: string | number;
  label: string;
}

export interface CardsInfoProps {
  badgeCategory?: string;
  titleMain?: string;
  titleHighlight?: string;
  description?: string;
  statNumber?: string;
  statLabel?: string;
  features?: FeaturePoint[];
  ctaText?: string;
  ctaHref?: string;
  imageSrc?: string;
}

const defaultFeatures: FeaturePoint[] = [
  { id: 1, label: "Learning & Fun" },
  { id: 2, label: "Aman Untuk Usia 6+" },
  { id: 3, label: "Modul IoT Interaktif" },
  { id: 4, label: "Mudah Dirakit (DIY)" },
];

export default function ICardsInfo({
  badgeCategory = "Tentang Kami",
  titleMain = "Aman, Seru & Edukatif —",
  titleHighlight = "Impian Setiap Anak",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam",
  statNumber = "Usia 6+",
  statLabel = "Mainan IoT Edukatif",
  features = defaultFeatures,
  imageSrc = "/images/robot.webp",
}: CardsInfoProps) {
  return (
    <section className="relative bg-[#2781CD] pt-14 sm:pt-18 pb-10 sm:pb-16 lg:pb-18">
      {/* SVG Dekorasi Jalur di Kiri (Digeser sedikit ke kanan: left-0 sm:-left-2) */}
      <div className="absolute left-0 sm:-left-2 -top-[65px] sm:-top-[95px] pointer-events-none z-40 opacity-100 overflow-visible max-w-full">
        <svg
          width="431"
          height="402"
          viewBox="0 0 431 402"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-auto h-[360px] sm:h-[450px]"
        >
          <path
            d="M404.742 4.47607C404.742 4.47607 427.039 101.332 380.571 134.809C293.828 197.301 98.869 53.1084 64.2422 156.976C32.605 251.876 256.203 228.354 221.242 321.976C199.727 379.591 0.242188 381.976 0.242188 381.976"
            stroke="#F2F5FC"
            strokeOpacity="0.2"
            strokeWidth="40"
          />
        </svg>
      </div>

      {/* SVG Dekorasi Jalur di Kanan (Digeser sedikit ke kiri: right-2) */}
      <div className="absolute right-2 -top-[75px] sm:-top-[125px] pointer-events-none z-40 opacity-40 overflow-visible max-w-full">
        <svg
          width="276"
          height="511"
          viewBox="0 0 276 511"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-auto h-[380px] sm:h-[480px]"
        >
          <path
            d="M77.5012 9.67627C77.5012 9.67627 -32.6856 208.765 52.0012 236.176C100.332 251.82 152.599 170.739 194 200.176C237.126 230.84 203.5 304.676 177.001 335.676C144.186 374.066 98.3794 396.303 109.001 445.676C122.786 509.754 272.001 485.676 272.001 485.676"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="40"
          />
        </svg>
      </div>

      {/* Cloud Bumps Divider */}
      <div className="absolute -top-[135px] sm:-top-[175px] lg:-top-[215px] left-0 right-0 w-full overflow-hidden leading-none z-30 pointer-events-none">
        <svg
          viewBox="0 0 1440 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[140px] sm:h-[180px] lg:h-[220px] block"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 280
               L 0 150
               C 15 20, 185 20, 215 160
               C 235 90, 345 90, 365 165
               C 380 135, 410 135, 425 170
               C 455 100, 560 100, 580 168
               C 620 5, 930 5, 960 160
               C 995 15, 1260 15, 1285 170
               C 1315 80, 1420 70, 1440 140
               L 1440 280
               Z"
            fill="#2781CD"
          />
        </svg>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-2 sm:mt-4 lg:mt-6">
        {/* Grid Konten Kiri & Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: Cloud Image */}
          <div className="lg:col-span-6 flex justify-center items-center relative overflow-visible">
            <div className="relative w-full aspect-square sm:aspect-[4/3] flex items-center justify-center scale-100 sm:scale-110 lg:scale-120">
              <Image
                src={imageSrc}
                alt="Cloud Visual"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Text & Details */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-5 sm:space-y-6 text-left">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FAEE7C] text-[#3D2900] text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-sm">
              {badgeCategory}
            </span>

            {/* Heading Section */}
            <div className="relative w-full pb-6 sm:pb-8">
              <h2 className="font-heading text-xl xs:text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-white tracking-tight leading-snug relative z-10">
                {titleMain}{" "}
                <span className="block sm:inline text-white">
                  {titleHighlight}
                </span>
              </h2>

              {/* Garis SVG Lengkung */}
              <div
                className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 w-full max-w-[180px] sm:max-w-[260px] pointer-events-none z-0 translate-y-2 sm:translate-y-3"
                aria-hidden="true"
              >
                <svg
                  width="400"
                  height="100"
                  viewBox="0 0 400 100"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  <path
                    d="M 30,50 Q 200,25 370,40"
                    stroke="#F2E583"
                    strokeWidth="7"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed max-w-xl font-normal pt-1">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full pt-1">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2.5 sm:gap-3 group">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 border-2 border-white text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  </div>
                  <span className="font-heading font-extrabold text-xs sm:text-sm text-white tracking-tight">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}