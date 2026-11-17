"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { ChevronDown, HelpCircle, type LucideIcon } from "lucide-react";

// ==========================================
// 1. TYPE DEFINITIONS & CONFIGS
// ==========================================
export interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

export interface PromoBannerData {
  titlePrefix: string;
  highlightText: string;
  description: string;
  thumbnails: Array<{
    id: string;
    src: string;
    alt: string;
    className?: string;
  }>;
}

export interface FAQProps {
  items?: FAQItemData[];
  title?: string;
  description?: string;
  promoData?: PromoBannerData;
}

const DEFAULT_FAQS: FAQItemData[] = [
  {
    id: "faq-1",
    question: "Apakah mainan IoT RoboEdu aman untuk anak-anak?",
    answer:
      "Sangat aman! Semua komponen kit RoboEdu menggunakan bahan nonsilikon berkualitas tinggi tanpa sudut tajam, serta tidak memerlukan proses solder.",
  },
  {
    id: "faq-2",
    question: "Berapa usia minimal anak untuk memainkan Kit RoboEdu?",
    answer:
      "Kit mainan IoT ini dirancang untuk anak usia 6 tahun ke atas dengan modul rakitan interaktif yang ramah anak.",
  },
  {
    id: "faq-3",
    question: "Apakah kit ini memerlukan aplikasi smartphone?",
    answer:
      "Sebagian besar modul langsung beroperasi saat dinyalakan. Namun untuk fitur kontrol pintar IoT, Anda dapat mengunduh aplikasi gratis RoboEdu di Android dan iOS.",
  },
  {
    id: "faq-4",
    question: "Bagaimana jika ada komponen robot yang hilang atau rusak?",
    answer:
      "Kami menyediakan garansi penggantian suku cadang selama 30 hari serta menjual komponen cadangan terpisah.",
  },
  {
    id: "faq-5",
    question: "Berapa lama estimasi pengiriman paket RoboEdu?",
    answer:
      "Pengiriman diproses dalam 1x24 jam. Estimasi pengiriman untuk pulau Jawa adalah 1-3 hari kerja, sedangkan luar pulau Jawa 3-5 hari kerja.",
  },
  {
    id: "faq-6",
    question: "Apakah ada buku panduan dan panduan video perakitan?",
    answer:
      "Ya, setiap pembelian paket RoboEdu dilengkapi buku panduan cetak berwarna dan akses ke pustaka video panduan perakitan langkah demi langkah.",
  },
];

const DEFAULT_PROMO_DATA: PromoBannerData = {
  titlePrefix: "Dapatkan Mainan IoT Edukatif RoboEdu",
  highlightText: "Sekarang!",
  description: "Dapatkan paket lengkapnya hari ini dan mulai keseruan merakit robot!",
  thumbnails: [
    {
      id: "thumb-1",
      src: "/images/foto.jpg",
      alt: "Anak bermain robot",
    },
    {
      id: "thumb-2",
      src: "/images/foto4.jpg",
      alt: "Merakit robot",
    },
    {
      id: "thumb-3",
      src: "/images/foto3.jpg",
      alt: "Belajar koding",
    },
    {
      id: "thumb-4",
      src: "/images/foto2.jpg",
      alt: "Robot edukasi",
    },
  ],
};

// ==========================================
// 2. ATOMIC SUB-COMPONENTS
// ==========================================

