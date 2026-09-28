"use client";

import React from "react";
import { ShieldCheck, Cpu, Sparkles, BookOpen } from "lucide-react";

export interface InfoCardItem {
  id: string | number;
  title: string;
  description: string;
  icon: React.ReactNode;
  rotation: string; // CSS rotation e.g. '-rotate-3', 'rotate-2'
  translateY: string; // CSS transform translateY alignment offset
}

const defaultCards: InfoCardItem[] = [
  {
    id: 1,
    title: "Aman Untuk Usia 6+",
    description: "Bahan ramah anak, tanpa sudut tajam, & teruji aman.",
    icon: <ShieldCheck className="w-8 h-8 text-white stroke-[2.5]" />,
    rotation: "-rotate-3",
    translateY: "translate-y-4",
  },
  {
    id: 2,
    title: "Modul IoT Interaktif",
    description: "Belajar dasar sensor & teknologi dengan seru.",
    icon: <Cpu className="w-8 h-8 text-white stroke-[2.5]" />,
    rotation: "rotate-2",
    translateY: "-translate-y-2",
  },
  {
    id: 3,
    title: "Mudah Dirakit (DIY)",
    description: "Panduan visual interaktif untuk melatih logika anak.",
    icon: <Sparkles className="w-8 h-8 text-white stroke-[2.5]" />,
    rotation: "-rotate-2",
    translateY: "translate-y-2",
  },
  {
    id: 4,
    title: "Kurikulum Edukatif",
    description: "Materi STEM interaktif pendukung daya pikir anak.",
    icon: <BookOpen className="w-8 h-8 text-white stroke-[2.5]" />,
    rotation: "rotate-3",
    translateY: "-translate-y-1",
  },
];

export interface InfoCardsListProps {
  cards?: InfoCardItem[];
}

export default function InfoCardsList({ cards = defaultCards }: InfoCardsListProps) {
  return (
    <section className="bg-[#2781CD] py-12 sm:py-16 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-stretch pt-4 pb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative rounded-3xl bg-white/20 backdrop-blur-sm px-6 py-8 sm:px-7 sm:py-9 min-h-[260px] sm:min-h-[280px] flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:z-20 ${card.rotation} ${card.translateY}`}
            >
              {/* Garis Aksen Kiri-Atas */}
              <svg
                className="absolute top-2 left-2 w-12 h-12 text-white pointer-events-none"
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
                className="absolute bottom-2 right-2 w-12 h-12 text-white pointer-events-none"
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

              {/* Content */}
              <div className="relative z-8 flex flex-col justify-between h-full">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner shrink-0 mb-4">
                  {card.icon}
                </div>

                <div className="flex-1 flex flex-col justify-start">
                  <h3 className="font-heading font-extrabold text-white text-lg sm:text-xl leading-snug">
                    {card.title}
                  </h3>
                  
                  {/* Jarak/Gap tambahan antara judul & deskripsi via mt-3 sm:mt-4 */}
                  <p className="font-body text-white/90 text-sm leading-relaxed mt-3 sm:mt-5">
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