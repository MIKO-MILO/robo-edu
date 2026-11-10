"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ResellerCtaSection() {
  return (
    <section className="relative w-full py-6 sm:py-10 overflow-hidden bg-transparent">
      
      {/* Container utama */}
      <div className="relative w-full min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex items-center justify-end">
        
        {/* ── 2. SVG Latar Belakang Kanan (Sisi Kanan) ── */}
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[80%] h-full pointer-events-none z-0 flex items-center justify-end">
          <svg
            viewBox="0 0 1004 622"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover lg:object-fill object-right drop-shadow-md scale-y-135 origin-center"
            preserveAspectRatio="none"
          >
            <path
              d="M127.498 97C308.484 43.5 554.992 283 588.492 267.5C621.992 252 411.223 165.993 457.5 86.5C519.5 -20 680.026 150.597 806 125C906.699 104.539 1003.49 0 1003.49 0V622C1003.49 622 885.565 485.294 781.992 472.5C690.149 461.155 672 541 577.5 557C492.823 571.337 527.002 426 425.992 415C324.982 404 118.995 544 55.9874 478C-7.02054 412 -53.4892 150.5 127.498 97Z"
              fill="#1393e8ff"
            />
          </svg>
        </div>

        {/* ── Content Container ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-6">
            
            {/* Area Kiri: Teks & Tombol */}
            <div className="lg:col-span-6 flex flex-col items-start gap-3 text-left pl-8 sm:pl-20 lg:pl-28 pr-2 max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] lg:translate-x-24 -translate-y-6">
              <h2 className="font-heading font-extrabold text-lg sm:text-xl lg:text-2xl text-white leading-snug drop-shadow-sm">
                Siap Memulai Kemitraan Bersama RoboEdu?
              </h2>

              <p className="font-body text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                Cetak generasi inventor masa depan dengan penyediaan produk robotika berkualitas tinggi.
              </p>

              <Link
                href="/contact"
                className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#E8A613] hover:bg-amber-50 font-heading font-bold text-[11px] sm:text-xs transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
              >
                <span>AJUKAN JADI RESELLER SEKARANG</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>

            {/* Area Kanan: Gambar Robot dengan Outline Putih Saja (Tanpa Bayangan Gelap) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end items-center pr-2 lg:pr-4 -translate-y-4">
              <div className="relative w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[450px] aspect-square flex items-center justify-center">
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