"use client";

export default function TextMarquee() {
 return (
 <div className="relative w-full overflow-hidden -mt-20 sm:-mt-16 lg:-mt-20 z-20 flex items-center justify-center pb-4 sm:pb-6 pointer-events-none">
 <div className="w-full min-w-[1000px] flex justify-center items-center scale-[0.85] sm:scale-110 lg:scale-125 transition-transform">
 <svg
 viewBox="0 -25 1128 170"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className="w-full max-w-none h-auto overflow-visible"
 >
 <defs>
 <path
 id="marquee-path"
 d="M0.00195312 70.0053C0.00195312 70.0053 98.002 70.0051 163.889 77.2512C251.71 86.9096 309.646 36.7403 401.585 36.7403C465.358 36.7403 466.865 68.3142 530.502 65.2505C599.204 61.9429 586.028 44.7763 654.002 36.7399C746.638 25.7878 760.854 70.0052 854.502 70.0051C944.002 70.0051 960.425 55.7884 1034.84 51.2321C1066.78 49.2766 1126.5 51.2321 1126.5 51.2321"
 />
 </defs>

 {/* Pita Kuning / Background Path */}
 <use
 href="#marquee-path"
 stroke="#FFF37E"
 strokeWidth="70"
 strokeLinecap="round"
 strokeLinejoin="round"
 />

 {/* Teks Berjalan */}
 <text
 dy="0.35em"
 className="fill-[#2483D0] font-heading text-lg sm:text-xl font-bold uppercase tracking-widest whitespace-nowrap select-none"
 >
 <textPath href="#marquee-path" startOffset="0%">
 <animate
 attributeName="startOffset"
 from="0%"
 to="-50%"
 dur="15s"
 repeatCount="indefinite"
 />
 ROBOEDU • INTERAKTIF • KREATIF • EDUKATIF • ROBOEDU • INTERAKTIF • KREATIF • EDUKATIF • ROBOEDU • INTERAKTIF • KREATIF • EDUKATIF • ROBOEDU • INTERAKTIF • KREATIF • EDUKATIF
 </textPath>
 </text>
 </svg>
 </div>
 </div>
 );
}