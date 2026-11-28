/**
 * Default values untuk seluruh konten landing page.
 * Digunakan oleh:
 * - GET /api/admin/landing-config (fallback jika baris belum ada di DB)
 * - app/(user)/page.tsx (fallback props ke tiap section)
 *
 * Nilai-nilai ini mencerminkan konten hardcode yang sebelumnya ada di
 * masing-masing komponen section.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingHeroConfig {
  headline: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryUrl: string;
  ctaSecondaryLabel: string;
}

export const DEFAULT_HERO: LandingHeroConfig = {
  headline: "Rakit & Mainkan Robot Impian Anak",
  description:
    "Bantu si kecil belajar coding, elektronik, dan robotik dengan cara yang menyenangkan.",
  ctaPrimaryLabel: "Jelajahi Mainan Robot",
  ctaPrimaryUrl: "/product",
  ctaSecondaryLabel: "Tonton Demo",
};

// ─────────────────────────────────────────────────────────────────────────────
// About (ICardsInfo)
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingFeaturePoint {
  id: string | number;
  label: string;
}

export interface LandingAboutConfig {
  badgeLabel: string;
  titleMain: string;
  titleHighlight: string;
  description: string;
  /** Tepat 4 feature checklist */
  features: LandingFeaturePoint[];
}

export const DEFAULT_ABOUT: LandingAboutConfig = {
  badgeLabel: "Tentang Kami",
  titleMain: "Aman, Seru & Edukatif —",
  titleHighlight: "Impian Setiap Anak",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam",
  features: [
    { id: 1, label: "Learning & Fun" },
    { id: 2, label: "Aman Untuk Usia 6+" },
    { id: 3, label: "Modul IoT Interaktif" },
    { id: 4, label: "Mudah Dirakit (DIY)" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoCardsList
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingInfoCardConfig {
  id: string | number;
  title: string;
  description: string;
}

export type LandingInfoCardsConfig = LandingInfoCardConfig[];

export const DEFAULT_INFO_CARDS: LandingInfoCardsConfig = [
  { id: 1, title: "Aman Untuk Usia 6+", description: "Bahan ramah anak, tanpa sudut tajam, & teruji aman." },
  { id: 2, title: "Modul IoT Interaktif", description: "Belajar dasar sensor & teknologi dengan seru." },
  { id: 3, title: "Mudah Dirakit (DIY)", description: "Panduan visual interaktif untuk melatih logika anak." },
  { id: 4, title: "Kurikulum Edukatif", description: "Materi STEM interaktif pendukung daya pikir anak." },
];

// ─────────────────────────────────────────────────────────────────────────────
// TextMarquee
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingMarqueeConfig {
  items: string[];
}

export const DEFAULT_MARQUEE: LandingMarqueeConfig = {
  items: ["ROBOEDU", "INTERAKTIF", "KREATIF", "EDUKATIF"],
};

// ─────────────────────────────────────────────────────────────────────────────
// VideoDemo
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingVideoDemoConfig {
  title: string;
  description: string;
  thumbnailSrc: string;
  videoSrc: string;
}

export const DEFAULT_VIDEO_DEMO: LandingVideoDemoConfig = {
  title: "Merakit Robot Pertama",
  description:
    "Saksikan keseruan anak-anak belajar merakit robot dengan langkah-langkah yang mudah dipahami, interaktif, dan penuh keceriaan.",
  thumbnailSrc: "/images/foto.jpg",
  videoSrc: "/videos/demo.mp4",
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface LandingFAQPromoBanner {
  titlePrefix: string;
  description: string;
  /** Tepat 4 URL foto */
  photos: string[];
}

export interface LandingFAQConfig {
  title: string;
  description: string;
  promoBanner: LandingFAQPromoBanner;
  items: LandingFAQItem[];
}

export const DEFAULT_FAQ: LandingFAQConfig = {
  title: "Pertanyaan yang Sering Diajukan",
  description: "Punya pertanyaan mengenai mainan IoT RoboEdu? Temukan jawabannya di sini.",
  promoBanner: {
    titlePrefix: "Dapatkan Mainan IoT Edukatif RoboEdu",
    description: "Dapatkan paket lengkapnya hari ini dan mulai keseruan merakit robot!",
    photos: ["/images/foto.jpg", "/images/foto4.jpg", "/images/foto3.jpg", "/images/foto2.jpg"],
  },
  items: [
    {
      id: "faq-1",
      question: "Apakah mainan IoT RoboEdu aman untuk anak-anak?",
      answer:
        "Sangat aman! Semua komponen kit RoboEdu menggunakan bahan nonsilikon berkualitas tinggi tanpa sudut tajam, serta tidak memerlukan proses solder.",
    },
    {
      id: "faq-2",
      question: "Berapa usia minimal anak untuk memainkan Kit RoboEdu?",
      answer:
        "Kit mainan IoT ini dirancang untuk anak usia 6 tahun ke atas dengan modul rakitan interaktif yang ramah anak.",
    },
    {
      id: "faq-3",
      question: "Apakah kit ini memerlukan aplikasi smartphone?",
      answer:
        "Sebagian besar modul langsung beroperasi saat dinyalakan. Namun untuk fitur kontrol pintar IoT, Anda dapat mengunduh aplikasi gratis RoboEdu di Android dan iOS.",
    },
    {
      id: "faq-4",
      question: "Bagaimana jika ada komponen robot yang hilang atau rusak?",
      answer:
        "Kami menyediakan garansi penggantian suku cadang selama 30 hari serta menjual komponen cadangan terpisah.",
    },
    {
      id: "faq-5",
      question: "Berapa lama estimasi pengiriman paket RoboEdu?",
      answer:
        "Pengiriman diproses dalam 1x24 jam. Estimasi pengiriman untuk pulau Jawa adalah 1-3 hari kerja, sedangkan luar pulau Jawa 3-5 hari kerja.",
    },
    {
      id: "faq-6",
      question: "Apakah ada buku panduan dan panduan video perakitan?",
      answer:
        "Ya, setiap pembelian paket RoboEdu dilengkapi buku panduan cetak berwarna dan akses ke pustaka video panduan perakitan langkah demi langkah.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Full config shape (what the API returns / accepts)
// ─────────────────────────────────────────────────────────────────────────────
export interface LandingPageFullConfig {
  hero: LandingHeroConfig;
  about: LandingAboutConfig;
  infoCards: LandingInfoCardsConfig;
  marquee: LandingMarqueeConfig;
  videoDemo: LandingVideoDemoConfig;
  faq: LandingFAQConfig;
}

export const DEFAULT_LANDING_CONFIG: LandingPageFullConfig = {
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  infoCards: DEFAULT_INFO_CARDS,
  marquee: DEFAULT_MARQUEE,
  videoDemo: DEFAULT_VIDEO_DEMO,
  faq: DEFAULT_FAQ,
};

/** ID tetap untuk singleton row di tabel landing_page_config */
export const LANDING_CONFIG_ID = "singleton";
