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
    // Sudut tumpul diagonal (kiri-atas & kanan-bawah membulat lebar)
    borderRadius: "44px 20px 44px 20px",
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
    // Sudut tumpul diagonal berlawanan
    borderRadius: "20px 44px 20px 44px",
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
    // Lengkungan tumpul halus di bagian atas
    borderRadius: "48px 48px 24px 24px",
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
    // Lengkungan tumpul halus di bagian bawah
    borderRadius: "24px 24px 48px 48px",
  },
];

export default function InfoCards() {
  return (
    <section className="relative bg-[#F1ECE0] pt-8 pb-16 overflow-hidden">
      {/* Dekorasi Gear 1 */}
      <div className="absolute top-0 left-0 w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96 pointer-events-none z-0">
        <Image
          src="/images/gear1.png"
          alt="Dekorasi Gear Kiri"
          fill
          className="object-contain object-top-left"
          priority
        />
      </div>

      {/* Dekorasi Gear 2 */}
      <div className="absolute top-6 sm:top-10 lg:top-12 right-0 w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56 pointer-events-none z-0">
        <Image
          src="/images/gear2.png"
          alt="Dekorasi Gear Kanan"
          fill
          className="object-contain object-top-right"
          priority
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="w-full flex justify-center items-center gap-0 sm:gap-1 mb-16 sm:mb-20 mt-5 sm:mt-11 mx-auto translate-x-8 sm:translate-x-16 lg:translate-x-20 translate-y-4 sm:translate-y-6">
          <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight pt-4 sm:pt-6 translate-x-4 sm:translate-x-8 translate-y-3 sm:translate-y-4">
            Kenapa RoboEdu
          </h3>

          <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 flex-shrink-0 -translate-y-2 sm:translate-y-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
          {cards.map((card) => (
            <div key={card.id} className="relative flex flex-col items-center group">
              <div
                className="relative w-full h-[190px] sm:h-[210px] border-[5px] border-white pt-16 sm:pt-20 pb-6 px-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  backgroundColor: card.bgColor,
                  borderRadius: card.borderRadius,
                  boxShadow: `0 16px 30px -6px ${card.shadowColor}77, 0 6px 12px -4px rgba(0, 0, 0, 0.08)`,
                }}
              >
                {/* Mascot Image */}
                <div className="absolute -top-24 sm:-top-26 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-44 sm:h-44 pointer-events-none drop-shadow-md flex items-center justify-center">
                  <Image
                    src={card.mascotSrc}
                    alt={card.altText}
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>

                {/* Card Title Text */}
                <h3
                  className="font-heading text-sm sm:text-base lg:text-lg font-extrabold leading-snug tracking-tight"
                  style={{ color: card.textColor }}
                >
                  {card.titleLine1}
                  <br />
                  {card.titleLine2}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Wavy Banner */}
      <div className="w-full overflow-hidden relative mt-4 sm:mt-6 py-2">
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
            stroke="#EFD265"
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
            stroke="#EFD265"
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