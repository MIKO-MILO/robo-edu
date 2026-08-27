import { MessageCircle, Mail } from "lucide-react";
import { SocialCard } from "./social-card";
import type { SocialMediaContact } from "@/types";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

export function SocialSection() {
  const contacts: Array<{
    contact: SocialMediaContact;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      contact: {
        id: "whatsapp",
        platform: "WhatsApp",
        handle: "+62 812-3456-7890",
        description: "Respon cepat untuk pertanyaan produk, konsultasi, & bantuan teknis.",
        actionText: "Chat via WhatsApp",
        href: "https://wa.me/6281234567890",
        bgColorClass: "bg-accent-green",
        iconName: "message-circle",
      },
      icon: MessageCircle,
    },
    {
      contact: {
        id: "email",
        platform: "Email Support",
        handle: "support@roboedu.id",
        description: "Untuk pengajuan garansi, pertanyaan pesanan, atau kerja sama resmi.",
        actionText: "Kirim Email",
        href: "mailto:support@roboedu.id",
        bgColorClass: "bg-accent-soft-blue",
        iconName: "mail",
      },
      icon: Mail,
    },
    {
      contact: {
        id: "instagram",
        platform: "Instagram",
        handle: "@roboedu.id",
        description: "Lihat galeri kreasi robotik anak-anak & update produk terbaru.",
        actionText: "Kunjungi Instagram",
        href: "https://instagram.com",
        bgColorClass: "bg-accent-pink",
        iconName: "instagram",
      },
      icon: InstagramIcon,
    },
    {
      contact: {
        id: "youtube",
        platform: "YouTube",
        handle: "RoboEdu Indonesia",
        description: "Tonton video tutorial panduan merakit robot & tips belajar coding.",
        actionText: "Tonton Video",
        href: "https://youtube.com",
        bgColorClass: "bg-accent-yellow",
        iconName: "youtube",
      },
      icon: YoutubeIcon,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-body font-bold text-xs uppercase tracking-widest text-primary bg-accent-yellow px-3.5 py-1 rounded-full border-2 border-foreground neo-shadow-icon self-start">
          SALURAN RESMI
        </span>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
          Kanal Komunikasi Kami
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Pilih kanal komunikasi yang paling nyaman bagi Anda untuk terhubung langsung dengan tim RoboEdu.
        </p>
      </div>

      {/* 4 Social Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contacts.map(({ contact, icon }) => (
          <SocialCard key={contact.id} contact={contact} icon={icon} />
        ))}
      </div>
    </div>
  );
}
