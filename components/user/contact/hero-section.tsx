"use client";

import Image from "next/image";
import { Clock, Mail } from "lucide-react";

export function ContactHeroSection() {
  return (
    <div className="w-full bg-background p-0 m-0">
      <section className="relative w-full min-h-[70vh] bg-[#97CEF9] rounded-none pt-36 sm:pt-48 lg:pt-52 pb-44 sm:pb-48 lg:pb-56 overflow-hidden flex flex-col justify-center items-center">

        {/* ── Awan kiri ── */}
        <div className="absolute top-12 sm:top-16 left-0 w-56 sm:w-80 lg:w-[28rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-start">
          <Image src="/images/awan.webp" alt="" width={600} height={380} className="w-full h-auto object-contain" priority />
          <div className="w-40 sm:w-56 lg:w-72 mt-1 sm:mt-3 -ml-2 sm:-ml-4 opacity-90">
            <Image src="/images/awan.webp" alt="" width={400} height={260} className="w-full h-auto object-contain scale-x-90" priority />
          </div>
        </div>

        {/* ── Awan kanan ── */}
        <div className="absolute top-12 sm:top-16 right-0 w-56 sm:w-80 lg:w-[28rem] opacity-85 pointer-events-none select-none z-0 flex flex-col items-end">
          <Image src="/images/awan.webp" alt="" width={600} height={380} className="w-full h-auto object-contain -scale-x-100 rotate-6" priority />
          <div className="w-40 sm:w-56 lg:w-72 mt-1 sm:mt-3 -mr-2 sm:-mr-4 opacity-90">
            <Image src="/images/awan.webp" alt="" width={400} height={260} className="w-full h-auto object-contain -scale-x-100 -rotate-12" priority />
          </div>
        </div>

        {/* ── Lingkaran dekoratif ── */}
        <div className="absolute top-32 left-20 sm:left-32 w-10 h-10 border-2 border-white/40 rounded-full opacity-60 pointer-events-none z-0" />
        <div className="absolute top-36 right-20 sm:right-32 w-8 h-8 bg-white/20 rounded-full opacity-60 pointer-events-none z-0" />

        {/* ── Konten utama ── */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 gap-5 sm:gap-6 max-w-3xl mx-auto pt-10">

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900 tracking-tight">
            Hubungi & Terhubung<br className="hidden sm:block" />
            <span className="text-[#1C6CAE]"> Bersama RoboEdu</span>
          </h1>

          <p className="font-body text-xs sm:text-sm lg:text-base text-slate-800/90 leading-relaxed max-w-xl font-medium">
            Pertanyaan produk, konsultasi kebutuhan sekolah, atau kerja sama reseller — 
            tim kami siap merespons cepat dan ramah.
          </p>

          {/* Info pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-white rounded-full px-4 py-2 font-body font-bold text-xs text-slate-800">
              <Clock className="w-3.5 h-3.5 text-[#1C6CAE] shrink-0" />
              Senin–Sabtu, 08.00–17.00 WIB
            </div>
            <div className="inline-flex items-center gap-2 bg-white/80 border border-white rounded-full px-4 py-2 font-body font-bold text-xs text-slate-800">
              <Mail className="w-3.5 h-3.5 text-[#1C6CAE] shrink-0" />
              Balas dalam 1×24 jam
            </div>
          </div>
        </div>

        {/* ── Scalloped bottom edge (sama persis dengan hero membership) ── */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg className="relative block w-full h-[45px] sm:h-[60px] lg:h-[75px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,-35 C50,55 100,55 150,-35 C200,55 250,55 300,-35 C350,55 400,55 450,-35 C500,55 550,55 600,-35 C650,55 700,55 750,-35 C800,55 850,55 900,-35 C950,55 1000,55 1050,-35 C1100,55 1150,55 1200,-35"
              fill="none" stroke="#1C6CAE" strokeWidth="5" strokeLinecap="round"
            />
            <path
              d="M0,0 C50,90 100,90 150,0 C200,90 250,90 300,0 C350,90 400,90 450,0 C500,90 550,90 600,0 C650,90 700,90 750,0 C800,90 850,90 900,0 C950,90 1000,90 1050,0 C1100,90 1150,90 1200,0 L1200,120 L0,120 Z"
              fill="var(--background)"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}
