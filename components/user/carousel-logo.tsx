import Image from "next/image";

/**
 * CarouselLogo - Running marquee / ticker strip yang menampilkan
 * teks "roboedu" dan logo Roboedu secara berulang dari kiri ke kanan.
 *
 * Warna mengacu pada CSS variables yang didefinisikan di globals.css:
 *   - Background : --color-accent-yellow (#FFF37E)
 *   - Teks       : --color-primary       (#2483D0)
 */
const ITEMS_PER_GROUP = 6;

function MarqueeItems() {
  return (
    <>
      {Array.from({ length: ITEMS_PER_GROUP }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <span
            className="font-body text-[24px] font-semibold leading-none"
            style={{ color: "var(--color-primary)" }}
          >
            roboedu
          </span>
          <Image
            src="/assets/svg/logo-biru.svg"
            alt="Roboedu Logo"
            width={27}
            height={30}
            className="object-contain"
          />
        </div>
      ))}
    </>
  );
}

<<<<<<< HEAD
=======
/**
 * CarouselLogo - Running marquee / ticker strip yang menampilkan
 * teks "roboedu" dan logo Roboedu secara berulang dari kiri ke kanan.
 *
 * Warna mengacu pada CSS variables yang didefinisikan di globals.css:
 *   - Background : --color-accent-yellow (#FFF37E)
 *   - Teks       : --color-primary       (#2483D0)
 */
>>>>>>> origin/frontend-contact
export default function CarouselLogo() {
  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 20s linear infinite;
        }
      `}</style>

      <div
        className="w-full h-14 overflow-hidden flex items-center"
        style={{ backgroundColor: "var(--color-accent-butter)" }}
      >
        <div className="w-full h-full overflow-hidden whitespace-nowrap flex items-center">
          <div className="marquee-track flex items-center w-max">
            <div className="flex items-center gap-8 pr-8">
              <MarqueeItems />
            </div>
            <div className="flex items-center gap-8 pr-8">
              <MarqueeItems />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
