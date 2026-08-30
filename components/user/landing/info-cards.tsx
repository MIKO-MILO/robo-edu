"use client";

import Image from "next/image";

interface CardData {
  id: number;
  titleLine1: string;
  titleLine2: string;
  bgColor: string;
  shadowColor: string;
  textColor: string;
  mascotSrc: string;
  altText: string;
  borderRadius: string;
}

const cards: CardData[] = [
  {
    id: 1,
    titleLine1: "Aman & Sesuai",
    titleLine2: "Usia 6+",
    bgColor: "#C5DCFD",
    shadowColor: "#A5C6F8",
    textColor: "#233B5E",
    mascotSrc: "/images/4.png",
    altText: "Maskot RoboEdu Usia 6+",
    borderRadius: "55px 22px 45px 22px / 22px 45px 22px 55px",
  },
  {
    id: 2,
    titleLine1: "Aman & Mudah",
    titleLine2: "Dirakit",
    bgColor: "#FDCBD1",
    shadowColor: "#F7ACB5",
    textColor: "#5C2830",
    mascotSrc: "/images/3.png",
    altText: "Maskot RoboEdu Mudah Dirakit",
    borderRadius: "22px 55px 22px 45px / 45px 22px 55px 22px",
  },
  {
    id: 3,
    titleLine1: "Melatih Logika &",
    titleLine2: "Kesabaran",
    bgColor: "#EAD8FD",
    shadowColor: "#D6B5F7",
    textColor: "#48236B",
    mascotSrc: "/images/22.png",
    altText: "Maskot RoboEdu Logika & Kesabaran",
    borderRadius: "45px 45px 28px 28px / 35px 35px 28px 28px",
  },
  {
    id: 4,
    titleLine1: "Sukses Selesaikan",
    titleLine2: "Misi",
    bgColor: "#FDECB1",
    shadowColor: "#F5D67C",
    textColor: "#59420F",
    mascotSrc: "/images/11.png",
    altText: "Maskot RoboEdu Sukses Selesaikan Misi",
    borderRadius: "28px 28px 45px 45px / 28px 28px 35px 35px",
  },
];

export default function InfoCards() {
  return (
    <section className="relative bg-[#F3EFE4] pt-2 sm:pt-8 pb-0 sm:pb-5 overflow-hidden">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="w-full flex flex-row justify-center items-center gap-2 sm:gap-3 mb-1 sm:mb-8 mt-1 sm:mt-5 mx-auto">
          <h3 className="font-heading text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight pt-1 text-center">
            Kenapa{" "}
            <span className="relative inline-block text-[#2483D0] px-1 pb-2">
              RoboEdu
              <svg
                className="absolute left-0 -bottom-1 w-full h-3 overflow-visible pointer-events-none"
                viewBox="0 0 100 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 6 Q 25 1, 50 6 T 100 6"
                  stroke="#F5C045"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h3>

          <div className="relative w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0 -translate-y-1">
            <Image
              src="/images/5.png"
              alt="Tanda Tanya RoboEdu"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-7 lg:gap-8 pt-10 sm:pt-4 mt-0 sm:mt-18 mb-1 sm:mb-14 justify-items-center">
          {cards.map((card) => (
            <div key={card.id} className="relative flex flex-col items-center w-full max-w-[175px] xs:max-w-[190px] sm:max-w-[232px]">
              {/* Outer Wrapper */}
              <div
                className="relative w-full h-[135px] sm:h-[184px] p-1.5"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: card.borderRadius,
                  boxShadow: `0 14px 24px -6px ${card.shadowColor}AA, 0 6px 12px -3px rgba(0, 0, 0, 0.06)`,
                }}
              >
                {/* Inner Card Container */}
                <div
                  className="w-full h-full pt-[35px] sm:pt-[64px] pb-2 sm:pb-3 px-2.5 sm:px-3 flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{
                    backgroundColor: card.bgColor,
                    borderRadius: `calc(${card.borderRadius} - 4px)`,
                  }}
                >
                  {/* Subtle Curved Accent Line */}
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-white/20 rounded-full blur-sm pointer-events-none" />

                  {/* Card Title Text */}
                  <h3
                    className="font-heading text-[11px] xs:text-xs sm:text-xs lg:text-sm font-extrabold leading-snug tracking-tight z-10"
                    style={{ color: card.textColor }}
                  >
                    {card.titleLine1}
                    <br />
                    {card.titleLine2}
                  </h3>
                </div>

                {/* Mascot Image */}
                <div className="absolute -top-12 xs:-top-14 sm:-top-25 left-1/2 -translate-x-1/2 w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 pointer-events-none drop-shadow-md flex items-center justify-center z-30">
                  <Image
                    src={card.mascotSrc}
                    alt={card.altText}
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                stroke="#F3E669"
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
                stroke="#F3E669"
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
  y="330"
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
    y="360"
    width="230"
    height="50"
    rx="25"
    className="fill-[#195C92] transition-all duration-300 group-hover:fill-[#103B5E]"
  />
  <text
    x="1215"
    y="390"
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