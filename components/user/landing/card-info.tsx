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

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 group">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F3EFE4] border-2 border-[#2483D0] text-[#2483D0] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
      </div>
      <span className="font-heading font-extrabold text-xs sm:text-sm text-[#3D2900] tracking-tight">
        {label}
      </span>
    </div>
  );
}

export default function ICardsInfo({
  badgeCategory = "Tentang Kami",
  titleMain = "Aman, Seru & Edukatif —",
  titleHighlight = "Impian Setiap Anak",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam",
  statNumber = "Usia 6+",
  statLabel = "Mainan IoT Edukatif",
  features = defaultFeatures,
  ctaText = "Jelajahi Produk",
  ctaHref = "/product",
  imageSrc = "/images/11.png",
}: CardsInfoProps) {
  return (
    <section className="relative bg-[#F3EFE4] py-10 sm:py-16 lg:py-26 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: SVG Blob Design + Image 11.png + Badge */}
          <div className="lg:col-span-6 flex justify-center items-center relative">
            <div className="relative w-full max-w-[480px] sm:max-w-[550px] lg:max-w-[620px] aspect-[773/583] flex items-center justify-center">
              
              {/* Custom SVG Background (Latar Belakang Blob - Tidak Diubah) */}
              <svg
                viewBox="0 0 773 583"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full object-contain z-0 scale-[0.82] sm:scale-85 translate-y-8 sm:translate-y-10"
              >
                <path
                  d="M162.184 14.5394C250.968 -36.2552 315.938 62.4553 416.871 61.1634C511.214 59.9558 572.583 -35.1339 654.415 14.5394C740.069 66.5323 715.959 166.333 730.332 269.676C743.554 364.75 798.896 403.813 756.045 488.55C681.55 635.864 481.904 571.514 325.036 552.011C203.808 536.938 56.5773 577.714 9.12435 458.763C-22.1885 380.27 35.4192 334.954 56.8804 252.84C82.7581 153.828 76.7585 63.4122 162.184 14.5394Z"
                  fill="#F2E583"
                />
              </svg>

            {/* Container Gambar + Bayangan di Bawah */}
<div className="absolute w-[calc(100%-3px)] h-[calc(100%-3px)] z-10 bottom-8 sm:bottom-14 flex flex-col items-center justify-end">
  {/* Gambar 11.png */}
  <div className="relative w-full h-full">
    <Image
      src={imageSrc}
      alt="Feature Visual"
      fill
      className="object-contain drop-shadow-lg"
      priority
    />
  </div>

</div>

              {/* SVG Badge Biru (Diperkecil) */}
              <div className="absolute bottom-4 right-1 sm:bottom-8 sm:right-4 z-20 w-[105px] sm:w-[130px] aspect-[304/324]">
                <div className="relative w-full h-full flex items-center justify-center text-center">
                  
                  {/* Custom Blue Badge SVG */}
                  <svg
                    viewBox="0 0 304 324"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
                  >
                    <path
                      d="M144.498 25.078C178.558 -0.909245 223.969 54.9436 250.605 88.0787C282.574 127.848 312.2 156.947 300.725 206.952C277.998 305.999 172.498 323.999 154.498 323.999C53.3287 323.999 14.0315 267.765 13.9981 179.295C13.9825 137.983 68.6883 82.9203 144.498 25.078Z"
                      fill="#558FBD"
                    />
                    <path
                      d="M26.3056 97.5803C83.66 20.037 144.571 -12.6343 166.998 10.0781C189.425 32.7905 274.065 110.873 285.535 164.046C302.215 241.367 171.922 323.649 114.586 312.571C24.7118 295.207 -31.0487 175.124 26.3056 97.5803Z"
                      stroke="#FFFFFF"
                      strokeWidth="6"
                    />
                  </svg>

                  {/* Teks Usia 6+ Warna Putih */}
                  <div className="relative z-10 flex items-center justify-center px-2">
                    <span className="font-heading text-base sm:text-lg font-semibold text-white leading-tight">
                      Usia 6+
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Text & Details */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-5 sm:space-y-6 text-left">
            
           <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FAEE7C] text-[#3D2900] text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-sm">
  {badgeCategory}
</span>
            {/* Heading Section */}
            <div className="relative w-full pb-6 sm:pb-8">
              <h2 className="font-heading text-xl xs:text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#3D2900] tracking-tight leading-snug relative z-10">
                {titleMain}{" "}
                <span className="block sm:inline text-[#3D2900]">
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

            <p className="font-body text-sm sm:text-base text-[#5C4A27] leading-relaxed max-w-xl font-normal pt-1">
              {description}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full pt-1">
              {features.map((feature) => (
                <FeatureItem key={feature.id} label={feature.label} />
              ))}
            </div>

            <div className="pt-3 w-full sm:w-auto">
              <Link
                href={ctaHref}
                className={cn(
                  buttonVariants({ variant: "accent-orange", size: "lg", neo: true }),
                  "w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-extrabold text-white bg-[#558FBD] hover:bg-[#257CC4] rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2"
                )}
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}