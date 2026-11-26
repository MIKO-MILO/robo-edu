import Image from "next/image";
import Link from "next/link";
import CarouselLogo from "@/components/user/carousel-logo";

/**
 * Footer — Komponen footer utama untuk halaman user.
 *
 * Layout responsive:
 *   Mobile  (<768px)  : stack vertikal — maskot & tagline berdampingan (tagline di tengah-tengah secara vertikal terhadap robot),
 *                       Jelajahi 2 kolom (3 kiri, 2 kanan).
 *   Tablet  (768-1023): 4 kolom horizontal dengan gap proporsional, tanpa ada bagian yang kepotong.
 *   Laptop  (1024-1439): 4 kolom, maskot & tagline proporsional sejajar menu lainnya.
 *   Desktop (>=1440px): Layout sesuai referensi Figma — Maskot & Tagline horizontal di sebelah kiri, tagline pas di tengah-tengah tinggi maskot.
 */

/* ─── Data ───────────────────────────────────────────────── */

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
      <div className="w-full px-5 sm:px-8 md:px-5 lg:px-8 xl:px-16 2xl:px-20 pt-8 sm:pt-10 md:pt-12 xl:pt-14 pb-6">
        {/*
          Mobile  (<md)        : flex-col (stack vertikal)
          Tablet  (md)         : flex-row dengan gap rapat/proporsional agar tidak kepotong (md:gap-4 lg:gap-8)
          Laptop/Desktop (xl+) : flex-row justify-between sesuai gambar referensi 1440px
        */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4 lg:gap-8 xl:gap-12 2xl:gap-16">

          {/* ── Col 1 — Maskot + Tagline ────────────────────── */}
          {/*
            - Mobile (<md): flex-row items-center agar tagline berada di tengah-tengah tinggi robot
            - Tablet (md to lg): flex-col items-start
            - Desktop (xl+ / 1440px): flex-row items-center berdampingan horizontal dan tagline pas di tengah-tengah tinggi robot
          */}
         
{/* ── Col 1 — Maskot + Tagline ────────────────────── */}
<div className="flex flex-row md:flex-col xl:flex-row items-center md:items-center xl:items-center gap-3 sm:gap-4 lg:gap-5 shrink-0 max-w-[22rem] sm:max-w-[26rem] md:max-w-[11.5rem] lg:max-w-[14.5rem] xl:max-w-[26rem] 2xl:max-w-[28rem]">

  {/* Maskot Robot */}
  <div
    className="relative shrink-0"
    style={{
      width: "clamp(7.5rem, 14vw, 12.5rem)",
      height: "clamp(7.5rem, 14vw, 12.5rem)",
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

  {/* Tagline */}
  <p
    className="font-medium leading-[1.6]"
    style={{
      fontFamily: "var(--font-body)",
      fontSize: "clamp(0.825rem, 1.15vw, 1.15rem)",
      color: "var(--color-accent-butter)",
    }}
  >
    Dunia mainan robot lucu dan edukatif. Bermain seru, imajinasi melesat!
  </p>

</div>


          {/* ── Col 2 — Jelajahi ────────────────────────────── */}
          <nav aria-label="Navigasi Footer" className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-3 md:mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1.05rem, 1.4vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Jelajahi
            </h3>
            {/* Mobile: 3 di kiri, 2 di kanan (grid 2 col x 3 row flow col) */}
            <ul className="grid grid-cols-2 grid-rows-3 grid-flow-col gap-x-8 md:flex md:flex-col md:gap-x-0">
              {jelajahiLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-opacity duration-200 hover:opacity-70 block"
                    style={{
                      fontFamily:  "var(--font-body)",
                      fontSize:    "clamp(0.825rem, 1.1vw, 1.15rem)",
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
          <div className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-3 md:mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1.05rem, 1.4vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Metode Pembayaran
            </h3>

            {/* Grid 3 kolom logo payment */}
            <div
              className="grid grid-cols-3 gap-y-2 sm:gap-y-2.5 md:gap-y-2 lg:gap-y-3"
              style={{ columnGap: "clamp(0.5rem, 1.4vw, 1.75rem)" }}
            >
              {paymentRows.flat().map((method) => (
                <div
                  key={method.alt}
                  className="flex items-center justify-start"
                  style={{ height: "clamp(1.6rem, 2.2vw, 2.6rem)" }}
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={82}
                    height={46}
                    className="h-full w-auto object-contain"
                    style={{ maxWidth: "clamp(2.8rem, 4.4vw, 4.8rem)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 4 — Ikuti Kami ──────────────────────────── */}
          <div className="flex flex-col shrink-0">
            <h3
              className="font-medium leading-[1.3] tracking-[-0.02em] mb-3 md:mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize:   "clamp(1.05rem, 1.4vw, 1.5rem)",
                color:      "var(--color-accent-butter)",
              }}
            >
              Ikuti Kami
            </h3>

            <div className="flex flex-row gap-2.5 sm:gap-3 md:gap-2 lg:gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={`${social.label} roboedu`}
                  className="flex items-center justify-center rounded-full overflow-hidden transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{
                    width:  "clamp(1.9rem, 2.3vw, 2.5rem)",
                    height: "clamp(1.9rem, 2.3vw, 2.5rem)",
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
      <div
        className="w-full overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <div className="flex justify-center items-end pointer-events-none">
          <span
            className="translate-y-[12%] block"
            style={{
              fontFamily:    "var(--font-heading)",
              fontSize:      "clamp(3rem, 20cqw, 20.25rem)",
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
