"use client";

import React from "react";
import Image from "next/image";

export function ResellerHeroSection() {
  return (
    /* Outer Container: Penuh kiri, kanan, atas tanpa gap */
    <div className="w-full bg-background p-0 m-0">
      <section className="relative w-full min-h-[75vh] sm:min-h-[80vh] lg:min-h-[86vh] bg-landing-sky rounded-none pt-34 sm:pt-40 lg:pt-46 pb-36 sm:pb-42 lg:pb-48 overflow-hidden flex flex-col justify-center items-center">
        
      {/* --- KUMPULAN GAMBAR AWAN KIRI --- */}
        <div className="absolute top-16 sm:top-20 left-0 w-48 sm:w-72 lg:w-[26rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-start">
          {/* Awan Utama Kiri */}
          <Image
            src="/images/awan.webp"
            alt="Awan Dekorasi Kiri Atas"
            width={900}
            height={400}
            className="w-full h-auto object-contain"
            priority
          />
          {/* Awan Kedua Kiri Bawah */}
          <div className="w-36 sm:w-48 lg:w-[17rem] mt-2 sm:mt-3 -ml-2 sm:-ml-3 opacity-90">
            <Image
              src="/images/awan.webp"
              alt="Awan Dekorasi Kiri Bawah"
              width={900}
              height={400}
              className="w-full h-auto object-contain scale-x-90"
              priority
            />
          </div>
        </div>

{/* --- KUMPULAN GAMBAR AWAN KANAN --- */}
        <div className="absolute top-16 sm:top-20 right-0 w-48 sm:w-72 lg:w-[26rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-end">
          {/* Awan Utama Kanan (Rotate/Flip) */}
          <Image
            src="/images/awan.webp"
            alt="Awan Dekorasi Kanan Atas"
            width={600}
            height={380}
            className="w-full h-auto object-contain -scale-x-100"
            priority
          />
          {/* Awan Kedua Kanan Bawah */}
          <div className="w-36 sm:w-48 lg:w-[17rem] mt-2 sm:mt-3 -mr-2 sm:-mr-3 opacity-90">
            <Image
              src="/images/awan.webp"
              alt="Awan Dekorasi Kanan Bawah"
              width={400}
              height={260}
              className="w-full h-auto object-contain -scale-x-100"
              priority
            />
          </div>
        </div>

        {/* Lingkaran Dekoratif Transparan */}
        <div className="absolute top-30 left-18 sm:left-32 w-9 h-9 border-2 border-white/40 rounded-full opacity-60 pointer-events-none z-0" />
        <div className="absolute top-34 right-18 sm:right-32 w-8 h-8 bg-white/20 rounded-full opacity-60 pointer-events-none z-0" />

        {/* Main Content: Judul & Subjudul */}
        <div className="relative z-7 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-6 sm:py-7 gap-3 sm:gap-4 max-w-3xl lg:max-w-4xl mx-auto mt-15">
          
          {/* Main Headline */}
          <h1 className="font-heading text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-tight text-primary-900 tracking-tight w-full pt-4">
            Tumbuh Bersama & Raih Keuntungan
          </h1>

          {/* Sub-judul Singkat */}
          <p className="font-body text-xs sm:text-sm lg:text-base text-primary-700/95 leading-relaxed max-w-xl font-medium">
            Jadikan bisnis kit robotika Anda lebih berkembang dengan dukungan resmi dari RoboEdu.
          </p>

        </div>

        {/* Curved / Scallop Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg
            className="relative block w-full h-[42px] sm:h-[56px] lg:h-[72px]"
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
              stroke="var(--color-membership-blue)"
              strokeWidth="3.9"
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