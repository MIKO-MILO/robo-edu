"use client";

import Navbar from "@/components/user/navbar";
import HeroRobot from "@/components/user/landing/robot";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";

const dynamicItems = [
  {
    text: "Usia 6+ Tahun!",
    bg: "bg-[#E0F2FE]", // Soft Ice Blue
    textColor: "text-[#0369A1]", // Biru Pekat
  },
  {
    text: "Mudah Dipahami!",
    bg: "bg-[#F0F9FF]", // Ultra Light Ice
    textColor: "text-[#0369A1]", // Biru Pekat
  },
  {
    text: "Kreatif & Interaktif!",
    bg: "bg-[#E0F2FE]", // Soft Ice Blue
    textColor: "text-[#0369A1]", // Biru Pekat
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
    <section className="relative bg-[#97CEF9] pt-4 pb-16 sm:pb-24 lg:pb-25 overflow-hidden min-h-screen flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* DEKORASI AWAN                                                 */}
      {/* ------------------------------------------------------------- */}

      {/* Awan Kiri Utama (Besar) - xl:top-28 untuk menaikkan posisi di 1440px */}
      <div className="absolute top-[48%] xs:top-[44%] sm:top-[40%] lg:top-32 xl:top-28 2xl:top-32 left-0 z-0 w-40 max-[360px]:w-36 xs:w-52 sm:w-72 md:w-80 lg:w-72 xl:w-[24rem] aspect-square pointer-events-none opacity-80 transition-all duration-300">
        <Image
          src="/images/awan.webp"
          alt="Dekorasi Awan Kiri"
          fill
          className="object-contain object-left-top"
          priority
        />
      </div>

      {/* Awan Kiri Kecil (Bawah) */}
      <div className="absolute top-[62%] sm:top-[58%] md:top-[56%] lg:top-[22rem] xl:top-[26rem] 2xl:top-[26rem] left-0 z-0 w-24 sm:w-40 md:w-44 lg:w-40 xl:w-44 aspect-square pointer-events-none opacity-60 transition-all duration-300">
        <Image
          src="/images/awan.webp"
          alt="Dekorasi Awan Kiri Kecil"
          fill
          className="object-contain object-left-top"
        />
      </div>

      {/* Awan Kanan Utama (Besar) */}
      <div className="absolute top-[52%] xs:top-[46%] sm:top-[42%] lg:top-36 xl:top-40 2xl:top-44 right-0 z-0 w-40 max-[360px]:w-36 xs:w-52 sm:w-72 md:w-80 lg:w-72 xl:w-[24rem] aspect-square pointer-events-none opacity-80 transition-all duration-300">
        <Image
          src="/images/awan.webp"
          alt="Dekorasi Awan Kanan"
          fill
          className="object-contain object-right-top -scale-x-100"
          priority
        />
      </div>

      {/* Awan Kanan Kecil (Bawah) */}
      <div className="absolute top-[65%] sm:top-[60%] md:top-[58%] lg:top-[23rem] xl:top-[27rem] 2xl:top-[27rem] right-0 z-0 w-24 sm:w-40 md:w-44 lg:w-40 xl:w-44 aspect-square pointer-events-none opacity-60 transition-all duration-300">
        <Image
          src="/images/awan.webp"
          alt="Dekorasi Awan Kanan Kecil"
          fill
          className="object-contain object-right-top -scale-x-100"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* HEADER / NAVIGATION                                           */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-20 px-4 mb-2 sm:mb-6 md:mb-8 w-full flex justify-center [&>nav]:!h-[56px] sm:[&>nav]:!h-[64px] md:[&>nav]:!h-[80px] lg:[&>nav]:!h-[95px] [&>nav]:!px-4 sm:[&>nav]:!px-8 md:[&>nav]:!px-12 [&>nav]:!mt-2 md:[&>nav]:!mt-4 [&_span]:!text-lg sm:[&_span]:!text-2xl md:[&_span]:!text-[28px] lg:[&_span]:!text-[32px] [&_span]:!leading-normal [&_img]:!w-6 sm:[&_img]:!w-7 md:[&_img]:!w-auto [&_img]:!h-6 sm:[&_img]:!h-7 md:[&_img]:!h-auto">
        <Navbar />
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN HERO CONTENT                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center my-auto">
        
        {/* LEFT COLUMN: Judul, Deskripsi & Tombol */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0 lg:pl-10">
          
          {/* Judul Utama */}
          <h1 className="relative font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-5xl font-bold leading-tight sm:leading-[1.25] lg:leading-[1.18] text-[#0F2C59] tracking-tight max-w-xl lg:max-w-none">
            <span className="block lg:inline">
              Rakit & Mainkan{" "}
              <span className="inline-block relative w-8 h-8 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 align-middle -mt-3 sm:-mt-5 -ml-1 sm:-ml-2">
                <Image
                  src="/images/line.webp"
                  alt="Aksen Judul"
                  fill
                  className="object-contain"
                  priority
                />
              </span>
            </span>{" "}
            <span className="block mt-1 sm:mt-2 lg:mt-0 lg:inline">
              Robot Impian Anak
            </span>{" "}
            
            {/* Badge Teks Dinamis */}
            <span className="block mt-3 sm:mt-4 lg:mt-4">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl rotate-[-2deg] text-sm sm:text-lg lg:text-xl xl:text-2xl font-extrabold transition-colors duration-500 ease-in-out shadow-xs ${currentStyle.bg} ${currentStyle.textColor}`}
              >
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-current shrink-0" />
                <span>
                  {displayedText}
                  <span className="animate-pulse ml-0.5 opacity-80">|</span>
                </span>
              </span>
            </span>
          </h1>

          {/* Subteks Deskripsi */}
          <p className="font-body text-xs sm:text-base lg:text-base xl:text-lg text-[#0F2C59]/85 leading-relaxed max-w-md sm:max-w-xl font-normal px-2 sm:px-0">
            Bantu si kecil belajar coding dan logika teknologi sejak dini melalui kit robotik interaktif yang seru, aman, dan mudah dimainkan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1 sm:pt-2 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/product"
              className={`inline-flex items-center justify-center gap-2.5 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-md sm:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out w-full sm:w-auto ${currentStyle.bg} ${currentStyle.textColor}`}
            >
              <span>Jelajahi Mainan Robot</span>
              <ArrowRight className="w-4 h-4 text-current" />
            </Link>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 bg-white/40 hover:bg-white/60 text-[#0F2C59] font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full border border-white/60 backdrop-blur-md shadow-sm transition-all w-full sm:w-auto cursor-pointer"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/80 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0F2C59] fill-[#0F2C59] ml-0.5" />
              </div>
              <span>Tonton Demo</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Robot */}
        <div className="lg:col-span-5 flex justify-center items-center relative w-full mt-4 sm:mt-6 lg:mt-0 z-10">
          <HeroRobot />
        </div>

      </div>
    </section>
  );
}