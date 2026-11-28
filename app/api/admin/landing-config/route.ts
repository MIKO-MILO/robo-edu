import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { landingPageConfig } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import {
  DEFAULT_LANDING_CONFIG,
  LANDING_CONFIG_ID,
  type LandingPageFullConfig,
  type LandingHeroConfig,
  type LandingAboutConfig,
  type LandingInfoCardsConfig,
  type LandingMarqueeConfig,
  type LandingVideoDemoConfig,
  type LandingFAQConfig,
} from "@/src/lib/landing/defaults";

export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function rowToConfig(row: typeof landingPageConfig.$inferSelect): LandingPageFullConfig {
  return {
    hero:      (row.hero      as LandingHeroConfig       | null) ?? DEFAULT_LANDING_CONFIG.hero,
    about:     (row.about     as LandingAboutConfig      | null) ?? DEFAULT_LANDING_CONFIG.about,
    infoCards: (row.infoCards as LandingInfoCardsConfig  | null) ?? DEFAULT_LANDING_CONFIG.infoCards,
    marquee:   (row.marquee   as LandingMarqueeConfig    | null) ?? DEFAULT_LANDING_CONFIG.marquee,
    videoDemo: (row.videoDemo as LandingVideoDemoConfig  | null) ?? DEFAULT_LANDING_CONFIG.videoDemo,
    faq:       (row.faq       as LandingFAQConfig        | null) ?? DEFAULT_LANDING_CONFIG.faq,
  };
}

function validateHero(h: unknown): string[] {
  const errors: string[] = [];
  if (!h || typeof h !== "object") return ["hero harus berupa objek."];
  const obj = h as Record<string, unknown>;
  if (typeof obj.headline !== "string" || !obj.headline.trim())
    errors.push("hero.headline wajib diisi.");
  if (typeof obj.ctaPrimaryLabel !== "string" || !obj.ctaPrimaryLabel.trim())
    errors.push("hero.ctaPrimaryLabel wajib diisi.");
  if (typeof obj.ctaPrimaryUrl !== "string" || !obj.ctaPrimaryUrl.trim())
    errors.push("hero.ctaPrimaryUrl wajib diisi.");
  return errors;
}

function validateAbout(a: unknown): string[] {
  const errors: string[] = [];
  if (!a || typeof a !== "object") return ["about harus berupa objek."];
  const obj = a as Record<string, unknown>;
  if (typeof obj.badgeLabel !== "string" || !obj.badgeLabel.trim())
    errors.push("about.badgeLabel wajib diisi.");
  if (typeof obj.titleMain !== "string" || !obj.titleMain.trim())
    errors.push("about.titleMain wajib diisi.");
  if (!Array.isArray(obj.features) || (obj.features as unknown[]).length !== 4)
    errors.push("about.features harus berisi tepat 4 item.");
  return errors;
}

function validateInfoCards(cards: unknown): string[] {
  if (!Array.isArray(cards) || (cards as unknown[]).length !== 4)
    return ["infoCards harus berisi tepat 4 item."];
  return [];
}

function validateMarquee(m: unknown): string[] {
  if (!m || typeof m !== "object") return ["marquee harus berupa objek."];
  const obj = m as Record<string, unknown>;
  if (!Array.isArray(obj.items) || (obj.items as unknown[]).length === 0)
    return ["marquee.items harus berisi minimal 1 item."];
  return [];
}

function validateVideoDemo(v: unknown): string[] {
  const errors: string[] = [];
  if (!v || typeof v !== "object") return ["videoDemo harus berupa objek."];
  const obj = v as Record<string, unknown>;
  if (typeof obj.title !== "string" || !obj.title.trim())
    errors.push("videoDemo.title wajib diisi.");
  return errors;
}

function validateFAQ(f: unknown): string[] {
  const errors: string[] = [];
  if (!f || typeof f !== "object") return ["faq harus berupa objek."];
  const obj = f as Record<string, unknown>;
  if (typeof obj.title !== "string" || !obj.title.trim())
    errors.push("faq.title wajib diisi.");
  if (!Array.isArray(obj.items) || (obj.items as unknown[]).length === 0)
    errors.push("faq.items harus berisi minimal 1 item.");
  if (obj.promoBanner) {
    const banner = obj.promoBanner as Record<string, unknown>;
    if (!Array.isArray(banner.photos) || (banner.photos as unknown[]).length !== 4)
      errors.push("faq.promoBanner.photos harus berisi tepat 4 URL foto.");
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/landing-config
// Kembalikan config lengkap; jika belum ada baris di DB, kembalikan default.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const rows = await db
    .select()
    .from(landingPageConfig)
    .where(eq(landingPageConfig.id, LANDING_CONFIG_ID))
    .limit(1);

  const config = rows.length > 0 ? rowToConfig(rows[0]) : DEFAULT_LANDING_CONFIG;

  return NextResponse.json({ success: true, data: config });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/landing-config
// Upsert config, validasi semua field, kembalikan config terbaru.
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid." },
      { status: 400 },
    );
  }

  const { hero, about, infoCards, marquee, videoDemo, faq } =
    (body ?? {}) as Record<string, unknown>;

  // ── Validasi ──────────────────────────────────────────────────────────
  const errors: string[] = [
    ...(hero       !== undefined ? validateHero(hero)           : []),
    ...(about      !== undefined ? validateAbout(about)         : []),
    ...(infoCards  !== undefined ? validateInfoCards(infoCards) : []),
    ...(marquee    !== undefined ? validateMarquee(marquee)     : []),
    ...(videoDemo  !== undefined ? validateVideoDemo(videoDemo) : []),
    ...(faq        !== undefined ? validateFAQ(faq)             : []),
  ];

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, message: errors.join(" ") },
      { status: 422 },
    );
  }

  // ── Fetch existing row to merge fields ────────────────────────────────
  const existing = await db
    .select()
    .from(landingPageConfig)
    .where(eq(landingPageConfig.id, LANDING_CONFIG_ID))
    .limit(1);

  const now = new Date();

  if (existing.length === 0) {
    // Insert
    const base = DEFAULT_LANDING_CONFIG;
    await db.insert(landingPageConfig).values({
      id:        LANDING_CONFIG_ID,
      hero:      hero      ?? base.hero,
      about:     about     ?? base.about,
      infoCards: infoCards ?? base.infoCards,
      marquee:   marquee   ?? base.marquee,
      videoDemo: videoDemo ?? base.videoDemo,
      faq:       faq       ?? base.faq,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Update — only overwrite fields that were sent
    const patch: Partial<typeof landingPageConfig.$inferInsert> = { updatedAt: now };
    if (hero      !== undefined) patch.hero      = hero      as LandingHeroConfig;
    if (about     !== undefined) patch.about     = about     as LandingAboutConfig;
    if (infoCards !== undefined) patch.infoCards = infoCards as LandingInfoCardsConfig;
    if (marquee   !== undefined) patch.marquee   = marquee   as LandingMarqueeConfig;
    if (videoDemo !== undefined) patch.videoDemo = videoDemo as LandingVideoDemoConfig;
    if (faq       !== undefined) patch.faq       = faq       as LandingFAQConfig;

    await db
      .update(landingPageConfig)
      .set(patch)
      .where(eq(landingPageConfig.id, LANDING_CONFIG_ID));
  }

  // Return latest
  const updated = await db
    .select()
    .from(landingPageConfig)
    .where(eq(landingPageConfig.id, LANDING_CONFIG_ID))
    .limit(1);

  return NextResponse.json({ success: true, data: rowToConfig(updated[0]) });
}
