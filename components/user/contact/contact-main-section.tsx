import { SocialSection } from "./social-section";
import { ContactForm } from "./contact-form";

export function ContactMainSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-24 bg-background border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-12 items-start">
        {/* Left Column: 4 Social Media Cards with Header "Kunjungi Kami" */}
        <div className="xl:col-span-6 w-full min-w-0">
          <SocialSection />
        </div>

        {/* Right Column: Header "atau Kirim Pesan!" + Contact Form */}
        <div className="xl:col-span-6 w-full min-w-0 flex flex-col gap-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
            atau Kirim Pesan!
          </h2>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
