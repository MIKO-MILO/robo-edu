"use client";

import React from "react";
import { ShieldCheck, Cpu, Sparkles, BookOpen } from "lucide-react";

export interface InfoCardItem {
  id: string | number;
  title: string;
  description: string;
  icon: React.ReactNode;
  rotation: string; // CSS rotation
  translateY: string; // CSS transform translateY
}

const defaultCards: InfoCardItem[] = [
  {
    id: 1,
    title: "Aman Untuk Usia 6+",
    description: "Bahan ramah anak, tanpa sudut tajam, & teruji aman.",
    icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white stroke-[2.5]" />,
    rotation: "sm:-rotate-1 lg:-rotate-2 xl:-rotate-2",
    translateY: "sm:translate-y-1 lg:translate-y-2 xl:translate-y-3",
  },
  {
    id: 2,
    title: "Modul IoT Interaktif",
    description: "Belajar dasar sensor & teknologi dengan seru.",
    icon: <Cpu className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white stroke-[2.5]" />,
    rotation: "sm:rotate-1 lg:rotate-2 xl:rotate-2",
    translateY: "sm:-translate-y-1 lg:-translate-y-1 xl:-translate-y-2",
  },
  {
    id: 3,
    title: "Mudah Dirakit (DIY)",
    description: "Panduan visual interaktif untuk melatih logika anak.",
    icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white stroke-[2.5]" />,
    rotation: "sm:-rotate-1 lg:-rotate-2 xl:-rotate-2",
    translateY: "sm:translate-y-1 lg:translate-y-2 xl:translate-y-2",
  },
  {
    id: 4,
    title: "Kurikulum Edukatif",
    description: "Materi STEM interaktif pendukung daya pikir anak.",
    icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white stroke-[2.5]" />,
    rotation: "sm:rotate-1 lg:rotate-2 xl:rotate-2",
    translateY: "sm:-translate-y-1 lg:-translate-y-1 xl:-translate-y-1",
  },
];

export interface InfoCardsListProps {
  cards?: InfoCardItem[];
}

export default function InfoCardsList({ cards = defaultCards }: InfoCardsListProps) {
  return (
    <section className="bg-[#2781CD] pt-3 sm:pt-6 lg:pt-4 xl:pt-10 pb-16 sm:pb-20 lg:pb-32 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-3 xl:gap-6 items-stretch pt-2 sm:pt-3 lg:pt-2 xl:pt-6 pb-8 sm:pb-12">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-xl sm:rounded-[5px] lg:rounded-2xl xl:rounded-3xl bg-white/20 backdrop-blur-sm p-4 sm:p-5 lg:p-4 xl:p-6 min-h-[160px] sm:min-h-[200px] lg:min-h-[210px] xl:min-h-[270px] flex flex-col justify-center transition-all duration-300 hover:scale-105 hover:z-20 ${card.rotation} ${card.translateY}`}
            >
              {/* Garis Aksen Kiri-Atas */}
              <svg
                className="absolute top-1.5 left-1.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-12 xl:h-12 text-white pointer-events-none opacity-80"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 40 8 C 20 8, 8 20, 8 40"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Garis Aksen Kanan-Bawah */}
              <svg
                className="absolute bottom-1.5 right-1.5 w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-12 xl:h-12 text-white pointer-events-none opacity-80"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 10 42 C 30 42, 42 30, 42 10"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Content Center Centered */}
              <div className="relative z-10 flex flex-col justify-center h-full my-auto py-0.5 sm:py-1">
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-lg sm:rounded-[5px] lg:rounded-xl xl:rounded-2xl bg-white/10 flex items-center justify-center shadow-inner shrink-0 mb-2.5 sm:mb-3 lg:mb-2.5 xl:mb-4">
                  {card.icon}
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="font-heading font-extrabold text-white text-sm sm:text-base lg:text-sm xl:text-xl leading-snug">
                    {card.title}
                  </h3>

                  <p className="font-body text-white/90 text-[11px] xs:text-xs sm:text-xs lg:text-xs xl:text-sm leading-relaxed mt-0.5 sm:mt-1 xl:mt-2">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}