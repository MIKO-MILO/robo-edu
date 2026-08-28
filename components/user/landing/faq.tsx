"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Apakah anak yang belum pernah belajar coding bisa memainkannya?",
    answer:
      "Tentu saja! RoboEdu dirancang khusus untuk pemula tanpa latar belakang coding sama sekali. Kami menggunakan sistem block-coding visual serta buku panduan bergambar yang sangat ramah anak.",
  },
  {
    question: "Berapa usia minimal anak untuk merakit Kit RoboEdu?",
    answer:
      "Kit RoboEdu ditujukan untuk anak usia 6 tahun ke atas. Komponen dirancang besar, tanpa sudut tajam, dan tidak memerlukan solder atau perekat yang berbahaya.",
  },
  {
    question: "Apakah kit robotik ini membutuhkan smartphone atau tablet?",
    answer:
      "Sebagian besar modul utama dapat beroperasi secara langsung setelah dirakit. Namun untuk fitur coding interaktif dan remote control, Anda dapat mengunduh aplikasi gratis RoboEdu di Android atau iOS.",
  },
  {
    question: "Bagaimana jika ada komponen robot yang hilang atau rusak?",
    answer:
      "Kami memiliki garansi penggantian suku cadang selama 30 hari. Anda juga dapat memesan komponen tambahan eceran secara terpisah di toko resmi kami.",
  },
  {
    question: "Berapa lama estimasi pengiriman paket RoboEdu?",
    answer:
      "Pengiriman diproses dalam 1x24 jam. Estimasi pengiriman untuk pulau Jawa adalah 1-3 hari kerja, sedangkan luar pulau Jawa 3-5 hari kerja.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-[#F1ECE0] py-16 sm:py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5DCFD] text-[#233B5E] font-bold text-xs sm:text-sm mb-3 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#233B5E]" />
            <span>Pusat Bantuan</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="font-body text-sm sm:text-base text-[#3D2900]/70 mt-3">
            Punya pertanyaan mengenai RoboEdu? Temukan jawabannya di sini.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <span className="font-heading font-bold text-sm sm:text-base text-[#3D2900]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-[#F7F5F0] flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#18598D] text-white" : "text-[#3D2900]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#3D2900]/80 leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
