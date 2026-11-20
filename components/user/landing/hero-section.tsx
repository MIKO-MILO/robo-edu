"use client";

import HeroRobot from "@/components/user/landing/robot";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";

const dynamicItems = [
    {
        text: "Usia 6+ Tahun!",
        bg: "bg-primary-100", // Soft Ice Blue
        textColor: "text-primary-700", // Biru Pekat
    },
    {
        text: "Mudah Dipahami!",
        bg: "bg-primary-100", // Ultra Light Ice
        textColor: "text-primary-700", // Biru Pekat
    },
    {
        text: "Kreatif & Interaktif!",
        bg: "bg-primary-100", // Soft Ice Blue
        textColor: "text-primary-700", // Biru Pekat
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
        <section className="relative bg-landing-sky pt-36 sm:pt-40 lg:pt-44 pb-16 sm:pb-24 lg:pb-50 min-h-screen flex flex-col">
            {/* Awan decorations wrapped in overflow-hidden so they don't spill outside section */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {/* ------------------------------------------------------------- */}
                {/* DEKORASI AWAN */}
                {/* ------------------------------------------------------------- */}

                {/* Awan Kiri Utama (Atas) */}
                <div className="absolute top-[38%] xs:top-[34%] sm:top-[30%] lg:top-20 xl:top-16 2xl:top-20 left-0 z-0 w-48 max-[360px]:w-40 xs:w-60 sm:w-80 md:w-96 lg:w-88 xl:w-[28rem] aspect-square pointer-events-none opacity-80 transition-all duration-300">
                    <Image
                        src="/images/awan.webp"
                        alt="Dekorasi Awan Kiri"
                        fill
                        className="object-contain object-left-top"
                        priority
                    />
                </div>

                {/* Awan Kiri Bawah - Diperbesar lagi dikit & dinaikkan posisinya */}
                <div className="absolute top-[59%] sm:top-[55%] md:top-[53%] lg:top-[21rem] xl:top-[24rem] 2xl:top-[24rem] left-0 z-0 w-40 sm:w-56 md:w-60 lg:w-56 xl:w-60 aspect-square pointer-events-none opacity-60 transition-all duration-300">
                    <Image
                        src="/images/awan.webp"
                        alt="Dekorasi Awan Kiri Bawah"
                        fill
                        className="object-contain object-left-top"
                    />
                </div>

                {/* Awan Kanan Utama (Atas) */}
                <div className="absolute top-[36%] xs:top-[30%] sm:top-[28%] lg:top-16 xl:top-20 2xl:top-24 right-0 z-0 w-48 max-[360px]:w-40 xs:w-60 sm:w-80 md:w-96 lg:w-88 xl:w-[28rem] aspect-square pointer-events-none opacity-80 transition-all duration-300">
                    <Image
                        src="/images/awan.webp"
                        alt="Dekorasi Awan Kanan"
                        fill
                        className="object-contain object-right-top -scale-x-100"
                        priority
                    />
                </div>

                {/* Awan Kanan Bawah - Ukuran & posisi disamakan dengan kiri bawah */}
                <div className="absolute top-[59%] sm:top-[55%] md:top-[53%] lg:top-[21rem] xl:top-[24rem] 2xl:top-[24rem] right-0 z-0 w-40 sm:w-56 md:w-60 lg:w-56 xl:w-60 aspect-square pointer-events-none opacity-60 transition-all duration-300">
                    <Image
                        src="/images/awan.webp"
                        alt="Dekorasi Awan Kanan Bawah"
                        fill
                        className="object-contain object-right-top -scale-x-100"
                    />
                </div>
            </div>{/* end overflow-hidden awan wrapper */}

            {/* ------------------------------------------------------------- */}
            {/* MAIN HERO CONTENT */}
            {/* ------------------------------------------------------------- */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center my-auto">

                {/* LEFT COLUMN: Judul, Deskripsi & Tombol */}
                <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 sm:space-y-6 pt-6 sm:pt-8 lg:pt-0 lg:pl-10">

                    {/* Judul Utama */}
                    <h1 className="relative font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-5xl font-bold leading-tight sm:leading-[1.25] lg:leading-[1.18] text-landing-navy tracking-tight max-w-xl lg:max-w-none">
                        <span className="block lg:inline">
                            Rakit & Mainkan{""}
                            {/* line.webp diperbesar sedikit dan dinaikkan ke atas menggunakan -mt dan ukuran w/h yang disesuaikan */}
                           <span className="inline-block relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 align-middle -mt-10 sm:-mt-16 lg:-mt-20 -ml-1 sm:-ml-2">
                            <Image
                                src="/images/line.webp"
                                alt="Aksen Judul"
                                fill
                                className="object-contain"
                                priority
                            />
                        </span>
                        </span>{""}
                        <span className="block mt-1 sm:mt-2 lg:mt-0 lg:inline">
                            Robot Impian Anak
                        </span>{""}

                        {/* Badge Teks Dinamis */}
                        <span className="block mt-3 sm:mt-4 lg:mt-4">
                            <span
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl rotate-[-2deg] text-sm sm:text-lg lg:text-xl xl:text-2xl font-extrabold transition-colors duration-500 ease-in-out ${currentStyle.bg} ${currentStyle.textColor}`}
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
                    <p className="font-body text-xs sm:text-base lg:text-base xl:text-lg text-landing-navy/85 leading-relaxed max-w-md sm:max-w-xl font-normal px-2 sm:px-0">
                        Bantu si kecil belajar coding dan logika teknologi sejak dini melalui kit robotik interaktif yang seru, aman, dan mudah dimainkan.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1 sm:pt-2 w-full sm:w-auto px-4 sm:px-0">
                        <Link
                            href="/product"
                            className={`inline-flex items-center justify-center gap-2.5 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full hover:scale-105 transition-all duration-300 ease-in-out w-full sm:w-auto ${currentStyle.bg} ${currentStyle.textColor}`}
                        >
                            <span>Jelajahi Mainan Robot</span>
                            <ArrowRight className="w-4 h-4 text-current" />
                        </Link>

                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2.5 bg-white/40 hover:bg-white/60 text-landing-navy font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full border border-white/60 backdrop-blur-md transition-all w-full sm:w-auto cursor-pointer"
                        >
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/80 flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-landing-navy fill-landing-navy ml-0.5" />
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