function Badge({ icon: Icon, label }: { icon?: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/10 text-card font-medium text-xs mb-3 backdrop-blur-sm border border-card/20">
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItemData;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = useId();
  const buttonId = useId();

  return (
    <div className="bg-card rounded-md border-none overflow-hidden transition-all duration-200">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left gap-3 hover:bg-muted/50 transition-colors cursor-pointer group"
      >
        <span className="font-heading font-semibold text-xs sm:text-sm text-primary-900 group-hover:text-primary-700 transition-colors">
          {item.question}
        </span>

        {/* Logika panah dibalik: isOpen (terbuka) jadi rotate-180 (menghadap atas), tertutup jadi 0 (menghadap bawah) */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isOpen
              ? "rotate-180 bg-primary-700 text-card"
              : "rotate-0 bg-muted text-foreground"
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
        </div>
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-foreground/80 leading-relaxed border-t border-border/10">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
} 

function PromoThumbnail({
  src,
  alt,
  customClass = "",
}: {
  src: string;
  alt: string;
  customClass?: string;
}) {
  return (
    <div className={`relative w-full flex justify-center ${customClass}`}>
      <div className="relative w-[90vw] h-[90vw] sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 overflow-hidden rounded-[2.2rem] sm:rounded-[2rem] md:rounded-[2.2rem] lg:rounded-[2.5rem] transition-all duration-300 shadow-md">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 639px) 90vw, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

// Organism: Promo Banner
function PromoBanner({ data = DEFAULT_PROMO_DATA }: { data?: PromoBannerData }) {
  const leftTop = data.thumbnails[0];
  const leftBottom = data.thumbnails[1];
  const rightTop = data.thumbnails[2];
  const rightBottom = data.thumbnails[3];

  return (
    <div className="relative w-full h-auto sm:h-[420px] md:h-[500px] lg:h-[580px] xl:h-[620px] bg-background overflow-visible z-10">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex flex-col sm:flex-row items-center justify-between">
        
{/* Header Text & Description (Ditambahkan margin bawah yang lebih besar pada paragraf deskripsi) */}
        <div className="relative sm:absolute top-0 left-0 sm:left-1/2 transform-none sm:-translate-x-1/2 pt-5 sm:pt-8 md:pt-10 lg:pt-12 z-20 w-full max-w-3xl px-4 pointer-events-none flex flex-col items-center justify-center text-center">
          
          <h1 className="font-heading tracking-tight leading-snug sm:leading-none flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 text-center sm:whitespace-nowrap mb-2 sm:mb-3 mt-6">
            <span className="font-bold text-xl sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl whitespace-normal sm:whitespace-nowrap px-4 sm:px-0 text-primary-700">
              {data.titlePrefix}
            </span>
          </h1>

          <p className="font-body text-xs sm:text-sm md:text-base text-foreground/60 font-medium max-w-lg mx-auto leading-relaxed px-4 mb-6 sm:mb-8 md:mb-10">
            {data.description}
          </p>
        </div>

        {/* Gambar Kiri */}
        <div className="w-full sm:w-auto flex flex-col items-center gap-6 sm:gap-5 md:gap-8 lg:gap-10 z-10 sm:translate-y-32 md:translate-y-40 lg:translate-y-44 sm:translate-x-2 md:translate-x-4 lg:translate-x-6 xl:translate-x-8">
          {leftTop && (
            <PromoThumbnail
              key={leftTop.id}
              src={leftTop.src}
              alt={leftTop.alt}
              customClass="sm:translate-x-4 md:translate-x-6 lg:translate-x-8"
            />
          )}
          {leftBottom && (
            <PromoThumbnail
              key={leftBottom.id}
              src={leftBottom.src}
              alt={leftBottom.alt}
              customClass="sm:-translate-x-4 md:-translate-x-6 lg:-translate-x-8"
            />
          )}
        </div>

        {/* Hero Center Image (robo.webp dengan sedikit geseran ke kanan) */}
        <div className="absolute -bottom-14 sm:-bottom-18 md:-bottom-24 lg:-bottom-32 left-1/2 -translate-x-[calc(50%-12px)] z-[70] hidden sm:flex flex-col items-center justify-end w-full max-w-xs md:max-w-md lg:max-w-xl pointer-events-none">
          <div className="w-64 sm:w-80 md:w-[26rem] lg:w-[500px] xl:w-[550px] relative z-10 aspect-square">
            <Image
              src="/images/robo.webp"
              alt="Robot RoboEdu"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="w-[70%] sm:w-[60%] h-8 sm:h-10 md:h-12 bg-black/25 rounded-[100%] blur-md -mt-6 sm:-mt-8 md:-mt-10 z-0"></div>
        </div>

        {/* Gambar Kanan */}
        <div className="w-full sm:w-auto flex flex-col items-center gap-6 sm:gap-5 md:gap-8 lg:gap-10 z-10 mt-6 sm:mt-0 sm:translate-y-32 md:translate-y-40 lg:translate-y-44 sm:translate-x-0 md:translate-x-0 lg:translate-x-0 xl:translate-x-0">
          {rightTop && (
            <PromoThumbnail
              key={rightTop.id}
              src={rightTop.src}
              alt={rightTop.alt}
              customClass="sm:-translate-x-8 md:-translate-x-10 lg:-translate-x-12"
            />
          )}
          {rightBottom && (
            <PromoThumbnail
              key={rightBottom.id}
              src={rightBottom.src}
              alt={rightBottom.alt}
              customClass="sm:translate-x-4 md:translate-x-6 lg:translate-x-8"
            />
          )}
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN COMPONENT CONTAINER
// ==========================================
export default function FAQ({
  items = DEFAULT_FAQS,
  title = "Pertanyaan yang Sering Diajukan",
  description = "Punya pertanyaan mengenai mainan IoT RoboEdu? Temukan jawaban lengkap mengenai produk, usia pengguna, hingga pengiriman di sini.",
  promoData = DEFAULT_PROMO_DATA,
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative z-20 bg-primary text-card pb-20 sm:pb-24 overflow-hidden">
      <PromoBanner data={promoData} />

      {/* SVG Shape Divider */}
      <div className="relative w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-14 md:h-16 lg:h-20 text-background"
          fill="currentColor"
        >
          <path d="M0,120 Q720,-10 1440,120 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Accordion Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 pt-12 sm:pt-36 md:pt-44 lg:pt-52">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Header Column */}
          <div className="lg:col-span-5 text-left lg:pt-4 mb-6 lg:mb-0">
            <Badge icon={HelpCircle} label="Pusat Bantuan" />
            <h2 className="font-heading text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-semibold text-card tracking-tight leading-tight">
              {title}
            </h2>
            
            {/* Teks Deskripsi */}
            {description && (
              <p className="mt-4 text-xs sm:text-sm md:text-base text-card/90 leading-relaxed font-normal">
                {description}
              </p>
            )}
            
            {/* Gambar Panah Penunjuk */}
            <div className="pt-8 sm:pt-10 md:pt-12 hidden lg:flex justify-start">
              <div className="w-48 sm:w-56 md:w-64 h-auto translate-x-6">
                <Image
                  src="/images/arrow1.png"
                  alt="Panah penunjuk"
                  width={300}
                  height={150}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-7 space-y-3.5">
            {items.map((item, index) => (
              <AccordionItem
                key={item.id || `faq-${index}`}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}