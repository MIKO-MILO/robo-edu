import { SocialSection } from "./social-section";
import { ContactForm } from "./contact-form";

export function ContactMainSection() {
  return (
    <section className="w-full py-16 sm:py-24 bg-background border-b-2 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: 4 Social Media Contact Cards */}
        <div className="lg:col-span-6">
          <SocialSection />
        </div>

        {/* Right Column: Interactive Message Form */}
        <div className="lg:col-span-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
