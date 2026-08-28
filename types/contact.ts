/**
 * contact.ts
 * ------------------------------------------------------------------
 * Tipe data untuk fitur kontak, pesan masukan, dan media sosial.
 * ------------------------------------------------------------------
 */

export interface ContactMessageRequestBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SocialMediaContact {
  id: string;
  platform: string;
  handle: string;
  description: string;
  actionText: string;
  href: string;
  bgColorClass: string;
  iconName: "message-circle" | "mail" | "instagram" | "youtube";
}
