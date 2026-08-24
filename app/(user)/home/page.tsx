
import HeroRobot from "@/components/user/hero-robot";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Bot, Rocket, Smile } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section Container (Background #DEF4FF) - overflow-visible agar awan bisa keluar menembus section */}
      <section className="relative bg-accent-blue pt-6 pb-53 sm:pb-64 overflow-visible">

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2">
          {/* Left Column: Text & Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            {/* Tag / Badge */}
            {/* <div className="inline-flex items-center gap-2 bg-[#FAF1CA] border-2 border-[#3D2900] neo-shadow px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#3D2900]">
              <Sparkles className="w-4 h-4 text-primary fill-primary" />
              <span>Mainan Robotik & Coding Edukatif (Usia 6+ Tahun)</span>
            </div> */}

            {/* Main Title */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-[#3D2900] tracking-tight">
              Rakit & Mainkan Robot Impian Anak{" "}
              <span className="relative inline-block px-3 py-1 bg-accent-yellow rounded-2xl border-2 border-[#3D2900] neo-shadow rotate-[-1.5deg] text-primary">
                Usia 6+ Tahun!
              </span>
            </h1>

            {/* Subtitle */}
            <p className="font-body text-base sm:text-lg lg:text-xl text-[#3D2900]/85 leading-relaxed max-w-2xl">
              Bantu si kecil belajar coding dan logika teknologi sejak dini melalui kit robotik interaktif yang seru, aman, dan mudah dimainkan untuk usia 6 tahun ke atas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/product"
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-600 text-white font-bold text-base sm:text-lg px-7 py-3.5 rounded-full border-2 border-[#3D2900] neo-shadow neo-shadow-hover transition-all duration-200"
              >
                <span>Jelajahi Mainan Robot</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-2.5 bg-card hover:bg-muted text-[#3D2900] font-bold text-base sm:text-lg px-6 py-3.5 rounded-full border-2 border-[#3D2900] neo-shadow neo-shadow-hover transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-accent-yellow flex items-center justify-center border border-[#3D2900]">
                  <Play className="w-4 h-4 text-[#3D2900] fill-[#3D2900] ml-0.5" />
                </div>
                <span>Tonton Demo</span>
              </button>
            </div>

            {/* Feature Highlights / Stats */}
            <div className="pt-6 border-t border-[#3D2900]/15 w-full grid grid-cols-3 gap-3 sm:gap-6 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent-yellow/70 border border-[#3D2900]/20 flex items-center justify-center shrink-0">
                  <Smile className="w-5 h-5 text-[#3D2900]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#3D2900]">Usia 6+</h4>
                  <p className="text-xs text-[#3D2900]/70 font-medium">Aman & Mudah</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/60 border border-[#3D2900]/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#3D2900]">50+ Kit</h4>
                  <p className="text-xs text-[#3D2900]/70 font-medium">Mainan Robotik</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/60 border border-[#3D2900]/20 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-[#3D2900]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#3D2900]">10k+ Anak</h4>
                  <p className="text-xs text-[#3D2900]/70 font-medium">Bermain & Belajar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Waving Robot Visual */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <HeroRobot />
          </div>
        </div>

        {/* Gambar Awan Diposisikan Menjorok Turun ke Bawah Menembus Section */}
        <div className="absolute  bottom-0 left-0 right-0  z-2 pointer-events-none leading-none">
          <Image
            src="/images/awannn.png"
            alt="Ilustrasi Awan"    
            width={1920}
            height={150}
            className="w-full h-auto object-cover object-bottom"
            priority
          />
        </div>
      </section>
    </main>
  );
}