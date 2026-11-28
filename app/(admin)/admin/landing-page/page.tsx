"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HeroEditorSection } from "@/components/admin/landing/hero-section";
import { AboutEditorSection } from "@/components/admin/landing/about-section";
import { InfoCardsEditorSection } from "@/components/admin/landing/info-cards-section";
import { MarqueeEditorSection } from "@/components/admin/landing/marquee-section";
<<<<<<< Updated upstream
import { VouchersOrderSection } from "@/components/admin/landing/vouchers-order-section";
import { ReviewsOrderSection } from "@/components/admin/landing/reviews-order-section";

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
=======
import { VideoDemoEditorSection } from "@/components/admin/landing/video-demo-section";
import { FAQEditorSection } from "@/components/admin/landing/faq-section";

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ticket 38: Hero, About, InfoCards, Marquee
// ticket 39: VideoDemo, FAQ
>>>>>>> Stashed changes
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "hero",      label: "Hero" },
  { key: "about",     label: "About" },
  { key: "infoCards", label: "Info Cards" },
  { key: "marquee",   label: "Marquee" },
<<<<<<< Updated upstream
  { key: "vouchers",  label: "Vouchers" },
  { key: "reviews",   label: "Reviews" },
=======
  { key: "videoDemo", label: "Video Demo" },
  { key: "faq",       label: "FAQ" },
>>>>>>> Stashed changes
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminLandingPageCMS() {
  const [activeTab, setActiveTab] = useState<TabKey>("hero");

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">
          Kelola Landing Page
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Ubah konten teks halaman utama (beranda) secara langsung. Simpan = langsung tampil ke pengunjung.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer",
              activeTab === tab.key
                ? "bg-primary text-primary-100 border border-foreground shadow-xs"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active section editor */}
      {activeTab === "hero"      && <HeroEditorSection />}
      {activeTab === "about"     && <AboutEditorSection />}
      {activeTab === "infoCards" && <InfoCardsEditorSection />}
      {activeTab === "marquee"   && <MarqueeEditorSection />}
<<<<<<< Updated upstream
      {activeTab === "vouchers"  && <VouchersOrderSection />}
      {activeTab === "reviews"   && <ReviewsOrderSection />}
=======
      {activeTab === "videoDemo" && <VideoDemoEditorSection />}
      {activeTab === "faq"       && <FAQEditorSection />}
>>>>>>> Stashed changes
    </div>
  );
}
