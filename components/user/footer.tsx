import Image from "next/image";
import Link from "next/link";
import CarouselLogo from "@/components/user/carousel-logo";

/**
 * Footer - Komponen footer utama untuk halaman user.
 *
 * Struktur:
 *  1. CarouselLogo  — marquee ticker strip (background kuning)
 *  2. Footer body   — 4 kolom: Maskot+Tagline, Jelajahi, Metode Pembayaran, Ikuti Kami
 *  3. Brand text    — teks "roboedu" besar di bawah (font Unbounded bold)
 *
 * Warna mengacu pada CSS variables di globals.css:
 *   --color-primary    → #2483D0  (background footer)
 *   --color-background → #F3EFE4  (teks / butter cream)
 */

/** Layout 3×3: baris 1 → DANA, BRI, BNI | baris 2 → GoPay, BCA, OVO | baris 3 → Mandiri, QRIS, CIMB */
const paymentRows = [
  [
    { src: "/assets/images/Dana.png", alt: "DANA" },
    { src: "/assets/images/BRI.png", alt: "Bank BRI" },
    { src: "/assets/images/BNI.png", alt: "BNI" },
  ],
  [
    { src: "/assets/images/gopay.png", alt: "GoPay" },
    { src: "/assets/images/BCA.png", alt: "BCA" },
    { src: "/assets/images/ovo-new.png", alt: "OVO" },
  ],
  [
    { src: "/assets/images/Mandiri.png", alt: "Mandiri" },
    { src: "/assets/images/QRIS.png", alt: "QRIS" },
    { src: "/assets/images/cimb-new.png", alt: "CIMB" },
  ],
];

const jelajahiLinks = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Produk", href: "/product" },
  { label: "Membership", href: "/membership" },
  { label: "Kontak", href: "/contact" },
  { label: "Profil Saya", href: "/profile" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.8rem] h-[1.8rem]">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[1.8rem] h-[1.8rem]">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.8rem] h-[1.8rem]">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.8rem] h-[1.8rem]">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
      </svg>
    ),
  },
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
      <div className="w-full pt-14 pb-10 z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 w-full px-10 md:px-20 items-start">

          {/* Column 1 — Maskot + Tagline (geser ke kiri, kurangi col-span) */}
          <div className="md:col-span-3 flex flex-row gap-5 items-end">
            <div className="relative shrink-0" style={{ width: "202px", height: "202.87px" }}>
              <Image
                src="/assets/svg/maskot.svg"
                alt="RoboEdu Maskot"
                fill
                className="object-contain object-bottom"
              />
            </div>
            <p
              className="font-medium leading-[160%] pb-2"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.9rem, 1.2vw, 1.1rem)",
                color: "var(--color-accent-butter)",
              }}
            >
              Dunia mainan robot lucu dan edukatif. Bermain seru, imajinasi melesat!
            </p>
          </div>

          {/* Column 2 — Jelajahi */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <h3
              className="font-semibold leading-[130%] tracking-[-0.03em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)",
                color: "var(--color-accent-butter)",
              }}
            >
              Jelajahi
            </h3>
            {jelajahiLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="leading-[200%] transition-opacity duration-200 hover:opacity-70"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.85rem, 1.1vw, 1.05rem)",
                  color: "var(--color-accent-butter)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3 — Metode Pembayaran */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h3
              className="font-semibold leading-[130%] tracking-[-0.03em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)",
                color: "var(--color-accent-butter)",
              }}
            >
              Metode Pembayaran
            </h3>
            {/* 3 baris × 3 kolom — logo asli berwarna, ukuran proper */}
            <div className="flex flex-col gap-4">
              {paymentRows.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-6">
                  {row.map((method) => (
                    <div
                      key={method.alt}
                      className="flex items-center justify-center"
                    >
                      <Image
                        src={method.src}
                        alt={method.alt}
                        width={120}
                        height={40}
                        className="w-auto h-[3rem] object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Column 4 — Ikuti Kami */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h3
              className="font-semibold leading-[130%] tracking-[-0.03em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 1.5vw, 1.5rem)",
                color: "var(--color-accent-butter)",
              }}
            >
              Ikuti Kami
            </h3>
            <div className="flex flex-row flex-wrap gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{ color: "var(--color-accent-butter)" }}
                >
                  {social.icon}
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
          containerType: "inline-size",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(80px, 18cqw, 324px)",
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
