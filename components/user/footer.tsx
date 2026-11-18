import Image from "next/image";
import Link from "next/link";
import CarouselLogo from "@/components/user/carousel-logo";

/**
 * Footer — Komponen footer utama untuk halaman user.
 *
 * Struktur:
 *  1. CarouselLogo  — marquee ticker strip (background kuning)
 *  2. Footer body   — 4 kolom: Maskot+Tagline, Jelajahi, Metode Pembayaran, Ikuti Kami
 *  3. Brand text    — teks "roboedu" besar di bawah (font Unbounded bold, butter cream)
 *
 * Design tokens (globals.css):
 *   --color-primary       → #2483D0  (background footer)
 *   --color-accent-butter → #FAF1CA  (teks & ikon di atas biru)
 *   --font-heading        → Unbounded (judul kolom & wordmark)
 *   --font-body           → Outfit    (body teks & link)
 *
 * Asset sosial: /assets/svg/{facebook,instagram,youtube,tiktok}.svg
 * Asset maskot: /assets/svg/maskot.svg
 * Asset payment: /assets/images/{dana,bri,bni,gopay,bca,ovo,mandiri,qris,cimb}-new.png
 */

/* ─── Data ───────────────────────────────────────────────── */

/** Grid 3×3: baris 1 → DANA, BRI, BNI | baris 2 → GoPay, BCA, OVO | baris 3 → Mandiri, QRIS, CIMB */
const paymentRows = [
  [
    { src: "/assets/images/dana-new.png",    alt: "DANA"     },
    { src: "/assets/images/bri-new.png",     alt: "Bank BRI" },
    { src: "/assets/images/bni-new.png",     alt: "BNI"      },
  ],
  [
    { src: "/assets/images/gopay-new.png",   alt: "GoPay"    },
    { src: "/assets/images/bca-new.png",     alt: "BCA"      },
    { src: "/assets/images/ovo-new.png",     alt: "OVO"      },
  ],
  [
    { src: "/assets/images/mandiri-new.png", alt: "Mandiri"  },
    { src: "/assets/images/qris-new.png",    alt: "QRIS"     },
    { src: "/assets/images/cimb-new.png",    alt: "CIMB"     },
  ],
] as const;

const jelajahiLinks = [
  { label: "Beranda",        href: "/"           },
  { label: "Katalog Produk", href: "/product"    },
  { label: "Membership",     href: "/membership" },
  { label: "Kontak",         href: "/contact"    },
  { label: "Profil Saya",    href: "/profile"    },
] as const;

const socialLinks = [
  { label: "Facebook",  href: "#", icon: "/assets/svg/facebook.svg"  },
  { label: "Instagram", href: "#", icon: "/assets/svg/instagram.svg" },
  { label: "YouTube",   href: "#", icon: "/assets/svg/youtube.svg"   },
  { label: "TikTok",    href: "#", icon: "/assets/svg/tiktok.svg"    },
] as const;

