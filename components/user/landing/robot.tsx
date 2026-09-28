"use client";

import Image from "next/image";

export default function HeroRobot() {
  return (
    /* Ukuran max-w & posisi robot tetap sama, hanya aspek tinggi dipotong dikit saja (449 -> 410) */
    <div className="relative w-full max-w-[220px] min-[400px]:max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[390px] aspect-[269/410] mx-auto flex items-center justify-center p-0 m-0">
      {/* Robot Container */}
      <div className="relative w-full h-full">
        {/* Left Hand (hand1.webp) */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            width: "33%",
            height: "33%",
            left: "-15%",
            top: "25%",
          }}
        >
          <div className="relative w-full h-full animate-waving-hand-left">
            <Image
              src="/images/hand1.webp"
              alt="Robot Left Hand"
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Hand (hand2.webp) */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            width: "40%",
            height: "40%",
            right: "-21%",
            top: "36%",
          }}
        >
          <div className="relative w-full h-full animate-waving-hand-right">
            <Image
              src="/images/hand2.webp"
              alt="Robot Right Hand"
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Robot Body (body.webp) */}
        <div className="relative z-10 w-full h-full pointer-events-none translate-y-3">
          <Image
            src="/images/body.webp"
            alt="RoboEdu Robot Body"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain filter drop-shadow-md"
            priority
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave-hand-left {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(-10deg);
          }
        }
        @keyframes wave-hand-right {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(10deg);
          }
        }
        .animate-waving-hand-left {
          animation: wave-hand-left 2.5s ease-in-out infinite;
          transform-origin: 90% 75%;
        }
        .animate-waving-hand-right {
          animation: wave-hand-right 2.5s ease-in-out infinite;
          transform-origin: 10% 75%;
        }
      `}</style>
    </div>
  );
}