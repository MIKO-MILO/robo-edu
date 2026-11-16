import { SocialCard } from "./social-card";
import type { SocialMediaContact } from "@/types";

const DEFAULT_CONTACTS: SocialMediaContact[] = [
  {
    id: "whatsapp",
    platform: "WhatsApp",
    handle: "+62 812-3456-7890",
    description: "Respon cepat untuk pertanyaan produk, konsultasi, & bantuan teknis.",
    actionText: "Chat via WhatsApp",
    href: "https://wa.me/6281234567890",
    bgColorClass: "bg-accent-green",
    iconName: "message-circle",
  },
  {
    id: "email",
    platform: "Email Support",
    handle: "support@roboedu.id",
    description: "Untuk pengajuan garansi, pertanyaan pesanan, atau kerja sama resmi.",
    actionText: "Kirim Email",
    href: "mailto:support@roboedu.id",
    bgColorClass: "bg-accent-soft-blue",
    iconName: "mail",
  },
  {
    id: "instagram",
    platform: "Instagram",
    handle: "@roboedu.id",
    description: "Lihat galeri kreasi robotik anak-anak & update produk terbaru.",
    actionText: "Kunjungi Instagram",
    href: "https://instagram.com",
    bgColorClass: "bg-accent-pink",
    iconName: "instagram",
  },
  {
    id: "youtube",
    platform: "YouTube",
    handle: "RoboEdu Indonesia",
    description: "Tonton video tutorial panduan merakit robot & tips belajar coding.",
    actionText: "Tonton Video",
    href: "https://youtube.com",
    bgColorClass: "bg-accent-yellow",
    iconName: "youtube",
  },
];

export interface SocialSectionProps {
  items?: SocialMediaContact[];
}

export function SocialSection({ items = DEFAULT_CONTACTS }: SocialSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {items.map((contact) => (
        <SocialCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}