/* ─── Component ─────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer
      className="w-full flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {/* ── 1. Marquee Ticker Strip ───────────────────────────── */}
      <CarouselLogo />

      {/* ── 2. Footer Body ─────────────────────────────────────── */}
      {/*
        Figma spec (desktop 1440px):
          Maskot          : 202 × 202.87 px
          Tagline         : Outfit Medium 20px → 1.25rem
          Heading kolom   : Unbounded Medium 24px → 1.5rem
          Link Jelajahi   : Outfit Medium 20px → 1.25rem
          Payment logo    : 82 × 46 px
          Social icon     : ~40 × 40 px
        Semua di-clamp agar tetap proporsional di bawah/atas 1440px.
        Referensi clamp: nilai tengah dihitung sbg px/1440 × 100vw.
      */}
      <div className="w-full px-[clamp(1.5rem,5.5vw,5rem)] pt-14 pb-6">
        {/*
          Desktop  : flex-row + justify-between → 4 kolom tersebar kiri ↔ kanan
          Mobile   : flex-col, stack vertikal dengan gap seragam
        */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">

          {/* ── Col 1 — Maskot + Tagline ────────────────────── */}
          {/*
            Max-width col dibatasi agar tidak makan terlalu banyak ruang.
            Maskot: 202px di 1440 → 14vw. Tagline: 20px → 1.389vw ≈ 1.25rem max.
          */}
          {/* max-w: 280px→17.5rem, 440px→27.5rem */}
          <div className="flex flex-row items-end gap-[clamp(0.75rem,1.5vw,1.25rem)] shrink-0 max-w-[clamp(17.5rem,32vw,27.5rem)]">
            {/* Maskot: 100px→6.25rem min, 202px→12.625rem max */}
            <div
              className="relative shrink-0"
              style={{
                width:  "clamp(6.25rem, 14.03vw, 12.625rem)",
                height: "clamp(6.25rem, 14.09vw, 12.6875rem)",
              }}
            >
              <Image
                src="/assets/svg/maskot.svg"
                alt="RoboEdu Maskot"
                fill
                priority
                className="object-contain object-bottom drop-shadow-sm"
              />
            </div>

            {/* Tagline — Outfit Medium 20px Figma */}
            <p
              className="font-medium leading-[1.6] pb-2"
              style={{
                fontFamily: "var(--font-body)",
                fontSize:   "clamp(0.9rem, 1.389vw, 1.25rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Dunia mainan robot lucu dan edukatif. Bermain seru, imajinasi melesat!
            </p>
          </div>

          {/* ── Col 2 — Jelajahi ────────────────────────────── */}
          {/* Heading: Unbounded Medium 24px. Links: Outfit Medium 20px. */}
          <nav aria-label="Navigasi Footer" className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1rem, 1.667vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Jelajahi
            </h3>
            <ul className="flex flex-col">
              {jelajahiLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-opacity duration-200 hover:opacity-70 block"
                    style={{
                      fontFamily:  "var(--font-body)",
                      fontSize:    "clamp(0.9rem, 1.389vw, 1.25rem)",
                      fontWeight:  500,
                      lineHeight:  "2",
                      color:       "var(--color-accent-butter)",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Col 3 — Metode Pembayaran ───────────────────── */}
          {/* Heading: Unbounded Medium 24px. Logo: 82×46px Figma. */}
          <div className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1rem, 1.667vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Metode Pembayaran
            </h3>

            {/* Grid 3 kolom — logo 82×46px per Figma spec */}
            <div
              className="grid grid-cols-3 gap-y-[clamp(0.5rem,1vw,0.875rem)]"
              style={{ columnGap: "clamp(0.75rem,2.2vw,2rem)" }}
            >
              {paymentRows.flat().map((method) => (
                <div
                  key={method.alt}
                  className="flex items-center justify-start"
                  style={{ height: "clamp(1.875rem, 3.19vw, 2.875rem)" }}
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={82}
                    height={46}
                    className="h-full w-auto object-contain"
                    style={{ maxWidth: "clamp(3.5rem, 5.69vw, 5.125rem)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 4 — Ikuti Kami ──────────────────────────── */}
          {/* Heading: Unbounded Medium 24px. Icons: ~40px diameter. */}
          <div className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1rem, 1.667vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Ikuti Kami
            </h3>

            <div className="flex flex-row gap-[clamp(0.5rem,1.1vw,1rem)]">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={`${social.label} roboedu`}
                  className="flex items-center justify-center rounded-full overflow-hidden transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{
                    width:  "clamp(2rem, 2.78vw, 2.5rem)",
                    height: "clamp(2rem, 2.78vw, 2.5rem)",
                  }}
                >
                  <Image
                    src={social.icon}
                    alt={social.label}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. Giant "roboedu" Wordmark ─────────────────────────── */}
      {/*
        containerType inline-size membuat 18cqw relatif terhadap lebar footer,
        bukan viewport — sehingga wordmark selalu proporsional terhadap lebar
        footer itu sendiri (bukan layar secara keseluruhan).
        translate-y-[12%] menyebabkan huruf sedikit terpotong di bagian bawah,
        persis seperti referensi desain.
      */}
      <div
        className="w-full overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <div className="flex justify-center items-end pointer-events-none">
          <span
            className="translate-y-[12%] block"
            style={{
              fontFamily:    "var(--font-heading)",
              fontSize:      "clamp(5rem, 20cqw, 20.25rem)",
              fontWeight:    900,
              color:         "var(--color-accent-butter)",
              letterSpacing: "-0.03em",
              lineHeight:    1,
              userSelect:    "none",
              whiteSpace:    "nowrap",
            }}
          >
            roboedu
          </span>
        </div>
      </div>
    </footer>
  );
}
