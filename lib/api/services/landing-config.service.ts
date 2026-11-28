/**
 * Client-side service for the landing page CMS admin API.
 * Mirrors the pattern used by settingsService.
 */
import type {
  LandingPageFullConfig,
  LandingHeroConfig,
  LandingAboutConfig,
  LandingInfoCardsConfig,
  LandingMarqueeConfig,
  LandingVideoDemoConfig,
  LandingFAQConfig,
} from "@/src/lib/landing/defaults";

export type LandingConfigPatch = Partial<{
  hero:      LandingHeroConfig;
  about:     LandingAboutConfig;
  infoCards: LandingInfoCardsConfig;
  marquee:   LandingMarqueeConfig;
  videoDemo: LandingVideoDemoConfig;
  faq:       LandingFAQConfig;
}>;

async function getConfig(): Promise<{ success: true; data: LandingPageFullConfig }> {
  const res = await fetch("/api/admin/landing-config", { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Gagal memuat konfigurasi landing page.");
  }
  return res.json() as Promise<{ success: true; data: LandingPageFullConfig }>;
}

async function patchConfig(
  patch: LandingConfigPatch,
): Promise<{ success: true; data: LandingPageFullConfig }> {
  const res = await fetch("/api/admin/landing-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Gagal menyimpan konfigurasi landing page.");
  }
  return res.json() as Promise<{ success: true; data: LandingPageFullConfig }>;
}

export const landingConfigService = { getConfig, patchConfig };
