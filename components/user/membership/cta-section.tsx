"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ResellerCtaSection() {
  return (
    <section className="relative w-full bg-transparent">
      {/* Container Kotak Full-Width tanpa padding luar */}
      <div className="w-full relative overflow-hidden bg-[#BAD1F8] border-y border-white/40 shadow-inner">
        
        {/* Pattern Background (Opasitas dinaikkan menjadi 20% agar lebih jelas terlihat) */}
        <div 
          className="absolute inset-0 opacity-[0.20] pointer-events-none z-0"
          style={{
            backgroundImage: `url('/images/pattern.webp')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '240px 240px',
          }}
        />

        {/* Content Wrapper dengan Batasan Max Width di dalamnya */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Area Kiri: Teks & Tombol */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/80 text-[#1C6CAE] font-semibold text-xs backdrop-blur-sm border border-white/90 shadow-sm">
                Gabung Bersama Kami
              </span>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#1C6CAE] tracking-tight leading-snug">
                Siap Memulai Kemitraan Bersama RoboEdu?
              </h2>

              <p className="font-body text-sm sm:text-base text-[#1C6CAE]/90 leading-relaxed font-medium max-w-xl">
                Cetak generasi inventor masa depan dengan penyediaan produk robotika berkualitas tinggi, dukungan kurikulum STEM, dan keuntungan menarik untuk mitra resmi.
              </p>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C6CAE] hover:bg-[#16588c] text-white font-heading font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>AJUKAN JADI RESELLER SEKARANG</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* Area Kanan: Gambar Maskot / Robot (Ukuran Besar) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[460px] aspect-square flex items-center justify-center">
                <Image
                  src="/images/robo3.png"
                  alt="RoboEdu Mascot"
                  width={520}
                  height={520}
                  className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                  style={{
                    filter: `
                      drop-shadow(3px 0 0 white) 
                      drop-shadow(-3px 0 0 white) 
                      drop-shadow(0 3px 0 white) 
                      drop-shadow(0 -3px 0 white)
                      drop-shadow(2px 2px 0 white)
                      drop-shadow(-2px -2px 0 white)
                      drop-shadow(2px -2px 0 white)
                      drop-shadow(-2px 2px 0 white)
                    `,
                  }}
                  priority
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}