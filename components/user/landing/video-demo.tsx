"use client";

import Image from "next/image";
import { Play, Sparkles, CheckCircle } from "lucide-react";

export default function VideoDemo() {
  return (
    <section className="relative bg-[#18598D] py-16 sm:py-24 text-white overflow-hidden">
      {/* Decorative Cloud Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none">
        <Image
          src="/images/awan11.png"
          alt="Awan Accent"
          fill
          className="object-contain"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column - Video Preview Container */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 group cursor-pointer bg-black/40">
              {/* Thumbnail Image */}
              <div className="relative w-full aspect-video bg-slate-800">
                <Image
                  src="/images/ChatGPT Image 24 Agu 2026, 11.56.23.png"
                  alt="Video Demo RoboEdu"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] group-hover:bg-black/20 transition-all">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFF6A0] text-[#3D2900] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <span className="mt-3 font-heading font-extrabold text-sm sm:text-base text-white tracking-wide drop-shadow-md">
                  Putar Video Demo (1 Min)
                </span>
              </div>

              {/* Duration Tag */}
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white/90">
                01:45
              </div>
            </div>
          </div>

          {/* Right Column - Explanation & Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#FFF6A0] font-bold text-xs sm:text-sm backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-[#FFF6A0]" />
              <span>Mudah & Menyenangkan</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold leading-tight">
              Saksikan Bagaimana Anak Merakit Robot Pertama Mereka!
            </h2>

            <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed">
              Hanya dalam 3 langkah praktis, anak dapat merakit komponen, menghubungkan modul, dan menjalankan instruksi robotik pertama tanpa kesulitan.
            </p>

            {/* Steps List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <CheckCircle className="w-5 h-5 text-[#FFF6A0] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">1. Unbox & Snap Assembly</h4>
                  <p className="text-xs text-white/75 mt-0.5">Komponen tanpa lem atau solder, aman 100% untuk jari anak.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <CheckCircle className="w-5 h-5 text-[#FFF6A0] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">2. Sambungkan Maskot Interaktif</h4>
                  <p className="text-xs text-white/75 mt-0.5">Maskot RoboEdu memberikan panduan suara & ekspresi lucu.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <CheckCircle className="w-5 h-5 text-[#FFF6A0] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">3. Selesaikan Misi Coding</h4>
                  <p className="text-xs text-white/75 mt-0.5">Level petualangan bertahap yang mengasah logika problem solving.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
