"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function ResellerHeroSection() {
  return (
    /* Outer Container: Penuh kiri, kanan, atas tanpa gap */
    <div className="w-full bg-background p-0 m-0">
      <section className="relative w-full min-h-[100vh] sm:min-h-[100vh] lg:min-h-[100vh] bg-[#97CEF9] rounded-none pt-36 sm:pt-48 lg:pt-52 pb-44 sm:pb-48 lg:pb-56 overflow-hidden flex flex-col justify-center items-center">
        
        {/* --- KUMPULAN GAMBAR AWAN KIRI --- */}
        <div className="absolute top-12 sm:top-16 left-0 w-56 sm:w-80 lg:w-[28rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-start">
          {/* Awan Utama Kiri */}
          <Image
            src="/images/awan.webp"
            alt="Awan Dekorasi Kiri Atas"
            width={600}
            height={380}
            className="w-full h-auto object-contain"
            priority
          />
          {/* Awan Kedua Kiri Bawah */}
          <div className="w-40 sm:w-56 lg:w-72 mt-1 sm:mt-3 -ml-2 sm:-ml-4 opacity-90">
            <Image
              src="/images/awan.webp"
              alt="Awan Dekorasi Kiri Bawah"
              width={400}
              height={260}
              className="w-full h-auto object-contain scale-x-90"
              priority
            />
          </div>
        </div>

        {/* --- KUMPULAN GAMBAR AWAN KANAN --- */}
        <div className="absolute top-12 sm:top-16 right-0 w-56 sm:w-80 lg:w-[28rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-end">
          {/* Awan Utama Kanan (Rotate/Flip) */}
          <Image
            src="/images/awan.webp"
            alt="Awan Dekorasi Kanan Atas"
            width={600}
            height={380}
            className="w-full h-auto object-contain -scale-x-100 rotate-6"
            priority
          />
          {/* Awan Kedua Kanan Bawah */}
          <div className="w-40 sm:w-56 lg:w-72 mt-1 sm:mt-3 -mr-2 sm:-mr-4 opacity-90">
            <Image
              src="/images/awan.webp"
              alt="Awan Dekorasi Kanan Bawah"
              width={400}
              height={260}
              className="w-full h-auto object-contain -scale-x-100 -rotate-12"
              priority
            />
          </div>
        </div>

        {/* Lingkaran Dekoratif Transparan */}
        <div className="absolute top-32 left-20 sm:left-32 w-10 h-10 border-2 border-white/40 rounded-full opacity-60 pointer-events-none z-0" />
        <div className="absolute top-36 right-20 sm:right-32 w-8 h-8 bg-white/20 rounded-full opacity-60 pointer-events-none z-0" />

        {/* Main Content: Badge, Judul, Subjudul */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 gap-5 sm:gap-6 max-w-4xl lg:max-w-5xl mx-auto">
          
          {/* Main Headline */}
          <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900 tracking-tight w-full pt-15">
            Tumbuh Bersama & Raih Keuntungan Menjanjikan
          </h1>

          {/* Sub-judul Singkat */}
          <p className="font-body text-xs sm:text-sm lg:text-base text-slate-800/90 leading-relaxed max-w-xl font-medium">
            Jadikan bisnis kit robotika Anda lebih berkembang dengan dukungan resmi dari RoboEdu.
          </p>

        </div>

        {/* Curved / Scallop Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg
            className="relative block w-full h-[45px] sm:h-[60px] lg:h-[75px]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            {/* Garis Biru Tua di Atas Lengkungan */}
            <path
              d="M0,-35 
                 C50,55 100,55 150,-35 
                 C200,55 250,55 300,-35 
                 C350,55 400,55 450,-35 
                 C500,55 550,55 600,-35 
                 C650,55 700,55 750,-35 
                 C800,55 850,55 900,-35 
                 C950,55 1000,55 1050,-35 
                 C1100,55 1150,55 1200,-35"
              fill="none"
              stroke="#1C6CAE"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Area Lengkungan Utama */}
            <path
              d="M0,0 
                 C50,90 100,90 150,0 
                 C200,90 250,90 300,0 
                 C350,90 400,90 450,0 
                 C500,90 550,90 600,0 
                 C650,90 700,90 750,0 
                 C800,90 850,90 900,0 
                 C950,90 1000,90 1050,0 
                 C1100,90 1150,90 1200,0 
                 L1200,120 L0,120 Z"
              fill="var(--background)"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}