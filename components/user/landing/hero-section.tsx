"use client";

import Navbar from "@/components/user/navbar";
import HeroRobot from "@/components/user/landing/robot";
import Awan from "@/components/user/landing/awan";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";

const dynamicItems = [
  {
    text: "Usia 6+ Tahun!",
    bg: "bg-[#FFF6A0]", // Kuning Cerah
    textColor: "text-[#3D2900]", // Coklat Tua
  },
  {
    text: "Mudah Dipahami!",
    bg: "bg-[#A3B1FF]", // Ungu Soft
    textColor: "text-[#103B5E]", // Biru Pekat
  },
{
    text: "Kreatif & Interaktif!",
    bg: "bg-[#C9E9F6]", // Soft Cyan
    textColor: "text-[#103B5E]", // Biru Gelap
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentItem = dynamicItems[currentIndex];
    const fullText = currentItem.text;

    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));

        if (displayedText === fullText) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));

        if (displayedText === "") {
          setIsDeleting(false);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % dynamicItems.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentIndex]);

  const currentStyle = dynamicItems[currentIndex];

  return (
    <section className="relative bg-[#6EADDF] pt-4 pb-20 sm:pb-32 lg:pb-48 overflow-hidden">
      {/* Gambar Awan Kiri Atas */}
      <div className="absolute top-4 sm:top-6 lg:top-12 left-0 z-0 w-48 sm:w-72 md:w-96 aspect-square pointer-events-none">
        <Image
          src="/images/awan2.png"
          alt="Dekorasi Awan Kiri Atas"
          fill
          className="object-contain object-top-left opacity-50"
          priority
        />
      </div>

      {/* Gambar Awan Kanan */}
      <div className="absolute top-12 sm:top-18 lg:top-33 right-0 z-0 w-48 sm:w-72 md:w-96 aspect-square pointer-events-none">
        <Image
          src="/images/awan11.png"
          alt="Dekorasi Awan Kanan"
          fill
          className="object-contain object-top-right opacity-50"
          priority
        />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-20 px-4 mb-6 md:mb-10 w-full flex justify-center [&>nav]:!h-[64px] md:[&>nav]:!h-[95px] [&>nav]:!px-4 sm:[&>nav]:!px-8 md:[&>nav]:!px-12 [&>nav]:!mt-2 md:[&>nav]:!mt-4 [&_span]:!text-[22px] [&_span]:sm:!text-2xl [&_span]:md:!text-[32px] [&_span]:!leading-normal [&_img]:!w-7 [&_img]:!h-7 md:[&_img]:!w-auto md:[&_img]:!h-auto">
        <Navbar />
      </header>

      {/* Hero Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pl-8 sm:pl-12 lg:pl-14 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-2 items-center pt-2">
        {/* Left Column: Text & Action */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-4.5 text-left lg:pl-6">
          {/* Judul Utama */}
          <h1 className="relative font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.18] text-white tracking-tight">
            Rakit & Mainkan{" "}
            <span className="inline-block relative w-16 h-16 sm:w-20 sm:h-20 align-middle -mt-10 sm:-mt-16 -ml-2 sm:-ml-4">
              <Image
                src="/images/2.png"
                alt="Aksen Judul"
                fill
                className="object-contain"
                priority
              />
            </span>{" "}
            Robot Impian Anak{" "}
            {/* Badge Teks Dinamis dengan Dot di Sebelah Kiri */}
            <span
              className={`relative inline-flex items-center gap-2 mt-4 sm:mt-6 px-3 py-1 rounded-xl rotate-[-2deg] text-[0.85em] font-extrabold transition-colors duration-500 ease-in-out ${currentStyle.bg} ${currentStyle.textColor}`}
            >
              {/* Lingkaran Kecil (Warna mengikuti teks lewat bg-current) */}
              <span className="w-2.5 h-2.5 rounded-full bg-current shrink-0" />
              
              <span>
                {displayedText}
                <span className="animate-pulse ml-0.5 opacity-80">|</span>
              </span>
            </span>
          </h1>

          <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed max-w-lg font-normal">
            Bantu si kecil belajar coding dan logika teknologi sejak dini melalui kit robotik interaktif yang seru, aman, dan mudah dimainkan.
          </p>

          {/* CTA Buttons */}
          <div className="relative flex flex-col sm:flex-row items-center gap-3 pt-3 w-full sm:w-auto">
           <Link
  href="/product"
  className={`inline-flex items-center justify-center gap-2.5 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-all duration-500 ease-in-out w-full sm:w-auto z-10 ${currentStyle.bg} ${currentStyle.textColor}`}
>
  <span>Jelajahi Mainan Robot</span>
  <ArrowRight className="w-4 h-4 text-current" />
</Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-full border border-white/40 backdrop-blur-sm transition-all w-full sm:w-auto cursor-pointer z-10"
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