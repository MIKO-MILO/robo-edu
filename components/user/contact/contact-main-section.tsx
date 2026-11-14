import { SocialSection } from "./social-section";
import { ContactForm } from "./contact-form";

export function ContactMainSection() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16 items-start">
        <SocialSection />
        <ContactForm />
      </div>
    </section>
  );
}
