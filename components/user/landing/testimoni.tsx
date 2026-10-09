"use client";

import { useState } from"react";
import Image from"next/image";
import { Star, Quote, ChevronLeft, ChevronRight } from"lucide-react";

// ==========================================
// 1. TYPES & INTERFACES (Backend-Ready)
// ==========================================
export interface Testimonial {
 id: number;
 name: string;
 role: string;
 childAge: string;
 avatar: string;
 rating: number;
 comment: string;
 accentBg: string;
 innerBorderColor: string;
 quoteColor: string;
}

export interface TestimoniProps {
 testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
 {
 id: 1,
 name:"Bunda Siska Utami",
 role:"Ibu Rumah Tangga",
 childAge:"Anak 7 Tahun",
 avatar:"/images/11.png",
 rating: 5,
 comment:
"Luar biasa! Anak saya yang tadinya kecanduan game HP, sekarang malah asyik merakit robot dan mencoba misi-misi logika di buku panduannya. Pilihan terbaik untuk belajar STEM!",
 accentBg:"bg-[#FFF9D2]",
 innerBorderColor:"border-[#E2C044]",
 quoteColor:"text-[#E2C044]",
 },
 {
 id: 2,
 name:"Pak Hendra Wijaya",
 role:"Guru Sekolah Dasar",
 childAge:"Anak 9 Tahun",
 avatar:"/images/22.png",
 rating: 5,
 comment:
"Komponennya sangat aman dan presisi. Konsep belajar sambil bermainnya pas sekali, bahasa di buku panduan sangat ramah untuk pemula.",
 accentBg:"bg-[#E6F4FF]",
 innerBorderColor:"border-[#85BDE6]",
 quoteColor:"text-[#85BDE6]",
 },
 {
 id: 3,
 name:"Dr. Amanda Putri",
 role:"Orang Tua & Pengamat",
 childAge:"Anak 11 Tahun",
 avatar:"/images/3.png",
 rating: 5,
 comment:
"Maskot interaktifnya buat anak betah belajar jam-jaman. Logika pemrogramannya disajikan intuitif dan bertahap. Sangat recommended!",
 accentBg:"bg-[#EAE4FF]",
 innerBorderColor:"border-[#A090E0]",
 quoteColor:"text-[#A090E0]",
 },
 {
 id: 4,
 name:"Ibu Rina Marlina",
 role:"Orang Tua",
 childAge:"Anak 8 Tahun",
 avatar:"/images/11.png",
 rating: 5,
 comment:
"Sangat membantu tumbuh kembang anak dalam berfikir kritis. Materi pembelajaran mudah dipahami dan sangat interaktif!",
 accentBg:"bg-[#FFEAD5]",
 innerBorderColor:"border-[#E8A36E]",
 quoteColor:"text-[#E8A36E]",
 },
];

