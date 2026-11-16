import type { Metadata } from "next";
import { ContactHeroSection, ContactMainSection } from "@/components/user/contact";
import { getAllSettings } from "@/src/lib/services/settings-service";
import type { SocialMediaContact } from "@/types";

export const metadata: Metadata = {
  title: "Hubungi Kami | RoboEdu - Kit Robotika Edukasi & Sparepart",
  description:
    "Hubungi tim RoboEdu Indonesia via WhatsApp, Email, Instagram, YouTube, atau kirim pesan langsung untuk pertanyaan produk, bantuan teknis, dan pesanan sekolah/institusi.",
};

/** Map platform value from DB → UI metadata for SocialCard. */
const PLATFORM_UI: Record<
  string,
  Pick<SocialMediaContact, "platform" | "description" | "actionText" | "bgColorClass" | "iconName">
> = {
  whatsapp: {
    platform: "WhatsApp",
    description: "Respon cepat untuk pertanyaan produk, konsultasi, & bantuan teknis.",
    actionText: "Chat via WhatsApp",
    bgColorClass: "bg-accent-green",
    iconName: "message-circle",
  },
  email: {
    platform: "Email Support",
    description: "Untuk pengajuan garansi, pertanyaan pesanan, atau kerja sama resmi.",
    actionText: "Kirim Email",
    bgColorClass: "bg-accent-soft-blue",
    iconName: "mail",
  },
  instagram: {
    platform: "Instagram",
    description: "Lihat galeri kreasi robotik anak-anak & update produk terbaru.",
    actionText: "Kunjungi Instagram",
    bgColorClass: "bg-accent-pink",
    iconName: "instagram",
  },
  youtube: {
    platform: "YouTube",
    description: "Tonton video tutorial panduan merakit robot & tips belajar coding.",
    actionText: "Tonton Video",
    bgColorClass: "bg-accent-yellow",
    iconName: "youtube",
  },
  tiktok: {
    platform: "TikTok",
    description: "Konten edukasi robotika singkat & seru untuk pelajar.",
    actionText: "Kunjungi TikTok",
    bgColorClass: "bg-accent-yellow",
    iconName: "youtube",
  },
  facebook: {
    platform: "Facebook",
    description: "Ikuti komunitas & update terbaru RoboEdu di Facebook.",
    actionText: "Kunjungi Facebook",
    bgColorClass: "bg-accent-soft-blue",
    iconName: "message-circle",
  },
  twitter: {
    platform: "Twitter / X",
    description: "Update cepat, promo, & diskusi produk robotika.",
    actionText: "Kunjungi Twitter",
    bgColorClass: "bg-accent-soft-blue",
    iconName: "message-circle",
  },
  linkedin: {
    platform: "LinkedIn",
    description: "Profil resmi & kerja sama institusional RoboEdu.",
    actionText: "Kunjungi LinkedIn",
    bgColorClass: "bg-accent-soft-blue",
    iconName: "message-circle",
  },
};

function buildSocialContacts(
  raw: string | undefined,
): SocialMediaContact[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { platform: string; url: string }[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const contacts: SocialMediaContact[] = parsed
      .filter((item) => item.platform && item.url)
      .map((item) => {
        const ui = PLATFORM_UI[item.platform.toLowerCase()];
        return {
          id: item.platform,
          platform: ui?.platform ?? item.platform,
          handle: item.url,
          description: ui?.description ?? "",
          actionText: ui?.actionText ?? "Kunjungi",
          href: item.url,
          bgColorClass: ui?.bgColorClass ?? "bg-accent-soft-blue",
          iconName: ui?.iconName ?? "message-circle",
        };
      });

    return contacts.length > 0 ? contacts : null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  let settings: Record<string, string> = {};
  try {
    settings = await getAllSettings();
  } catch {
    // DB unavailable — render with fallback gracefully
  }

  const socialContacts = buildSocialContacts(settings.store_social_links);

  const contactInfo = {
    email: settings.store_email ?? "",
    phone: settings.store_phone ?? "",
    address: settings.store_address ?? "",
  };

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* 1. Hero Section */}
      <ContactHeroSection />

      {/* 2. Main Section */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <ContactMainSection
          socialContacts={socialContacts}
          contactInfo={contactInfo}
        />
      </div>
    </main>
  );
}