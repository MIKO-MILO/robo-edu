"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { ChevronDown, HelpCircle, type LucideIcon } from "lucide-react";
import HeroRobot from "./robot";

// ==========================================
// 1. TYPE DEFINITIONS & CONFIGS (Backend-Ready)
// ==========================================
export interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

export interface PromoBannerData {
  title: string;
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
    question: "Apakah anak yang belum pernah belajar coding bisa memainkannya?",
    answer:
      "Tentu saja! RoboEdu dirancang khusus untuk pemula tanpa latar belakang coding sama sekali. Kami menggunakan sistem block-coding visual serta buku panduan bergambar yang sangat ramah anak.",
  },
  {
    id: "faq-2",
    question: "Berapa usia minimal anak untuk merakit Kit RoboEdu?",
    answer:
      "Kit RoboEdu ditujukan untuk anak usia 6 tahun ke atas. Komponen dirancang besar, tanpa sudut tajam, dan tidak memerlukan solder atau perekat yang berbahaya.",
  },
  {
    id: "faq-3",
    question: "Apakah kit robotik ini membutuhkan smartphone atau tablet?",
    answer:
      "Sebagian besar modul utama dapat beroperasi secara langsung setelah dirakit. Namun untuk fitur coding interaktif dan remote control, Anda dapat mengunduh aplikasi gratis RoboEdu di Android atau iOS.",
  },
  {
    id: "faq-4",
    question: "Bagaimana jika ada komponen robot yang hilang atau rusak?",
    answer:
      "Kami memiliki garansi penggantian suku cadang selama 30 hari. Anda juga dapat memesan komponen tambahan eceran secara terpisah di toko resmi kami.",
  },
  {
    id: "faq-5",
    question: "Berapa lama estimasi pengiriman paket RoboEdu?",
    answer:
      "Pengiriman diproses dalam 1x24 jam. Estimasi pengiriman untuk pulau Jawa adalah 1-3 hari kerja, sedangkan luar pulau Jawa 3-5 hari kerja.",
  },
  {
    id: "faq-6",
    question: "Berapa lama estimasi pengiriman paket RoboEdu?",
    answer:
      "Pengiriman diproses dalam 1x24 jam. Estimasi pengiriman untuk pulau Jawa adalah 1-3 hari kerja, sedangkan luar pulau Jawa 3-5 hari kerja.",
  },
];

