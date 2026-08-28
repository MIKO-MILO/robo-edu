"use client";

import Image from "next/image";
import { Star, Quote, Heart } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  childAge: string;
  avatar: string;
  rating: number;
  comment: string;
  productName: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Bunda Siska Utami",
    role: "Ibu Rumah Tangga",
    childAge: "Anak Usia 7 Tahun",
    avatar: "/images/11.png",
    rating: 5,
    comment:
      "Luar biasa! Anak saya yang tadinya kecanduan game hp, sekarang malah asyik merakit robot dan mencoba misi-misi logika di buku panduannya. Pilihan terbaik untuk belajar STEM!",
    productName: "RoboEdu Starter Kit",
  },
  {
    id: 2,
    name: "Pak Hendra Wijaya",
    role: "Guru Sekolah Dasar",
    childAge: "Anak Usia 9 Tahun",
    avatar: "/images/22.png",
    rating: 5,
    comment:
      "Komponennya sangat aman dan presisi. Konsep belajar sambil bermainnya pas sekali, bahasa di buku panduan sangat ramah untuk pemula.",
    productName: "RoboEdu Explorer Kit",
  },
  {
    id: 3,
    name: "Dr. Amanda Putri",
    role: "Orang Tua & Pengamat Pendidikan",
    childAge: "Anak Usia 11 Tahun",
    avatar: "/images/3.png",
    rating: 5,
    comment:
      "Maskot interaktifnya buat anak betah belajar jam-jaman. Logika pemrogramannya disajikan intuitif dan bertahap. Sangat recommended!",
    productName: "RoboEdu AI Kit",
  },
];

export default function Testimoni() {
  return (
    <section className="relative bg-[#F1ECE0] py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAD8FD] text-[#48236B] font-bold text-xs sm:text-sm mb-3 shadow-sm">
            <Heart className="w-4 h-4 fill-current text-[#48236B]" />
            <span>Kisah Sukses Orang Tua</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight">
            Apa Kata Mereka tentang RoboEdu?
          </h2>
          <p className="font-body text-sm sm:text-base text-[#3D2900]/70 mt-3">
            Lebih dari 10.000+ anak Indonesia telah belajar merakit robot dan melatih logika sejak dini.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-black/5 relative group"
            >
              <Quote className="w-10 h-10 text-[#C5DCFD] absolute top-6 right-6 opacity-40 pointer-events-none" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#F5C045] mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="font-body text-xs sm:text-sm text-[#3D2900]/80 leading-relaxed italic mb-6">
                  "{item.comment}"
                </p>
              </div>

              {/* User Profile Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-[#FFF6A0] overflow-hidden shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#3D2900]">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#2483D0] font-semibold">
                    {item.role} • {item.childAge}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
