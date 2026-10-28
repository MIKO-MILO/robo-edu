"use client";

import Image from"next/image";

// ==========================================
// TYPES (Backend-Ready)
// ==========================================
export interface CarouselProductItem {
 id: number;
 name: string;
 category?: string;
 price: string;
 image: string;
}

interface ProductGridProps {
 products?: CarouselProductItem[];
}

const DEFAULT_PRODUCTS: CarouselProductItem[] = [
 {
 id: 1,
 name:"IoT Smart Walking Dog",
 category:"Kids Toys",
 price:"Rp 450.000",
 image:"images/product.webp",
 },
 {
 id: 2,
 name:"Smart Servo Mechanical Cat",
 category:"Kids Toys",
 price:"Rp 520.000",
 image:"images/product2.webp",
 },
 {
 id: 3,
 name:"IoT Obstacle Avoiding Dino",
 category:"Kids Toys",
 price:"Rp 610.000",
 image:"images/product.webp",
 },
 {
 id: 4,
 name:"Bluetooth Racing Mech Bug",
 category:"Kids Toys",
 price:"Rp 380.000",
 image:"images/product2.webp",
 },
 {
 id: 5,
 name:"Smart IoT Climbing Monkey",
 category:"Kids Toys",
 price:"Rp 690.000",
 image:"images/product.webp",
 },
 {
 id: 6,
 name:"IoT Smart Walking Dog Extra",
 category:"Kids Toys",
 price:"Rp 450.000",
 image:"images/product2.webp",
 },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ProductGrid({ products = DEFAULT_PRODUCTS }: ProductGridProps) {
 return (
 <div className="relative w-full">
 {/* Product Cards Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {products.map((product) => (
 <div
 key={product.id}
 className="flex flex-col items-center text-center group cursor-pointer"
 >
 {/* Custom Grey Image Container (#686868 with 16% opacity -> #68686829) */}
 <div className="w-full bg-[#686868]/10 aspect-square p-6 flex items-center justify-center relative overflow-hidden mb-4">
 <div className="relative w-full h-full">
 <Image
 src={product.image}
 alt={product.name}
 fill
 unoptimized
 className="object-contain transition-transform duration-300 group-hover:scale-105"
 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 />
 </div>
 </div>

 {/* Product Info Below Box */}
 <div className="flex flex-col items-center gap-1 w-full px-2">
 {/* Product Name */}
 <h3 className="font-sans font-bold text-base sm:text-lg text-[#222222] leading-tight line-clamp-1">
 {product.name}
 </h3>

 {/* Subtitle / Category */}
 <span className="text-xs sm:text-sm text-gray-500 font-medium">
 {product.category ||"Kids Toys"}
 </span>

 {/* Price */}
 <p className="font-sans font-bold text-sm sm:text-base text-[#4DA0CF] mt-0.5">
 {product.price}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}