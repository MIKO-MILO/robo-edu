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

export default function ICardsInfo() {
  return (
    <section className="relative bg-[#F3EFE4] pt-2 sm:pt-8 pb-4 sm:pb-8 overflow-hidden">
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
    </section>
  );
}
