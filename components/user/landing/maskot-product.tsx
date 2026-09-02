"use client";

import Image from "next/image";
import { Bot, Sparkles, Smile, Cpu } from "lucide-react";

export default function MaskotProduct() {
  return (
    <section className="relative bg-[#F3EFE4] py-16 sm:py-24 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2483D0]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Mascot Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Mascot Image Container with Floating Animation */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl">
              <Image
                src="/images/robo.png"
                alt="Maskot RoboEdu Product"
                fill
                className="object-contain animate-bounce-slow"
                priority
              />
            </div>
          </div>

          {/* Right Column: Mascot Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF6A0] text-[#3D2900] font-bold text-xs sm:text-sm shadow-sm">
              <Bot className="w-4 h-4 text-[#18598D]" />
              <span>Teman Setia Belajar Coding</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              Berkenalan dengan <span className="text-[#FFF6A0]">RoboBot</span>, Maskot Pintar RoboEdu!
            </h2>

            <p className="font-body text-sm sm:text-base text-white/85 leading-relaxed">
              RoboBot bukan sekadar mainan biasa. Ia dilengkapi dengan kepribadian interaktif, mampu berekspresi, dan membimbing anak langkah demi langkah saat merakit dan memprogram robot.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-[#FFF6A0] text-[#3D2900] flex items-center justify-center mb-3">
                  <Smile className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Ekspresi Emosi Lucu</h4>
                <p className="text-xs text-white/75 mt-1">Layar LED menampilkan raut wajah ceria saat berhasil merakit.</p>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-[#FFF6A0] text-[#3D2900] flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-white">Suara Bahasa Indonesia</h4>
                <p className="text-xs text-white/75 mt-1">Instruksi ramah berbahasa Indonesia yang mudah dimengerti anak.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
