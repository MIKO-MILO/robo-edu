import { ContactSection } from "@/components/admin/contact/contact-section";
import { SocialLinksSection } from "@/components/admin/contact/social-links-section";

export const metadata = {
  title: "Kelola Kontak | Admin",
};

export default function AdminContactPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          Kelola Kontak
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Atur email, nomor telepon, alamat toko, dan tautan media sosial.
        </p>
      </div>

      {/* Sections */}
      <ContactSection />
      <SocialLinksSection />
    </div>
  );
}
