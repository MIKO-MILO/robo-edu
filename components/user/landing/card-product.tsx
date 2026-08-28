"use client";

import Image from "next/image";
import { Star, ShoppingBag, ArrowRight, Zap, Award } from "lucide-react";

interface Product {
  id: number;
  name: string;
  age: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  badge: string;
  badgeBg: string;
  image: string;
  features: string[];
}

const products: Product[] = [
  {
    id: 1,
    name: "RoboEdu Starter Kit",
    age: "Usia 6 - 8 Tahun",
    price: "Rp 299.000",
    originalPrice: "Rp 399.000",
    rating: 4.9,
    reviews: 128,
    badge: "Terfavorit",
    badgeBg: "bg-[#2483D0] text-white",
    image: "/images/3.png",
    features: ["15 Proyek Rakit", "Buku Panduan Berwarna", "Sistem Block Snap"],
  },
  {
    id: 2,
    name: "RoboEdu Explorer Kit",
    age: "Usia 8 - 12 Tahun",
    price: "Rp 449.000",
    originalPrice: "Rp 599.000",
    rating: 5.0,
    reviews: 95,
    badge: "Rekomendasi",
    badgeBg: "bg-[#F5C045] text-[#3D2900]",
    image: "/images/4.png",
    features: ["25 Proyek Sensor", "App Control Bluetooth", "Lampu LED RGB"],
  },
  {
    id: 3,
    name: "RoboEdu AI & IoT Kit",
    age: "Usia 10+ Tahun",
    price: "Rp 699.000",
    originalPrice: "Rp 899.000",
    rating: 4.8,
    reviews: 64,
    badge: "Tingkat Lanjut",
    badgeBg: "bg-[#48236B] text-white",
    image: "/images/22.png",
    features: ["Pemrograman Python", "Kamera Pintar AI", "Konektivitas WiFi"],
  },
];

export default function CardProduct() {
  return (
    <section className="relative bg-[#F1ECE0] pt-0 pb-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Mentok Paling Atas */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-0 mt-0 mb-6">
          <div className="max-w-xl text-left">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#3D2900] tracking-tight leading-none">
              Pilih Kit Robotik Impian Si Kecil
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#3D2900]/70 mt-1">
              Dirancang khusus sesuai tahapan perkembangan motorik dan pemikiran logis anak.
            </p>
          </div>

          {/* Tombol Ujung Kanan Atas Mentok */}
          <div className="shrink-0 pt-1">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[#2483D0] font-bold hover:text-[#18598D] transition-colors text-xs sm:text-sm cursor-pointer group"
            >
              <span>Lihat Semua Produk & Aksesori</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-[2.5rem] p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group border border-black/5"
            >
              {/* Notch Left & Right */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-[#F1ECE0] rounded-full border-r border-black/5 shadow-inner" />
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-[#F1ECE0] rounded-full border-l border-black/5 shadow-inner" />

              {/* Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-sm ${product.badgeBg}`}>
                  {product.badge}
                </span>
              </div>

              <div>
                {/* Image Container */}
                <div className="relative w-full h-52 bg-[#F7F5F0] rounded-[2rem] flex items-center justify-center overflow-hidden mb-5">
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10" />
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10" />

                  <Image
                    src={product.image}
                    alt={product.name}
                    width={180}
                    height={180}
                    className="object-contain transform group-hover:scale-105 transition-transform duration-300 rounded-2xl"
                  />
                </div>

                {/* Rating & Age */}
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-1 text-[#F5C045] font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-gray-400 font-normal">({product.reviews})</span>
                  </div>
                  <span className="bg-[#18598D]/10 text-[#18598D] px-2.5 py-0.5 rounded-full font-semibold">
                    {product.age}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-heading text-xl font-bold text-[#3D2900] mb-3">
                  {product.name}
                </h3>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-[#3D2900]/80">
                      <Award className="w-4 h-4 text-[#2483D0] shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between z-10">
                <div>
                  <span className="text-xs text-gray-400 line-through block">
                    {product.originalPrice}
                  </span>
                  <span className="text-xl font-extrabold text-[#18598D]">
                    {product.price}
                  </span>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 bg-[#FFF6A0] hover:bg-[#F8EB6F] text-[#3D2900] font-extrabold px-4 py-2.5 rounded-2xl shadow transition-all duration-200 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Pesan</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}