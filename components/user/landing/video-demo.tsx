"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";

// ==========================================
// 1. TYPES & INTERFACES (Backend-Ready)
// ==========================================
export interface VideoDemoProps {
  title?: string;
  description?: string;
  thumbnailSrc?: string;
  videoSrc?: string;
}

// ==========================================
// 2. SUB-COMPONENTS (Atomic Elements)
// ==========================================

// Atom: Background Decorative Cloud
function CloudAccent({
  src,
  alt,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
}) {
  return (
    <div className={`absolute opacity-60 pointer-events-none z-0 ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-auto h-auto object-contain"
      />
    </div>
  );
}

// Molecule: Video Preview Thumbnail with Play Button
function VideoThumbnail({
  thumbnailSrc,
  altText,
  onOpen,
}: {
  thumbnailSrc: string;
  altText: string;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="relative overflow-hidden cursor-pointer bg-white/45 w-full max-w-[280px] xs:max-w-[340px] sm:max-w-[560px] lg:max-w-[420px] xl:max-w-[560px] z-10 transition-transform duration-200 hover:scale-[1.01]"
      style={{
        borderRadius: "90px / 65px",
        boxShadow: "6px 6px 0px 0px #3D2900",
      }}
    >
      <div className="relative w-full aspect-video bg-slate-200">
        <Image src={thumbnailSrc} alt={altText} fill className="object-cover" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-black/50 text-white flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110">
          <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5 sm:ml-1 text-white" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// Molecule: Video Modal / Popup Player
function VideoModal({
  isOpen,
  videoSrc,
  onClose,
}: {
  isOpen: boolean;
  videoSrc: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/95 transition-colors cursor-pointer"
          aria-label="Tutup video"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <video src={videoSrc} controls autoPlay className="w-full h-full object-contain">
            Browser Anda tidak mendukung pemutar video.
          </video>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN ORGANISM COMPONENT
// ==========================================
export default function VideoDemo({
  title = "Merakit Robot Pertama",
  description = "Saksikan keseruan anak-anak belajar merakit robot dengan langkah-langkah yang mudah dipahami, interaktif, dan penuh keceriaan.",
  thumbnailSrc = "/images/foto.jpg",
  videoSrc = "/videos/demo.mp4",
}: VideoDemoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative bg-[#F3EFE4] pt-24 sm:pt-45 pb-10 sm:pb-10 text-[#3D2900] overflow-hidden">
      {/* Decorative Clouds - Awan kiri diturunkan khusus pada ukuran tablet */}
      <CloudAccent
        src="/images/awan3.png"
        alt="Awan Accent Kiri"
        className="top-12 sm:top-20 md:top-20 lg:top-11 -left-16 sm:-left-16 max-w-[180px] sm:max-w-[320px] scale-x-[-1]"
        width={360}
        height={360}
      />
      <CloudAccent
        src="/images/awan3.png"
        alt="Awan Accent Kanan"
        className="top-1 sm:top-3 -right-12 sm:-right-12 max-w-[200px] sm:max-w-[380px]"
        width={360}
        height={360}
      />

      {/* Container utama konten */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Menggunakan padding kiri (lg:pl-16 xl:pl-24) khusus pada ukuran laptop/lg ke atas agar seluruh isi grid bergeser ke kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center lg:pl-20">
          {/* Left Column - Video Preview Container */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <VideoThumbnail
              thumbnailSrc={thumbnailSrc}
              altText={`Video Demo: ${title}`}
              onOpen={() => setIsOpen(true)}
            />
          </div>

          {/* Right Column - Title & Description */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4 text-center lg:text-left xl:pl-6">
            <div className="space-y-1">
              <div className="relative inline-block pb-[calc(1.5rem-3px)] sm:pb-[calc(2rem-3px)]">
                <h2 className="font-heading text-xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-[#3D2900] tracking-tight relative z-10">
                  {title}
                </h2>
                <div className="absolute -bottom-5 sm:-bottom-7 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-0 w-full max-w-[200px] sm:max-w-[320px] pointer-events-none z-0" aria-hidden="true">
                  <svg
                    width="400"
                    height="100"
                    viewBox="0 0 400 100"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                  >
                    <path
                      d="M 30,50 Q 200,25 370,40"
                      stroke="#f0ad4e"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-lg text-[#3D2900]/80 font-normal leading-relaxed max-w-md sm:max-w-lg mx-auto lg:mx-0">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Modal / Popup Video Player */}
      <VideoModal
        isOpen={isOpen}
        videoSrc={videoSrc}
        onClose={() => setIsOpen(false)}
      />
    </section>
  );
}