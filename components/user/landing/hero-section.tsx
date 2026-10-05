"use client";

import Navbar from "@/components/user/navbar";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#F3EFE4] min-h-screen pt-4 pb-20 overflow-hidden flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="relative z-20 px-4 mb-8 md:mb-12 w-full flex justify-center">
        <Navbar />
      </header>

      {/* Hero Main Content - Centered Layout */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex-1 flex flex-col items-center justify-center py-6">
        
        {/* Decorative Element Left */}
        <div className="hidden lg:block absolute left-4 xl:-left-12 top-10 pointer-events-none">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 bg-[#D9C4EC] rounded-full transform -rotate-6" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm">
              <Image
                src="/images/kid-robot.png"
                alt="Anak bermain robot"
                fill
                className="object-cover"
              />
            </div>
            <svg
              className="absolute -bottom-8 -left-4 w-12 h-12 text-[#8B5CF6] opacity-80"
              viewBox="0 0 50 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M 10 10 Q 25 35 40 40" strokeDasharray="3 3" />
              <path d="M 35 32 L 40 40 L 32 42" />
            </svg>
          </div>
        </div>

        {/* Decorative Element Right Top */}
        <div className="hidden lg:block absolute right-6 xl:-right-10 top-12 pointer-events-none">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-dashed border-[#222222]/30 flex items-center justify-center bg-[#FFE599]/30 animate-spin-slow">
              <span className="text-[10px] font-bold text-[#222222] tracking-widest uppercase text-center px-2">
                IoT Kit • Kids Robot •
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#111111] leading-[1.15] tracking-tight max-w-4xl mx-auto">
          Tempat Terbaik <br />
          <span className="relative inline-block italic font-serif text-[#6C5CE7] mr-3">
            Belajar
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-[#D9C4EC]"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 10 Q25 18 50 10 T100 10"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          &{" "}
          <span className="relative inline-block italic font-serif text-[#EAB308] ml-2">
            Rakit Robot
            <svg
              className="absolute -bottom-1 left-0 w-full h-2 text-[#FEF08A]"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 5 L100 5"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          IoT Anak
        </h1>

        {/* Subtitle */}
        <p className="font-body text-gray-700 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
          Eksplorasi ribuan kit robotik IoT interaktif dan menyenangkan untuk
          mendukung kreativitas, logika coding, dan pemahaman teknologi si kecil.
        </p>

        {/* Action Button dengan Margin Top & Margin Bottom Besar */}
        <div className="mt-14 sm:mt-20 lg:mt-24 mb-28 sm:mb-36 lg:mb-44 flex justify-center">
          <Link
            href="/product"
            className="group inline-flex items-center gap-3 bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-semibold text-base px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Mulai Sekarang</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Decorative Element Right Bottom */}
        <div className="hidden lg:block absolute right-12 bottom-6 pointer-events-none">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 bg-[#E0E7FF] rounded-3xl transform rotate-6" />
            <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-white shadow-sm">
              <Image
                src="/images/kid-happy.png"
                alt="Anak gembira"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Decorative Element Left Bottom */}
        <div className="hidden lg:block absolute left-12 bottom-8 pointer-events-none opacity-40">
          <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#6C5CE7]" />
        </div>

      </div>
    </section>
  );
}