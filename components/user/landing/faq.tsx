"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { ChevronDown, HelpCircle, type LucideIcon } from "lucide-react";

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
        "ml-2 md:ml-6 lg:ml-0 xl:ml-5 translate-x-4 md:translate-x-2 lg:translate-x-16 xl:translate-x-4 2xl:translate-x-6",
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
        "-ml-2 md:-ml-6 lg:-ml-0 xl:-ml-5 -translate-x-4 md:-translate-x-2 lg:-translate-x-16 xl:-translate-x-1 2xl:-translate-x-2",
    },
    {
      id: "thumb-4",
      src: "/images/foto4.jpg",
      alt: "Robot edukasi",
      className: "xl:translate-x-4 2xl:translate-x-6",
    },
  ],
};

// ==========================================
// 2. ATOMIC SUB-COMPONENTS
// ==========================================

// Atom: Badge
function Badge({ icon: Icon, label }: { icon?: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card/10 text-card font-medium text-xs mb-3 backdrop-blur-sm border border-card/20">
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}

// Atom: Accordion Item
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
}: {
  src: string;
  alt: string;
  customClass?: string;
}) {
  return (
    <div
      className={`relative w-20 md:w-32 lg:w-40 xl:w-48 2xl:w-56 h-20 md:h-32 lg:h-40 xl:h-48 2xl:h-56 overflow-hidden rounded-2xl md:rounded-3xl shadow-sm sm:shadow-none ${customClass}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 80px, (max-width: 1024px) 128px, 192px"
        className="object-cover"
      />
    </div>
  );
}

// Organism: Promo Banner
function PromoBanner({ data = DEFAULT_PROMO_DATA }: { data?: PromoBannerData }) {
  const leftThumbnails = data.thumbnails.slice(0, 2);
  const rightThumbnails = data.thumbnails.slice(2, 4);

  return (
    <div className="relative w-full h-[400px] md:h-[540px] lg:h-[600px] xl:h-[640px] 2xl:h-[700px] bg-background">
      <div className="max-w-6xl mx-auto h-full px-6 lg:px-8 relative flex items-center justify-between">
        
        {/* Header Text */}
        <div className="absolute top-6 md:top-16 lg:top-24 xl:top-20 2xl:top-24 left-1/2 -translate-x-1/2 text-center z-20 w-full max-w-5xl px-4 pointer-events-none">
          <h1 className="font-heading text-base md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-[#18598D] tracking-tight whitespace-normal md:whitespace-nowrap leading-snug md:leading-normal mb-2 sm:mb-3 px-2 sm:px-0">
            {data.title}
          </h1>
          <p className="font-body text-[11px] md:text-sm lg:text-base 2xl:text-lg font-medium text-secondary leading-relaxed whitespace-normal md:whitespace-nowrap text-center max-w-xs md:max-w-none mx-auto">
            {data.description}
          </p>
        </div>

        {/* Thumbnail Left Container */}
        <div className="flex flex-col gap-3 md:gap-5 lg:gap-6 2xl:gap-8 z-10 translate-y-8 md:translate-y-16 lg:translate-y-24 xl:translate-y-28 2xl:translate-y-32 translate-x-1 md:translate-x-4 lg:translate-x-12 xl:translate-x-10 2xl:translate-x-16">
          {leftThumbnails.map((thumb) => (
            <PromoThumbnail
              key={thumb.id}
              src={thumb.src}
              alt={thumb.alt}
              customClass={thumb.className}
            />
          ))}
        </div>

        {/* Hero Center Illustration & Ground Shadows (Bayangan Lebih Gelap Dikit) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 md:translate-y-16 lg:translate-y-24 xl:translate-y-28 2xl:translate-y-32 z-30 flex items-end justify-center -space-x-12 md:-space-x-20 lg:-space-x-28 xl:-space-x-34 2xl:-space-x-40 px-4 w-full max-w-6xl pointer-events-none">
            
            {/* Karakter Anak Perempuan + Bayangan */}
            <div className="relative w-48 md:w-72 lg:w-80 xl:w-[400px] 2xl:w-[480px] h-auto aspect-square translate-x-3 md:translate-x-4 lg:translate-x-6 xl:translate-x-8 z-10 flex flex-col items-center">
              <div className="absolute bottom-1 w-[45%] h-4 bg-black/35 rounded-full blur-sm z-0" />
              <Image
                src="/images/girl.png"
                alt="Anak Perempuan"
                width={450}
                height={450}
                priority
                className="object-contain w-full h-full relative z-10"
              />
            </div>

            {/* Karakter Anak Laki-laki + Bayangan */}
            <div className="relative w-48 md:w-72 lg:w-80 xl:w-[400px] 2xl:w-[480px] h-auto aspect-square scale-110 md:scale-115 lg:scale-120 xl:scale-125 2xl:scale-130 scale-y-110 origin-bottom z-10 flex flex-col items-center">
              <div className="absolute bottom-1 w-[45%] h-4 bg-black/35 rounded-full blur-sm z-0" />
              <Image
                src="/images/boy.png"
                alt="Anak Laki-laki"
                width={500}
                height={550}
                priority
                className="object-contain w-full h-full relative z-10"
              />
            </div>
          </div>

        {/* Thumbnail Right Container */}
        <div className="flex flex-col gap-3 md:gap-5 lg:gap-6 2xl:gap-8 z-10 translate-y-8 md:translate-y-16 lg:translate-y-24 xl:translate-y-28 2xl:translate-y-32 -translate-x-1 md:-translate-x-4 lg:-translate-x-12 xl:-translate-x-10 2xl:-translate-x-16">
          {rightThumbnails.map((thumb) => (
            <PromoThumbnail
              key={thumb.id}
              src={thumb.src}
              alt={thumb.alt}
              customClass={thumb.className}
            />
          ))}
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
    <section className="relative z-20 bg-[#558FBD] text-card pb-24 sm:pb-23 overflow-hidden">
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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 pt-12 md:pt-16 lg:pt-20">
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