const DEFAULT_PROMO_DATA: PromoBannerData = {
  title: "Yuk, Beli Kit Mainan Edukasi RoboEdu Sekarang!",
  description:
    "Dapatkan promo spesial hari ini dan bantu si kecil belajar koding serta merakit robot dengan cara yang seru!",
  thumbnails: [
    {
      id: "thumb-1",
      src: "/images/foto.jpg",
      alt: "Anak bermain robot",
      className:
        "ml-2 md:ml-6 lg:ml-0 xl:ml-5 translate-x-4 md:translate-x-2 lg:translate-x-16 xl:translate-x-4 2xl:translate-x-6 z-10",
    },
    {
      id: "thumb-2",
      src: "/images/foto2.jpg",
      alt: "Merakit robot",
      className: "",
    },
    {
      id: "thumb-3",
      src: "/images/foto3.jpg",
      alt: "Belajar koding",
      className:
        "-ml-2 md:-ml-6 lg:-ml-0 xl:-ml-5 -translate-x-4 md:-translate-x-2 lg:-translate-x-16 xl:-translate-x-1 2xl:-translate-x-2 z-10",
    },
    {
      id: "thumb-4",
      src: "/images/foto4.jpg",
      alt: "Robot edukasi",
      className: "xl:translate-x-4 2xl:translate-x-6 z-10",
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
    <div className="bg-card rounded-xl border-none shadow-none overflow-hidden transition-all duration-200">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between text-left gap-3 hover:bg-muted/50 transition-colors cursor-pointer group"
      >
        <span className="font-heading font-semibold text-xs sm:text-sm text-primary-900 group-hover:text-[#18598D] transition-colors">
          {item.question}
        </span>

        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isOpen
              ? "rotate-0 bg-[#18598D] text-card"
              : "rotate-180 bg-muted text-foreground"
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

// Molecule: Promo Thumbnail Item
function PromoThumbnail({
  src,
  alt,
  customClass = "",
  indexStr,
}: {
  src: string;
  alt: string;
  customClass?: string;
  indexStr: string;
}) {
  return (
    <div className={`relative ${customClass}`}>
      {/* Container SVG Bunga + Angka Kuning Terang */}
      <div className="absolute -top-12 -left-8 sm:-top-16 sm:-left-10 md:-top-20 md:-left-12 lg:-top-[90px] lg:-left-16 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 z-20 flex items-center justify-center pointer-events-none select-none">
        
        {/* SVG Bunga Warna Biru Tua (#0F2C59) */}
        <svg
          viewBox="0 0 218 209"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full drop-shadow-md"
        >
          <ellipse cx="110.762" cy="102.571" rx="77" ry="78" fill="#0F2C59" />
          <path
            d="M83.2605 13.0735C85.2616 7.07172 91.2592 1.07565 107.26 0.0734714C123.262 -0.928711 129.76 8.57172 132.26 13.0735C134.76 17.5752 133.76 31.5735 133.76 31.5735H83.2605C83.2605 31.5735 81.2594 19.0752 83.2605 13.0735Z"
            fill="#0F2C59"
          />
          <path
            d="M36.6251 45.457C34.4372 39.5207 35.3732 31.0917 47.2399 20.3109C59.1065 9.53004 70.1167 12.8867 74.8815 14.8393C79.6463 16.7919 87.6124 28.3458 87.6124 28.3458L48.1848 59.9007C48.1848 59.9007 38.8129 51.3932 36.6251 45.457Z"
            fill="#0F2C59"
          />
          <path
            d="M17.7121 99.901C12.2947 96.6334 7.75853 89.4677 10.2869 73.6357C12.8154 57.8037 19.1381 54.8302 28.4491 52.0919C37.7601 49.3535 50.2614 57.5711 50.2614 57.5711L35.7625 103.955C35.7625 103.955 23.1295 103.169 17.7121 99.901Z"
            fill="#0F2C59"
          />
          <path
            d="M37.8003 152.91C31.6094 154.213 21.8015 151.576 14.7527 141.074C7.70385 130.571 8.11386 118.967 13.0581 110.615C18.0023 102.264 32.7502 99.7518 32.7502 99.7518L53.7686 143.568C53.7686 143.568 43.9912 151.607 37.8003 152.91Z"
            fill="#0F2C59"
          />
          <path
            d="M79.6116 185.397C75.1467 189.879 65.4971 193.047 53.8462 188.123C42.1953 183.2 36.1801 173.267 35.7403 163.572C35.3005 153.877 46.2613 143.695 46.2613 143.695L87.8515 168.833C87.8515 168.833 84.0764 180.914 79.6116 185.397Z"
            fill="#0F2C59"
          />
          <path
            d="M133.389 188.665C132.11 194.86 125.773 202.797 113.329 205.062C100.885 207.327 90.4113 202.314 84.7313 194.445C79.0513 186.575 82.6417 172.052 82.6417 172.052L131.207 170.294C131.207 170.294 134.668 182.469 133.389 188.665Z"
            fill="#0F2C59"
          />
          <path
            d="M179.355 157.462C181.639 163.362 180.616 173.467 171.386 182.115C162.156 190.764 150.637 192.229 141.598 188.694C132.56 185.16 127.705 171.009 127.705 171.009L167.563 143.207C167.563 143.207 177.071 151.562 179.355 157.462Z"
            fill="#0F2C59"
          />
          <path
            d="M201.069 106.326C206.186 110.046 210.804 119.092 207.735 131.363C204.667 143.633 195.781 151.108 186.269 153.037C176.758 154.967 165.008 145.707 165.008 145.707L183.433 100.738C183.433 100.738 195.952 102.605 201.069 106.326Z"
            fill="#0F2C59"
          />
          <path
            d="M176.68 51.3288C182.742 49.5208 192.734 51.3425 200.622 61.2297C208.511 71.1168 209.057 82.7157 204.816 91.4455C200.575 100.175 186.084 103.892 186.084 103.892L161.534 61.9516C161.534 61.9516 170.617 53.1367 176.68 51.3288Z"
            fill="#0F2C59"
          />
          <path
            d="M135.345 20.0048C139.292 15.06 148.536 10.8535 160.656 14.47C172.777 18.0865 179.844 27.2994 181.344 36.8881C182.845 46.4768 173.066 57.799 173.066 57.799L128.971 37.3719C128.971 37.3719 131.398 24.9495 135.345 20.0048Z"
            fill="#0F2C59"
          />
        </svg>

        {/* Angka Kuning Terang (var(--color-accent-yellow)) */}
        <span className="relative z-10 font-heading font-extrabold text-[var(--color-accent-yellow,#FFF37E)] text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight leading-none drop-shadow-sm">
          {indexStr}
        </span>
      </div>

      {/* Kontainer Gambar */}
      <div className="relative z-10 w-24 md:w-36 lg:w-48 xl:w-56 2xl:w-64 h-24 md:h-36 lg:h-48 xl:h-56 2xl:h-64 overflow-hidden rounded-2xl md:rounded-3xl shadow-md sm:shadow-lg border-4 border-white/20">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 96px, (max-width: 1024px) 144px, 256px"
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
  const rightThumb = data.thumbnails[2];

  return (
    <div className="relative w-full h-[400px] md:h-[540px] lg:h-[600px] xl:h-[640px] 2xl:h-[700px] bg-background overflow-visible z-10">
      <div className="max-w-6xl mx-auto h-full px-6 lg:px-8 relative flex items-center justify-between">
        
        {/* Header Text */}
        <div className="absolute top-8 sm:top-10 md:top-12 lg:top-16 left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-7xl px-4 pointer-events-none">
          <h1 className="font-heading text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#18598D] tracking-tight leading-tight mb-2 md:mb-3 text-center whitespace-nowrap">
            {data.title}
          </h1>
          <p className="font-body text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-[#3D2900] text-center max-w-none mx-auto drop-shadow-sm whitespace-nowrap">
            {data.description}
          </p>
        </div>

        {/* Left Thumbnails */}
        <div className="flex flex-col gap-10 md:gap-16 lg:gap-24 z-50 translate-y-24 md:translate-y-36 lg:translate-y-48">
          {leftTop && (
            <PromoThumbnail
              key={leftTop.id}
              src={leftTop.src}
              alt={leftTop.alt}
              customClass={leftTop.className}
              indexStr="01"
            />
          )}
          {leftBottom && (
            <PromoThumbnail
              key={leftBottom.id}
              src={leftBottom.src}
              alt={leftBottom.alt}
              /* Posisi paling depan dengan z-[60] */
              customClass={`${leftBottom.className} relative z-[60] translate-x-24 md:translate-x-40 lg:translate-x-52 translate-y-4 md:translate-y-6 lg:translate-y-8`}
              indexStr="02"
            />
          )}
        </div>

        {/* Hero Center Illustration */}
        <div className="absolute -bottom-8 md:-bottom-16 lg:-bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-end justify-center w-full max-w-xs md:max-w-md lg:max-w-lg pointer-events-none">
          <div className="w-56 sm:w-72 md:w-[22rem] lg:w-[450px] xl:w-[500px]">
            <HeroRobot />
          </div>
        </div>

        {/* Right Thumbnail */}
        <div className="flex flex-col justify-center z-10 translate-y-16 md:translate-y-24 lg:translate-y-32">
          {rightThumb && (
            <PromoThumbnail
              key={rightThumb.id}
              src={rightThumb.src}
              alt={rightThumb.alt}
              customClass={`${rightThumb.className} -translate-x-4 md:-translate-x-8 lg:-translate-x-12`}
              indexStr="03"
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
  description = "Punya pertanyaan mengenai RoboEdu? Temukan jawaban lengkap mengenai produk, usia pengguna, hingga pengiriman di sini.",
  promoData = DEFAULT_PROMO_DATA,
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative z-20 bg-[#2781CD] text-card pb-24 sm:pb-23 overflow-hidden">
      <PromoBanner data={promoData} />

      {/* SVG Shape Divider */}
      <div className="relative w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1370 211"
          preserveAspectRatio="none"
          className="relative block w-full h-20 md:h-28 lg:h-36 xl:h-40 text-background"
          fill="currentColor"
        >
          <path d="M0 0H1370V121.548C1370 121.548 957.116 -9.52688 649.615 0.552926C370.339 9.70758 0 121.548 0 121.548V0Z" />
        </svg>
      </div>

      {/* Accordion Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 pt-24 md:pt-32 lg:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Header Column */}
          <div className="lg:col-span-5 text-left lg:pt-12">
            <Badge icon={HelpCircle} label="Pusat Bantuan" />
            <h2 className="font-heading text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-semibold text-card tracking-tight leading-tight">
              {title}
            </h2>
            <p className="font-body text-xs md:text-sm text-card/80 mt-2.5 leading-relaxed">
              {description}
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <div className="w-48 sm:w-56 md:w-64 h-auto translate-x-10 sm:translate-x-16 rotate-0">
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