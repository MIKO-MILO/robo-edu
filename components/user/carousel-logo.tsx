import Image from "next/image";

/**
 * CarouselLogo
 * ------------
 * Marquee ticker strip — "roboedu" + logo mengalir kiri ke kanan tanpa henti.
 *
 * Teknik seamless loop:
 *   Track = Copy A + Copy B (identik).
 *   Animasi: translateX(0) → translateX(-50%).
 *   Saat -50% tercapai, browser reset ke 0 — tidak ada lompatan visual
 *   karena Copy B persis menyambung Copy A.
 *
 * Keyframe `marquee-scroll` & class `animate-marquee` didefinisikan
 * di globals.css agar tidak ada <style> inline di JSX.
 *
 * ITEMS_PER_GROUP = 12 → satu copy ≈ 1 400px, selalu > viewport terlebar.
 */

const ITEMS_PER_GROUP = 12;

/**
 * Satu set item marquee.
 * aria-hidden: konten dekoratif, tidak perlu dibaca screen reader dua kali.
 */
function MarqueeGroup() {
  return (
    <div className="flex shrink-0 items-center gap-10" aria-hidden="true">
      {Array.from({ length: ITEMS_PER_GROUP }).map((_, i) => (
        <div key={i} className="flex shrink-0 items-center gap-3">
          <span className="select-none font-body text-[22px] font-semibold leading-none text-primary">
            roboedu
          </span>
          <Image
            src="/assets/svg/logo-biru.svg"
            alt=""
            width={24}
            height={27}
            className="shrink-0 object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default function CarouselLogo() {
  return (
    /**
     * Lapisan luar: overflow-hidden menahan track yang melampaui batas.
     * group/marquee → pause-on-hover via Tailwind group variant.
     */
    <div
      className="group/marquee w-full h-14 overflow-hidden flex items-center bg-accent-butter"
      aria-label="Roboedu brand ticker"
    >
      {/**
       * Track: berisi Copy A + Copy B.
       * - animate-marquee  → keyframe translateX(0 → -50%) dari globals.css
       * - flex-nowrap      → item tidak pernah wrap ke baris baru
       * - w-max            → lebar track = total konten, bukan lebar container
       * - group-hover/marquee → pause animasi saat hover
       */}
      <div className="animate-marquee flex w-max flex-nowrap items-center gap-10 group-hover/marquee:[animation-play-state:paused]">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
}
