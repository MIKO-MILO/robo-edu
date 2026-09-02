"use client";

import Image from "next/image";

export default function HeroRobot() {
  return (
    <div className="relative w-full max-w-[170px] min-[400px]:max-w-[190px] sm:max-w-[230px] md:max-w-[260px] lg:max-w-[290px] aspect-[269/449] mx-auto flex items-center justify-center">
      {/* Decorative background glow behind robot */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-2xl opacity-50 pointer-events-none -z-10 bg-accent-yellow/40"
      />

      {/* Robot Wrapper */}
      <div className="relative w-full h-full">
        {/* Waving Hand Container */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            width: "52%",
            height: "40%",
            left: "63%", 
            top: "24%",
            transform: "translateX(27%)",
          }}
        >
          {/* Waving Hand */}
          <div
            className="relative w-full h-full animate-waving-hand"
            style={{
              transformOrigin: "20% 82%",
            }}
          >
            <Image
              src="/images/hand.png"
              alt="RoboEdu Robot Waving Hand"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-contain object-right"
              priority
            />
          </div>
        </div>

        {/* Robot Body */}
        <div className="relative z-10 w-full h-full pointer-events-none">
          <Image
            src="/images/body.png"
            alt="RoboEdu Robot Body"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-contain filter drop-shadow-md"
            priority
          />
        </div>
      </div>
    </div>
  );
}