// ==========================================
// 2. SUB-COMPONENT (Internal Helper)
// ==========================================
function TestimonialCard({ item }: { item: Testimonial }) {
 return (
 <article className="relative flex flex-col group w-full">
 <div
 className={`relative rounded-[24px] sm:rounded-[32px] p-3.5 xs:p-4 sm:p-6 ${item.accentBg} transition-all duration-200 group-hover:-translate-y-1 flex flex-col justify-between h-full min-h-[200px] xs:min-h-[220px] sm:min-h-[260px] lg:min-h-[280px] border border-white/50 backdrop-blur-sm`}
 >
 {/* Garis Dalam (Inner Border Utama) */}
 <div
 className={`absolute inset-2 rounded-[18px] sm:rounded-[24px] border-2 ${item.innerBorderColor} pointer-events-none z-0`}
 aria-hidden="true"
 />

 {/* Ikon Quote Buka */}
 <div
 className={`absolute -top-3 left-4 xs:left-6 ${item.accentBg} ${item.quoteColor} p-1 rounded-full z-10 flex items-center justify-center `}
 aria-hidden="true"
 >
 <Quote className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 fill-current rotate-180" />
 </div>

 {/* Content Container */}
 <div className="relative z-10 flex flex-col justify-between h-full pt-1 sm:pt-2">
 {/* Header Card */}
 <div className="flex items-center gap-2.5 xs:gap-3 pt-1 mb-2 sm:mb-3">
 <div className="relative w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full bg-[#2781CD] overflow-hidden shrink-0 flex items-center justify-center border border-border/10">
 <Image
 src={item.avatar}
 alt={`Avatar ${item.name}`}
 width={44}
 height={44}
 className="object-cover"
 />
 </div>
 <div className="overflow-hidden">
 <h3 className="font-heading text-xs xs:text-sm sm:text-base font-extrabold text-foreground leading-tight truncate">
 {item.name}
 </h3>
 <p className="text-[10px] xs:text-[11px] sm:text-xs font-semibold text-foreground/70 truncate mt-0.5">
 {item.role} • {item.childAge}
 </p>
 </div>
 </div>

 {/* Isi Komentar */}
 <blockquote className="font-body text-[11px] xs:text-xs sm:text-sm text-foreground leading-relaxed font-medium mb-2.5 sm:mb-4 line-clamp-4">
 &ldquo;{item.comment}&rdquo;
 </blockquote>

 {/* Rating Bintang */}
 <div className="flex items-center justify-end border-t border-border/10 pt-2 sm:pt-3">
 <div className="flex items-center gap-0.5 xs:gap-1" aria-label={`Rating ${item.rating} dari 5 bintang`}>
 {[...Array(item.rating)].map((_, i) => (
 <Star key={i} className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 fill-[#FFC107] text-[#FFC107]" aria-hidden="true" />
 ))}
 </div>
 </div>
 </div>

 {/* Ikon Quote Tutup */}
 <div
 className={`absolute -bottom-3 right-4 xs:right-6 ${item.accentBg} ${item.quoteColor} p-1 rounded-full z-10 flex items-center justify-center `}
 aria-hidden="true"
 >
 <Quote className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 fill-current" />
 </div>

 {/* Ekor Chat Bubble */}
 <div className="absolute -bottom-5 left-6 xs:left-8 w-8 h-8 xs:w-10 xs:h-10 pointer-events-none overflow-hidden z-10 sm:-bottom-10 sm:w-14 sm:h-14" aria-hidden="true">
 <div className={`w-8 h-8 xs:w-10 xs:h-10 sm:w-14 sm:h-14 ${item.accentBg} -rotate-45 origin-top-left translate-x-1.5 xs:translate-x-2 sm:translate-x-3`} />
 <div className={`absolute top-0.5 left-1 xs:left-1.5 sm:left-2 w-7 xs:w-9 sm:w-12 h-7 xs:h-9 sm:h-12 border-l-2 border-b-2 ${item.innerBorderColor} -rotate-45 origin-top-left translate-x-1.5 xs:translate-x-2 sm:translate-x-3`} />
 </div>
 </div>
 </article>
 );
}

// ==========================================
// 3. MAIN COMPONENT CONTAINER
// ==========================================
export default function Testimoni({ testimonials = DEFAULT_TESTIMONIALS }: TestimoniProps) {
 const [startIndex, setstartIndex] = useState(0);

 if (!testimonials || testimonials.length === 0) {
 return null;
 }

 const handlePrev = () => {
 setstartIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
 };

 const handleNext = () => {
 setstartIndex((prev) => (prev + 1) % testimonials.length);
 };

 const visibleTestimonials = [
 testimonials[startIndex],
 testimonials[(startIndex + 1) % testimonials.length],
 testimonials[(startIndex + 2) % testimonials.length],
 ];

 const tabletTestimonials = [
 testimonials[startIndex],
 testimonials[(startIndex + 1) % testimonials.length],
 ];

 return (
 <section className="relative text-foreground pb-28 sm:pb-44 lg:pb-52 pt-10 sm:pt-20 lg:pt-24 overflow-hidden">
 
 {/* Background Sticky Parallax / Fixed hanya di section ini */}
 <div 
 className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
 style={{ backgroundImage:"url('/images/foto3.jpg')" }}
 >
 {/* Layer overlay #2781CD dengan transparansi */}
 <div className="absolute inset-0 bg-[#2781CD]/78" />
 </div>

 {/* Lengkungan Atas */}
 <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none" aria-hidden="true">
 {/* Mobile Kecil (320px) - 4 Lengkungan */}
 <svg
 className="block sm:hidden relative w-full h-8 text-background"
 viewBox="0 0 1200 80"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="currentColor"
 d="M0,0 L0,80 
 Q150,10 300,80 
 Q450,10 600,80 
 Q750,10 900,80 
 Q1050,10 1200,80 
 L1200,0 Z"
 />
 </svg>

 {/* Mobile/Tablet (SM - MD) - 6 Lengkungan */}
 <svg
 className="hidden sm:block lg:hidden relative w-full h-10 text-background"
 viewBox="0 0 1200 80"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="currentColor"
 d="M0,0 L0,80 
 Q100,10 200,80 
 Q300,10 400,80 
 Q500,10 600,80 
 Q700,10 800,80 
 Q900,10 1000,80 
 Q1100,10 1200,80 
 L1200,0 Z"
 />
 </svg>

 <svg
 className="hidden lg:block relative w-full h-12 lg:h-16 text-background"
 viewBox="0 0 1200 80"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="currentColor"
 d="M0,0 L0,80 
 Q60,20 120,80 
 Q180,20 240,80 
 Q300,20 360,80 
 Q420,20 480,80 
 Q540,20 600,80 
 Q660,20 720,80 
 Q780,20 840,80 
 Q900,20 960,80 
 Q1020,20 1080,80 
 Q1140,20 1200,80 
 L1200,0 Z"
 />
 </svg>
 </div>

 {/* Bagian kontainer utama */}
 <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 relative z-10 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-8">
 {/* Header Section */}
 <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-14 lg:mb-16">
 <h2 className="font-heading text-xl xs:text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight pt-5 sm:pt-7 drop-shadow-md">
 TESTIMONI
 </h2>

 <p className="font-body text-xs xs:text-sm sm:text-base lg:text-lg text-white font-medium mt-2 sm:mt-4 px-1 xs:px-2 drop-shadow-sm">
 Lebih dari <strong>10.000+ anak Indonesia</strong> sudah membuktikan asyiknya belajar koding dan logika sejak dini. Yuk, dengar cerita mereka! 
 </p>
 </div>

 {/* Carousel Layout dengan Tombol Navigasi */}
 <div className="flex items-center justify-between gap-1 sm:gap-4 lg:gap-6">
 <button
 onClick={handlePrev}
 aria-label="Testimoni sebelumnya"
 className="shrink-0 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#FFF37E] text-foreground flex items-center justify-center transition-all duration-200 hover:bg-[#FFE838] hover:scale-110 active:scale-95 z-30 cursor-pointer"
 >
 <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 stroke-[3]" aria-hidden="true" />
 </button>

 <div className="w-full py-2 sm:py-4 px-0.5 xs:px-1 sm:px-0">
 {/* Tampilan Desktop / Laptop (lg ke atas): 3 Kolom */}
 <div className="hidden lg:grid lg:grid-cols-3 gap-8">
 {visibleTestimonials.map((item, idx) => (
 <TestimonialCard key={`${item.id}-${idx}`} item={item} />
 ))}
 </div>

 {/* Tampilan Tablet (md sampai < lg): 2 Kolom */}
 <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-6">
 {tabletTestimonials.map((item, idx) => (
 <TestimonialCard key={`${item.id}-tablet-${idx}`} item={item} />
 ))}
 </div>

 {/* Tampilan Mobile (< md): 1 Kolom */}
 <div className="flex md:hidden justify-center w-full">
 <div className="w-full max-w-[280px] xs:max-w-sm">
 <TestimonialCard item={testimonials[startIndex]} />
 </div>
 </div>
 </div>

 <button
 onClick={handleNext}
 aria-label="Testimoni selanjutnya"
 className="shrink-0 w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-[#FFF37E] text-foreground flex items-center justify-center transition-all duration-200 hover:bg-[#FFE838] hover:scale-110 active:scale-95 z-30 cursor-pointer"
 >
 <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 stroke-[3]" aria-hidden="true" />
 </button>
 </div>
 </div>

 {/* Bagian Bawah: Bayangan Gelap Harmonis */}
 <div className="absolute bottom-0 left-0 right-0 w-full overflow-visible leading-none z-20 pointer-events-none" aria-hidden="true">
 {/* Definisikan Gradasi yang Lebih Luas/Lebar */}
 <svg width="0" height="0" className="absolute block">
 <defs>
 {/* Gradasi layer tengah: Penyebaran transisi dibuat luas dari ujung ke ujung */}
 <linearGradient id="largeShadowFade" x1="0%" y1="0%" x2="100%" y2="0%">
 <stop offset="0%" stopColor="#2563EB" stopOpacity="0.05" />
 <stop offset="30%" stopColor="#1D4ED8" stopOpacity="0.3" />
 <stop offset="70%" stopColor="#1E3A8A" stopOpacity="0.65" />
 <stop offset="100%" stopColor="#172554" stopOpacity="0.85" />
 </linearGradient>

 {/* Gradasi penyebar untuk layer paling belakang agar area bayangan lebih tinggi */}
 <linearGradient id="largeBaseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
 <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
 <stop offset="50%" stopColor="#2563EB" stopOpacity="0.3" />
 <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.5" />
 </linearGradient>
 </defs>
 </svg>

 {/* LAYER 1: Bayangan Paling Belakang (Dinaikkan Lebih Tinggi Agar Bayangan Tampak Lebih Besar) */}
 <svg
 className="absolute bottom-0 left-0 right-0 block w-full h-20 sm:h-32 lg:h-44 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16 z-10 overflow-visible"
 viewBox="0 0 1440 120"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="url(#largeBaseGlow)"
 d="M0,32 C320,96 420,96 720,64 C1020,32 1120,32 1440,64 L1440,120 L0,120 Z"
 />
 </svg>

 {/* LAYER 2: Bayangan Tengah dengan Area Gradasi Lebih Luas */}
 <svg
 className="absolute bottom-0 left-0 right-0 block w-full h-18 sm:h-28 lg:h-40 -translate-y-4 sm:-translate-y-7 lg:-translate-y-10 z-15 overflow-visible"
 viewBox="0 0 1440 120"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="url(#largeShadowFade)"
 d="M0,32 C320,96 420,96 720,64 C1020,32 1220,20 1440,45 L1440,120 L0,120 Z"
 />
 </svg>

 {/* LAYER 3: Lengkungan Utama Paling Depan (#F3EFE4) */}
 <svg
 className="relative block w-full h-16 sm:h-24 lg:h-36 text-background z-20 overflow-visible"
 viewBox="0 0 1440 120"
 preserveAspectRatio="none"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path
 fill="currentColor"
 d="M0,32 C320,96 420,96 720,64 C1020,32 1120,32 1440,64 L1440,120 L0,120 Z"
 />
 </svg>
 </div>
 </section>
 );
}