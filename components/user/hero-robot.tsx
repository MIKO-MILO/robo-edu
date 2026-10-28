"use client";

import Image from "next/image";

export default function HeroRobot() {
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[400px] aspect-[269/449] mx-auto flex items-center justify-center">
      {/* Decorative background glow behind robot */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-2xl opacity-50 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle, #8ED8FF 0%, #C9E9F6 70%, transparent 100%)",
        }}
      />

      {/* Floating Badges */}
      {/* <div className="absolute top-[10%] left-[-7%] z-20 animate-bounce transition-transform duration-1000" style={{ animationDuration: "3.5s" }}>
       <span className="inline-flex items-center gap-7 bg-white/95 backdrop-blur-md px-9 py-4 rounded-full text-xs sm:text-sm font-bold text-[#3D2900] shadow-lg border-2 border-[#3D2900]/20">
          ✨ Interactive
        </span>
      </div> */}

      {/* <div className="absolute bottom-[16%] right-[-4%] z-20 animate-pulse transition-transform duration-1000 pb-5" style={{ animationDuration: "4s" }}>
        <span className="inline-flex items-center gap-2 bg-[#FAF1CA] px-9 py-3 rounded-full text-xs sm:text-sm font-bold text-[#3D2900] neo-shadow border-2 border-[#3D2900]">
          🤖 Edu-Bot 3.0
        </span>
      </div> */}

      {/* Robot Wrapper */}
      <div className="relative w-full h-full">
        {/* Waving Hand (Shifted further right and slightly down) */}
        <div
          className="absolute z-0 pointer-events-none animate-waving-hand translate-x-12 sm:translate-x-14"
          style={{
            width: "52%",
            height: "40%",
            left: "63%", 
            top: "24%",
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

        {/* Robot Body (In Front) */}
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

        {/* Ellipse Shadow (Bayangan Elips Memanjang ke Kanan di Bawah Robot) */}
       {/* Ellipse Shadow (Diturunkan dan Dibuat Lebih Panjang ke Kanan) */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-[10%] rounded-[100%] bg-[#3D2900]/15 blur-[8px] pointer-events-none z-0 translate-x-[-45%] scale-x-125"
        />
      </div>
    </div>
  );
}