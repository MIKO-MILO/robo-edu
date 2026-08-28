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
    <section className="relative bg-[#F1ECE0] pt-6 sm:pt-8 pb-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="w-full flex justify-center items-center gap-2 sm:gap-3 mb-6 sm:mb-8 mt-3 sm:mt-5 mx-auto pl-4 sm:pl-8 lg:pl-12">
          <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight pt-1">
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

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0 -translate-y-1">
            <Image
              src="/images/5.png"
              alt="Tanda Tanya RoboEdu"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 4 Cards Grid - Jarak mt dinaikkan agar card bergeser ke bawah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 pt-4 mt-13 sm:mt-23 lg:mt-18 justify-items-center">
          {cards.map((card) => (
            <div key={card.id} className="relative flex flex-col items-center w-full max-w-[232px]">
              {/* Outer Wrapper */}
              <div
                className="relative w-full h-[174px] sm:h-[184px] p-1.5"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: card.borderRadius,
                  boxShadow: `0 14px 24px -6px ${card.shadowColor}AA, 0 6px 12px -3px rgba(0, 0, 0, 0.06)`,
                }}
              >
                {/* Inner Card Container */}
                <div
                  className="w-full h-full pt-[56px] sm:pt-[64px] pb-3 px-3 flex flex-col items-center justify-center text-center relative overflow-hidden"
                  style={{
                    backgroundColor: card.bgColor,
                    borderRadius: `calc(${card.borderRadius} - 4px)`,
                  }}
                >
                  {/* Subtle Curved Accent Line */}
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-white/20 rounded-full blur-sm pointer-events-none" />

                  {/* Card Title Text */}
                  <h3
                    className="font-heading text-xs sm:text-xs lg:text-sm font-extrabold leading-snug tracking-tight z-10"
                    style={{ color: card.textColor }}
                  >
                    {card.titleLine1}
                    <br />
                    {card.titleLine2}
                  </h3>
                </div>

                {/* Mascot Image */}
                <div className="absolute -top-23 sm:-top-25 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-44 sm:h-44 pointer-events-none drop-shadow-md flex items-center justify-center z-20">
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
      <div className="w-full overflow-hidden relative mt-8 sm:mt-10 py-2">
        <svg
          viewBox="0 0 1500 390"
          className="w-full h-auto min-w-[1500px] md:min-w-full block"
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
        </svg>
      </div>
    </section>
  );
}
