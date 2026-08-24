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
}

const cards: CardData[] = [
  {
    id: 1,
    titleLine1: "Aman & Sesuai",
    titleLine2: "Usia 6+",
    bgColor: "#C3CDF0",
    shadowColor: "#9EACDF",
    textColor: "#354272",
    mascotSrc: "/images/4.png",
    altText: "Maskot RoboEdu Usia 6+",
  },
  {
    id: 2,
    titleLine1: "Aman & Mudah",
    titleLine2: "Dirakit",
    bgColor: "#F4C4C8",
    shadowColor: "#DBADB1",
    textColor: "#66292E",
    mascotSrc: "/images/3.png",
    altText: "Maskot RoboEdu Mudah Dirakit",
  },
  {
    id: 3,
    titleLine1: "Melatih Logika &",
    titleLine2: "Kesabaran",
    bgColor: "#EFBFE1",
    shadowColor: "#D79BC5",
    textColor: "#79195C",
    mascotSrc: "/images/22.png",
    altText: "Maskot RoboEdu Logika & Kesabaran",
  },
  {
    id: 4,
    titleLine1: "Sukses Selesaikan",
    titleLine2: "Misi",
    bgColor: "#F5E8BA",
    shadowColor: "#D9CA97",
    textColor: "#684B0F",
    mascotSrc: "/images/11.png",
    altText: "Maskot RoboEdu Sukses Selesaikan Misi",
  },
];

export default function InfoCards() {
  return (
    <section className="relative bg-[#F1ECE0] pt-8 pb-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section Aligned to the Right */}
        <div className="flex justify-end items-center gap-1 sm:gap-2 mb-16 sm:mb-20 translate-x-9 sm:translate-x-19 mt-4 sm:mt-6">
          <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2900] tracking-tight pt-2 sm:pt-4 translate-x-3 sm:translate-x-4">
            Kenapa RoboEdu
          </h3>
          
          <div className="relative w-25 h-25 sm:w-30 sm:h-28 lg:w-32 lg:h-32 flex-shrink-0">
            <Image
              src="/images/5.png"
              alt="Tanda Tanya RoboEdu"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 4 Cards Grid - Uniform Sizes with Bottom-Right Shadow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
          {cards.map((card) => (
            <div key={card.id} className="relative flex flex-col items-center">
              {/* Card Container with Uniform Height & Right-Bottom Shadow */}
              <div
                className="relative w-full h-[180px] sm:h-[195px] rounded-[28px] pt-16 sm:pt-20 pb-6 px-4 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: card.bgColor,
                  boxShadow: `13px 15px 0px 0px ${card.shadowColor}`,
                }}
              >
                {/* Mascot Image Overflowing at Top Center */}
                <div className="absolute -top-24 sm:-top-25 left-1/2 -translate-x-1/2 w-40 h-40 sm:w-44 sm:h-44 pointer-events-none drop-shadow-sm flex items-center justify-center">
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

      {/* Bottom Wavy Carousel / Marquee Banner aligned directly to the ribbon center path */}
      <div className="w-full overflow-hidden relative mt-18 sm:mt-12 py-2">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-auto min-w-[1000px] md:min-w-full block"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Midline path exact center of the ribbon geometry */}
            <path
              id="robo-reference-wave-path"
              d="M -1440,215 C -1340,282.5 -1240,267.5 -1160,157.5 C -1070,32.5 -920,72.5 -810,172.5 C -700,272.5 -550,307.5 -450,232.5 C -340,152.5 -160,112.5 0,182.5 C 100,250 200,235 280,125 C 370,0 520,40 630,140 C 740,240 890,275 990,200 C 1100,120 1280,80 1440,150 C 1540,217.5 1640,202.5 1720,92.5 C 1810,-32.5 1960,7.5 2070,107.5 C 2180,207.5 2330,242.5 2430,167.5 C 2540,87.5 2720,47.5 2880,117.5"
              fill="none"
            />
          </defs>

          {/* Ribbon shape matching reference image */}
          <path
            d="M 0,175 C 100,240 200,225 280,115 C 370,-10 520,30 630,130 C 740,230 890,265 990,190 C 1100,110 1280,70 1440,140 L 1440,230 C 1280,160 1100,200 990,270 C 890,345 740,310 630,210 C 520,110 370,70 280,195 C 200,305 100,320 0,255 Z"
            fill="#6188D0"
          />

          {/* Animated Curved Text aligned to exact center */}
          <text
            dy="6"
            className="fill-white font-extrabold text-lg sm:text-xl tracking-[0.2em] lowercase font-heading select-none"
          >
            <textPath href="#robo-reference-wave-path" startOffset="0%">
              <animate
                attributeName="startOffset"
                from="-50%"
                to="0%"
                dur="20s"
                repeatCount="indefinite"
              />
              roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu &nbsp; • &nbsp; roboedu
            </textPath>
          </text>
        </svg>
      </div>
    </section>
  );
}