import Navbar from "@/components/user/navbar";
import HeroRobot from "@/components/user/landing/robot";
import Awan from "@/components/user/landing/awan";
import Link from "next/link";
import { ArrowRight, Play, Bot, Rocket, Smile } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-accent-blue pt-4 pb-53 sm:pb-64 overflow-visible">
      {/* Navigation Bar */}
      <header className="relative z-20 px-4 mb-6 md:mb-10 w-full flex justify-center">
        <Navbar />
      </header>

      {/* Hero Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2">
        {/* Left Column: Text & Action */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
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
              className="inline-flex items-center gap-2.5 bg-card hover:bg-muted text-[#3D2900] font-bold text-base sm:text-lg px-6 py-3.5 rounded-full border-2 border-[#3D2900] neo-shadow neo-shadow-hover transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-accent-yellow flex items-center justify-center border border-[#3D2900]">
                <Play className="w-4 h-4 text-[#3D2900] fill-[#3D2900] ml-0.5" />
              </div>
              <span>Tonton Demo</span>
            </button>
          </div>

          {/* Feature Highlights / Stats */}
          
        </div>

        {/* Right Column: Waving Robot Visual */}
        <div className="lg:col-span-5 flex justify-center items-center relative">
          <HeroRobot />
        </div>
      </div>

      {/* Cloud Illustration */}
      <Awan />
    </section>
  );
}
