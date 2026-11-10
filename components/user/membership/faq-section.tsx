"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { ChevronDown, HelpCircle } from "lucide-react";

// ── Types ──────────────────────────────────────────
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const RESELLER_FAQS: FAQItem[] = [
  {
    id: "rfaq-1",
    question: "Siapa saja yang bisa mendaftar sebagai reseller RoboEdu?",
    answer:
      "Siapapun yang memiliki toko fisik, marketplace aktif, kanal media sosial, atau institusi pendidikan seperti sekolah dan LPK dapat mendaftar. RoboEdu membuka dua kategori mitra: Toko & Individu Kreatif serta Institusi & Komunitas.",
  },
  {
    id: "rfaq-2",
    question: "Apakah ada biaya pendaftaran untuk menjadi reseller?",
    answer:
      "Pendaftaran sepenuhnya gratis. Tidak ada biaya keanggotaan atau deposit awal. Pembayaran pertama dilakukan saat Anda melakukan pemesanan perdana di katalog reseller setelah akun disetujui.",
  },
  {
    id: "rfaq-3",
    question: "Berapa lama proses verifikasi akun reseller?",
    answer:
      "Tim operasional RoboEdu akan meninjau pengajuan dalam 1–2 hari kerja. Notifikasi status (APPROVED/REVISION) dikirim melalui WhatsApp yang Anda daftarkan.",
  },
  {
    id: "rfaq-4",
    question: "Apakah ada minimum order untuk pembelian reseller?",
    answer:
      "Untuk pemula, tersedia paket uji coba dengan pemesanan minimum fleksibel (<10 unit). Reseller aktif dengan volume lebih besar mendapatkan harga tier yang lebih kompetitif.",
  },
  {
    id: "rfaq-5",
    question: "Apakah reseller mendapatkan materi promosi & brosur?",
    answer:
      "Ya. Setiap mitra reseller resmi mendapatkan akses ke aset foto produk resolusi tinggi, lembar panduan kurikulum STEM, spesifikasi teknis siap cetak, dan brosur digital untuk presentasi ke sekolah atau instansi.",
  },
  {
    id: "rfaq-6",
    question: "Bagaimana cara klaim garansi untuk produk yang dijual ke pelanggan?",
    answer:
      "Reseller memiliki jalur prioritas WhatsApp langsung ke tim teknisi RoboEdu untuk klaim garansi, kustomisasi sensor, dan penggantian sparepart. Waktu respons dijamin < 2 jam pada hari kerja.",
  },
];

// ── Accordion Item ─────────────────────────────────
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentId = useId();
  const buttonId = useId();

  return (
    /* Outline / border dibuat lebih tipis dengan opacity / ketebalan yang lebih ringan */
    <div className="bg-white rounded-xl border border-[#1C6CAE]/30 overflow-hidden transition-all duration-200 shadow-sm">
      <button
        id={buttonId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full px-5 py-4 flex items-center justify-between text-left gap-3 hover:bg-slate-50 transition-colors cursor-pointer group"
      >
        <span className="font-heading font-semibold text-sm sm:text-base text-[#1C6CAE] group-hover:text-[#2483D0] transition-colors">
          {item.question}
        </span>

        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isOpen
              ? "rotate-0 bg-[#1C6CAE] text-white"
              : "rotate-180 bg-slate-200/70 text-[#1C6CAE]"
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
          <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#1C6CAE]/90 leading-relaxed border-t border-[#1C6CAE]/10">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────
export function ResellerFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative z-20 bg-[#F3EFE4] text-[#1C6CAE] pb-16 sm:pb-24 overflow-hidden">
      {/* Top SVG wave */}
      <div className="relative w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative block w-full h-10 sm:h-14 md:h-16 lg:h-20 text-[#F3EFE4]"
          fill="currentColor"
        >
          <path d="M0,80 Q720,-10 1440,80 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left: Header Column */}
          <div className="lg:col-span-5 text-left lg:pt-4 mb-6 lg:mb-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C6CAE]/10 text-[#1C6CAE] font-medium text-xs mb-4 backdrop-blur-sm border border-[#1C6CAE]/20">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pusat Bantuan Reseller</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C6CAE] tracking-tight leading-tight">
              Pertanyaan yang Sering Diajukan
            </h2>

            <p className="mt-4 text-xs sm:text-sm text-[#1C6CAE]/85 leading-relaxed">
              Punya pertanyaan seputar program mitra RoboEdu? Temukan jawaban
              lengkap mengenai pendaftaran, harga, garansi, dan dukungan di sini.
            </p>

            {/* Arrow illustration - Ukuran sedikit diperbesar */}
            <div className="pt-8 hidden lg:flex justify-start">
              <div className="w-56 sm:w-64 h-auto translate-x-6">
                <Image
                  src="/images/arrow2.webp"
                  alt="Panah penunjuk"
                  width={320}
                  height={170}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Right: Accordion List */}
          <div className="lg:col-span-7 space-y-3">
            {RESELLER_FAQS.map((item, index) => (
              <AccordionItem
                key={item.id}
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