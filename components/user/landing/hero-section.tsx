"use client";

import Navbar from "@/components/user/navbar";
import HeroRobot from "@/components/user/landing/robot";
import Awan from "@/components/user/landing/awan";
import Link from "next/link";
import { ArrowRight, Play, Bot, Rocket, BookOpen } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-[#175B92] pt-4 pb-20 sm:pb-32 lg:pb-48 overflow-visible">
      {/* Navigation Bar */}
      <header className="relative z-20 px-4 mb-6 md:mb-10 w-full flex justify-center [&>nav]:!h-[64px] md:[&>nav]:!h-[95px] [&>nav]:!px-4 sm:[&>nav]:!px-8 md:[&>nav]:!px-12 [&>nav]:!mt-2 md:[&>nav]:!mt-4 [&_span]:!text-[22px] [&_span]:sm:!text-2xl [&_span]:md:!text-[32px] [&_span]:!leading-normal [&_img]:!w-7 [&_img]:!h-7 md:[&_img]:!w-auto md:[&_img]:!h-auto">
        <Navbar />
      </header>

      {/* Hero Main Content (Ditambahkan pl-4 sm:pl-8 lg:pl-10 agar bergeser sedikit ke kanan secara halus) */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pl-8 sm:pl-12 lg:pl-14 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center pt-2">
        {/* Left Column: Text & Action */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-4.5 text-left lg:pl-6">
          {/* Main Title */}
       <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.18] text-white tracking-tight">
              Rakit & Mainkan Robot Impian Anak{" "}
              <span className="relative inline-block mt-4 sm:mt-6 px-2.5 py-0.5 bg-accent-yellow rounded-xl rotate-[-2deg] text-primary text-[0.85em]">
                Usia 6+ Tahun!
              </span>
            </h1>

          {/* Subtitle */}
          <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed max-w-lg font-normal">
    Bantu si kecil belajar coding dan logika teknologi sejak dini melalui kit robotik interaktif yang seru, aman, dan mudah dimainkan.
  </p>

          {/* CTA Buttons */}
        {/* CTA Buttons */}
<div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full sm:w-auto">
 {/* Primary CTA */}
<Link
  href="/product"
  className="inline-flex items-center justify-center gap-2.5 bg-[#FFF6A0] hover:bg-[#ffadd4] text-[#3D2900] font-extrabold text-sm px-6 py-3.5 rounded-full shadow-md hover:scale-105 transition-all w-full sm:w-auto"
>
  <span>Jelajahi Mainan Robot</span>
  <ArrowRight className="w-4 h-4 text-[#3D2900]" />
</Link>

  {/* Secondary CTA (Outlined Glass Transparan) */}
  <button
    type="button"
    className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-full border border-white/40 backdrop-blur-sm transition-all w-full sm:w-auto cursor-pointer"
  >
    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
      <Play className="w-3 h-3 text-white fill-white ml-0.5" />
    </div>
    <span>Tonton Demo</span>
  </button>
</div>
        </div>

        {/* Right Column: Waving Robot Visual */}
        <div className="lg:col-span-5 flex justify-center items-center relative lg:-ml-6">
          <HeroRobot />
        </div>
      </div>

      {/* Cloud Illustration */}
      <Awan />
    </section>
  );
}