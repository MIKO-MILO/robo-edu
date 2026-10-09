"use client";

import Image from"next/image";
import Link from"next/link";
import { Check, ArrowRight } from"lucide-react";
import { buttonVariants } from"@/components/ui/button";
import { cn } from"@/lib/utils";

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
}

const defaultFeatures: FeaturePoint[] = [
 { id: 1, label:"Learning & Fun" },
 { id: 2, label:"Aman Untuk Usia 6+" },
 { id: 3, label:"Modul IoT Interaktif" },
 { id: 4, label:"Mudah Dirakit (DIY)" },
];

export default function ICardsInfo({
 badgeCategory ="Tentang Kami",
 titleMain ="Aman, Seru & Edukatif —",
 titleHighlight ="Impian Setiap Anak",
 description ="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam",
 statNumber ="Usia 6+",
 statLabel ="Mainan IoT Edukatif",
 features = defaultFeatures,
}: CardsInfoProps) {
 return (
 <section className="relative bg-[#2781CD] mt-12 sm:mt-6 lg:mt-8 pt-4 pb-8 sm:pb-8">
 
 {/* Cloud Bumps Divider */}
 <div className="absolute top-0 left-0 right-0 w-full -translate-y-[99%] overflow-visible leading-none z-30 pointer-events-none">
 {/* SVG MOBILE (3 Lengkungan) */}
 <svg
 viewBox="0 0 500 280"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className="w-full h-auto max-h-[140px] block sm:hidden"
 preserveAspectRatio="none"
 >
 <path
 d="M 0 280 
 L 0 130 
 C 30 10, 190 10, 220 150 
 C 240 105, 305 105, 325 160 
 C 355 55, 480 55, 500 140 
 L 500 280 Z"
 fill="#2781CD"
 />
 <g stroke="rgba(255, 255, 255, 0.85)" strokeWidth="2" strokeLinecap="round" fill="none">
 {/* Lengkungan 1: Kiri */}
 <g transform="translate(15, 65) scale(1.35)">
 <path d="M0.931641 41.5518C0.931641 41.5518 15.9316 2.77783 60.4316 1.05774C90.8504 -0.118056 105.932 17.0533 105.932 17.0533" />
 </g>

 {/* Lengkungan 2: Tengah */}
 <g transform="translate(235, 133) scale(0.95)">
 <path d="M0.861328 25.5758C0.861328 25.5758 12.3635 6.0767 35.364 1.63354C58.3647 -2.80967 79.3633 17.5743 79.3633 17.5743" />
 </g>

 {/* Lengkungan 3: Paling Kanan */}
 <g transform="translate(365, 98) scale(1.15)">
 <path d="M0.894531 18.5644C0.894531 18.5644 7.13484 6.02997 36.8945 1.49014C66.3945 -3.01007 85.8945 24.9905 85.8945 24.9905" />
 </g>
 </g>
 </svg>

 {/* SVG DESKTOP / TABLET (7 Lengkungan) */}
 <svg
 viewBox="0 0 1440 280"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className="w-full h-auto max-h-[200px] lg:max-h-[260px] hidden sm:block"
 preserveAspectRatio="none"
 >
 <path
 d="M 0 280 L 0 150 C 15 20, 185 20, 215 160 C 235 90, 345 90, 365 165 C 380 135, 410 135, 425 170 C 455 100, 560 100, 580 168 C 620 5, 930 5, 960 160 C 995 15, 1260 15, 1285 170 C 1315 80, 1420 70, 1440 140 L 1440 280 Z"
 fill="#2781CD"
 />
 <g stroke="rgba(255, 255, 255, 0.85)" strokeWidth="2" strokeLinecap="round" fill="none">
 <g transform="translate(20, 78) scale(1.2)">
 <path d="M0.931641 41.5518C0.931641 41.5518 15.9316 2.77783 60.4316 1.05774C90.8504 -0.118056 105.932 17.0533 105.932 17.0533" />
 </g>
 <g transform="translate(234, 128) scale(1.2)">
 <path d="M0.861328 25.5758C0.861328 25.5758 12.3635 6.0767 35.364 1.63354C58.3647 -2.80967 79.3633 17.5743 79.3633 17.5743" />
 </g>
 <g transform="translate(376, 152) scale(1.2)">
 <path d="M0.953125 10.5561C0.953125 10.5561 3.95117 1 15.4512 1C23.4508 1 29.4512 8.00021 29.4512 8.00021" />
 </g>
 <g transform="translate(458, 130) scale(1.2)">
 <path d="M0.894531 18.5644C0.894531 18.5644 7.13484 6.02997 36.8945 1.49014C66.3945 -3.01007 85.8945 24.9905 85.8945 24.9905" />
 </g>
 <g transform="translate(605, 68) scale(1.35)">
 <path d="M0.904297 54.2181C0.904297 54.2181 24.4043 4.26845 114.404 1.16458C215.904 -2.3359 241.404 51.1646 241.404 51.1646" />
 </g>
 <g transform="translate(990, 70) scale(1.35)">
 <path d="M0.947266 49.158C0.947266 49.158 13.9473 10.6698 71.4473 2.49347C151.947 -8.95336 192.949 49.158 192.949 49.158" />
 </g>
 <g transform="translate(1324, 115) scale(1.2)">
 <path d="M0.695312 18.9391C0.695312 18.9391 13.6948 6.30818 36.6953 1.86491C65.1953 -3.64077 83.1953 18.9397 83.1953 18.9397" />
 </g>
 </g>
 </svg>
 </div>

 {/* Padding atas diperkecil minimal (pt-2 sm:pt-4 md:pt-1 lg:pt-2) */}
 <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-2 sm:pt-4 md:pt-1 lg:pt-2">
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">

 {/* LEFT COLUMN */}
 <div className="lg:col-span-6 flex justify-center items-center relative overflow-visible">
 <div className="relative w-full max-w-[320px] xs:max-w-[380px] sm:max-w-[420px] lg:max-w-[380px] xl:max-w-[460px] aspect-square flex items-center justify-center">
 <div className="absolute inset-0 w-full h-full z-0 scale-105 sm:scale-105 lg:scale-105 xl:scale-115">
 <Image
 src="/images/yellow.webp"
 alt="Yellow Shape Background"
 fill
 className="object-contain drop-shadow-md"
 priority
 />
 </div>

 {/* BINTANG SPARKLE */}
 <div className="absolute -left-4 xs:-left-6 sm:-left-8 lg:-left-6 xl:-left-12 top-[12%] z-20 pointer-events-none animate-pulse">
 <svg viewBox="0 0 100 100" fill="none" className="w-14 h-14 xs:w-18 xs:h-18 sm:w-22 sm:h-22 lg:w-20 lg:h-20 xl:w-24 xl:h-24 text-white drop-shadow-lg">
 <path d="M 50,12 C 50,35 65,50 88,50 C 65,50 50,65 50,88 C 50,65 35,50 12,50 C 35,50 50,35 50,12 Z" fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
 <path d="M 76,16 L 76,32 M 68,24 L 84,24" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
 <circle cx="22" cy="78" r="6" fill="none" stroke="currentColor" strokeWidth="5" />
 </svg>
 </div>

 {/* Bintang Kanan Top */}
 <div className="absolute -right-1 xs:right-[1%] sm:right-[3%] top-[6%] z-20 pointer-events-none">
 <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 xs:w-14 xs:h-14 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-16 xl:h-16 text-white/90 drop-shadow-md">
 <path d="M 20,4 C 20,13 27,20 36,20 C 27,20 20,27 20,36 C 20,27 13,20 4,20 C 13,20 20,13 20,4 Z" fill="currentColor" />
 </svg>
 </div>

 {/* Lingkaran Kiri Bottom */}
 <div className="absolute left-[0%] -bottom-[2%] xs:-bottom-[3%] sm:-bottom-[4%] z-20 pointer-events-none">
 <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full border-2 sm:border-4 border-dashed border-white/90" />
 </div>

 {/* BOY IMAGE */}
 <div className="absolute inset-0 w-full h-full z-10 p-4 xs:p-6 sm:p-8 flex items-center justify-center translate-y-2 sm:translate-y-4">
 <Image
 src="/images/boy.webp"
 alt="Boy Character"
 fill
 className="object-contain drop-shadow-lg scale-90 sm:scale-90 lg:scale-90 xl:scale-95"
 priority
 />
 </div>
 </div>
 </div>

 {/* RIGHT COLUMN */}
 <div className="lg:col-span-6 flex flex-col items-center lg:items-start space-y-3 sm:space-y-4 lg:space-y-4 xl:space-y-6 text-center lg:text-left">
 <span className="inline-flex items-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#FAEE7C] text-foreground text-[11px] xs:text-xs sm:text-sm font-extrabold tracking-wide uppercase">
 {badgeCategory}
 </span>

 <div className="relative w-full pb-3 sm:pb-6 lg:pb-4 xl:pb-8 flex flex-col items-center lg:items-start">
 <h2 className="font-heading text-lg xs:text-xl sm:text-2xl lg:text-2xl xl:text-[32px] font-extrabold text-white tracking-tight leading-snug relative z-10 max-w-md sm:max-w-lg lg:max-w-full">
 {titleMain}{""}
 <span className="block sm:inline text-white">
 {titleHighlight}
 </span>
 </h2>

 <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 w-full max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] xl:max-w-[260px] pointer-events-none z-0 translate-y-2 sm:translate-y-3">
 <svg width="400" height="100" viewBox="0 0 400 100" className="w-full h-auto">
 <path d="M 30,50 Q 200,25 370,40" stroke="#F2E583" strokeWidth="7" fill="none" strokeLinecap="round" />
 </svg>
 </div>
 </div>

 <p className="font-body text-xs xs:text-sm sm:text-sm xl:text-base text-white/90 leading-relaxed max-w-lg sm:max-w-xl font-normal pt-1">
 {description}
 </p>

 {/* CONTAINER POIN CENTANG / FEATURES */}
 <div className="grid grid-cols-2 gap-y-2.5 xs:gap-y-3 sm:gap-y-3 xl:gap-y-4 gap-x-3 sm:gap-x-5 xl:gap-x-6 w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-full mx-auto lg:mx-0 pt-1">
 {features.map((feature) => (
 <div key={feature.id} className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 group justify-start">
 <div className="w-5 h-5 sm:w-6 sm:h-6 xl:w-7 xl:h-7 rounded-full bg-white/20 border-2 border-white text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
 <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 xl:w-4 xl:h-4 stroke-[3]" />
 </div>
 <span className="font-heading font-extrabold text-[11px] xs:text-xs sm:text-xs xl:text-sm text-white tracking-tight text-left leading-tight">
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