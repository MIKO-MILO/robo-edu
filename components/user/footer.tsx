import Image from "next/image";
import Link from "next/link";
import CarouselLogo from "@/components/user/carousel-logo";

/**
 * Footer - Komponen footer utama untuk halaman user.
 *
 * Struktur:
 *  1. CarouselLogo  — marquee ticker strip (background kuning)
 *  2. Footer body   — 4 kolom: Jelajahi Roboedu, Layanan, Metode Pembayaran, Ikuti Kami
 *  3. Brand text    — teks "roboedu" besar di bawah (font Unbounded bold 256px)
 *
 * Warna mengacu pada CSS variables di globals.css:
 *   --color-primary    → #2483D0  (background footer)
 *   --color-background → #F3EFE4  (teks / butter cream)
 */

const paymentMethods = [
  { src: "/assets/images/BNI.png", alt: "BNI" },
  { src: "/assets/images/BRI.png", alt: "Bank BRI" },
  { src: "/assets/images/BCA.png", alt: "BCA" },
  { src: "/assets/images/Dana.png", alt: "DANA" },
  { src: "/assets/images/Spay.png", alt: "ShopeePay" },
  { src: "/assets/images/Google-pay.png", alt: "Google Pay" },
  { src: "/assets/images/gopay.png", alt: "GoPay" },
  { src: "/assets/images/QRIS.png", alt: "QRIS" },
  { src: "/assets/images/Mandiri.png", alt: "Mandiri" },
];

const jelajahiLinks = [
  { label: "Fitur 1", href: "#" },
  { label: "Fitur 2", href: "#" },
  { label: "Fitur 3", href: "#" },
  { label: "Fitur 4", href: "#" },
  { label: "Fitur 5", href: "#" },
  { label: "Fitur 6", href: "#" },
];

const layananLinks = [
  { label: "Layanan 1", href: "#" },
  { label: "Layanan 2", href: "#" },
  { label: "Layanan 3", href: "#" },
  { label: "Layanan 4", href: "#" },
  { label: "Layanan 5", href: "#" },
  { label: "Layanan 6", href: "#" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer
      className="w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* ── 1. Marquee Ticker Strip ─────────────────────────── */}
      <CarouselLogo />

      {/* ── 2. Footer Body ──────────────────────────────────── */}
      <div className="w-full px-8 md:px-16 pt-16 pb-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-[1440px] mx-auto">

          {/* Column 1 — Jelajahi Roboedu */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3
              className="text-[24px] font-semibold leading-[130%] tracking-[-0.06em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-accent-butter)",
              }}
            >
              Jelajahi Roboedu
            </h3>
            {jelajahiLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[16px] leading-[160%] transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-accent-butter)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 2 — Layanan */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h3
              className="text-[24px] font-semibold leading-[130%] tracking-[-0.06em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-accent-butter)",
              }}
            >
              Layanan
            </h3>
            {layananLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[16px] leading-[160%] transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-accent-butter)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3 — Metode Pembayaran */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <h3
              className="text-[24px] font-semibold leading-[130%] tracking-[-0.06em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-accent-butter)",
              }}
            >
              Metode Pembayaran
            </h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-5 items-center">
              {paymentMethods.map((method) => (
                <div
                  key={method.alt}
                  className="flex items-center justify-start"
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={80}
                    height={32}
                    className="h-8 w-auto object-contain"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Column 4 — Ikuti Kami */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3
              className="text-[24px] font-semibold leading-[130%] tracking-[-0.06em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--color-accent-butter)",
              }}
            >
              Ikuti Kami
            </h3>
            <div className="flex flex-col gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-[16px] leading-[160%] transition-opacity duration-200 hover:opacity-70"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-accent-butter)",
                  }}
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Brand Text — "roboedu" besar ─────────────────── */}
      <div
        className="w-full flex justify-center items-end overflow-hidden pb-16 pt-12"
        style={{
          lineHeight: 0,
          containerType: "inline-size"
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(80px, 18cqw, 324px)",    //pakai cqw, bukan vw
            fontWeight: 700,
            color: "var(--color-accent-butter)",
            letterSpacing: "-0.03em",
            lineHeight: "0.85",
            display: "block",
            userSelect: "none",
          }}
        >
          roboedu
        </span>
      </div>
    </footer>
  );
}

