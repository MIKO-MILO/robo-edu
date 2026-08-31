"use client";

import Image from "next/image";

export default function Carousel() {
  return (
    <section className="relative bg-[#F3EFE4] overflow-hidden">
      {/* Bottom Wavy Banner */}
      <div className="w-full overflow-hidden relative mt-0 sm:mt-6 pb-0 sm:pb-0">
        {/* Gambar gear2.png (Disembunyikan di ukuran mobile) */}
        <div className="hidden sm:block absolute right-0 bottom-0 w-28 sm:w-44 lg:w-56 h-auto pointer-events-none select-none z-0 opacity-75 translate-x-2 sm:translate-x-8 lg:translate-x-12 -translate-y-8 sm:-translate-y-12 lg:-translate-y-16">
          <Image
            src="/images/gear2.png"
            alt="Gear Decoration"
            width={220}
            height={220}
            className="object-contain"
            priority
          />
        </div>
        {/* Wrapper Responsif Banner Bawah dengan negative margin bawah yang jauh lebih tinggi khusus 320px-425px */}
        <div className="w-full overflow-x-hidden sm:overflow-visible -my-[135px] max-[375px]:-my-[155px] max-[425px]:-my-[150px] sm:my-0">
          <div className="min-w-[1500px] sm:min-w-full origin-left scale-[0.22] xs:scale-[0.24] min-[375px]:scale-[0.25] min-[390px]:scale-[0.26] min-[412px]:scale-[0.27] min-[425px]:scale-[0.28] sm:scale-100">
            <svg
              viewBox="0 0 1500 450"
              className="w-full h-auto block relative z-10"
              preserveAspectRatio="none"
            >
              <defs>
                <path
                  id="robo-wave-path-back"
                  d="M 20 60 C 150 150, 300 170, 450 140 C 600 110, 680 70, 820 80 C 960 90, 1090 120, 1030 250 C 990 340, 880 355, 835 285"
                  fill="none"
                />
                <path
                  id="robo-wave-path-front"
                  d="M 835 285 C 800 200, 910 155, 980 160 C 1120 170, 1300 120, 1480 50"
                  fill="none"
                />
              </defs>

              <use
                href="#robo-wave-path-back"
                stroke="#F3C769"
                strokeWidth="68"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <text
                dy="0.35em"
                className="fill-[#3D2900] font-semibold text-sm sm:text-base tracking-[0.16em] lowercase font-heading select-none"
              >
                <textPath href="#robo-wave-path-back" startOffset="0%">
                  <animate
                    attributeName="startOffset"
                    from="-50%"
                    to="0%"
                    dur="22s"
                    repeatCount="indefinite"
                  />
                  roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan &nbsp; | &nbsp; roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan &nbsp; | &nbsp; roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan
                </textPath>
              </text>

              <use
                href="#robo-wave-path-front"
                stroke="#F3C769"
                strokeWidth="68"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <text
                dy="0.35em"
                className="fill-[#3D2900] font-semibold text-sm sm:text-base tracking-[0.16em] lowercase font-heading select-none"
              >
                <textPath href="#robo-wave-path-front" startOffset="0%">
                  <animate
                    attributeName="startOffset"
                    from="-50%"
                    to="0%"
                    dur="22s"
                    repeatCount="indefinite"
                  />
                  roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan &nbsp; | &nbsp; roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan &nbsp; | &nbsp; roboedu &nbsp; | &nbsp; belajar merakit robot &nbsp; | &nbsp; kreatif dan menyenangkan
                </textPath>
              </text>

              {/* Teks di Kiri (Font diperbesar di ukuran 320-425px) */}
              <text
                x="195"
                y="270"
                textAnchor="start"
                className="select-none font-heading"
              >
                <tspan
                  x="195"
                  dy="0"
                  className="text-xs sm:text-sm font-bold tracking-[0.18em] uppercase fill-[#B85C38]"
                >
                  Koleksi Pilihan
                </tspan>
                <tspan
                  x="195"
                  dy="52"
                  style={{ fontSize: "43px" }}
                  className="font-extrabold tracking-tight fill-[#3D2900]"
                >
                  Mainan & Robot IoT
                </tspan>
                <tspan
                  x="195"
                  dy="46"
                  style={{ fontSize: "43px" }}
                  className="font-extrabold tracking-tight fill-[#3D2900]"
                >
                  Canggih
                </tspan>
              </text>

              {/* Tombol di Kanan */}
              <g className="cursor-pointer group">
                <rect
                  x="1100"
                  y="300"
                  width="230"
                  height="50"
                  rx="25"
                  className="fill-[#3D2900] transition-all duration-300 group-hover:fill-[#103B5E]"
                />
                <text
                  x="1215"
                  y="330"
                  textAnchor="middle"
                  className="fill-[#FAF1CA] font-bold text-xs sm:text-sm tracking-wider font-heading select-none pointer-events-none"
                >
                  Lihat Selengkapnya
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
