import { sql } from "drizzle-orm";
import { mysqlTable, varchar, json, datetime } from "drizzle-orm/mysql-core";

/**
 * Singleton row yang menyimpan seluruh konten teks landing page.
 * Hanya boleh ada satu baris (id = "singleton").
 *
 * Skema JSON per kolom:
 *
 * hero: { headline, description, ctaPrimaryLabel, ctaPrimaryUrl, ctaSecondaryLabel }
 * about: { badgeLabel, titleMain, titleHighlight, description,
 *          features: [{ id, label }, …] }  — tepat 4 item
 * infoCards: [{ id, title, description }, …]  — tepat 4 item, icons terkunci di kode
 * marquee: { items: string[] }  — min 1 item
 * videoDemo: { title, description, videoSrc }
 * faq: {
 *   title, description,
 *   promoBanner: { titlePrefix, description, photos: string[] },  — 4 URL foto
 *   items: [{ id, question, answer }, …]  — min 1 item
 * }
 */
export const landingPageConfig = mysqlTable("landing_page_config", {
  id: varchar("id", { length: 36 }).primaryKey(),
  hero: json("hero"),
  about: json("about"),
  infoCards: json("info_cards"),
  marquee: json("marquee"),
  videoDemo: json("video_demo"),
  faq: json("faq"),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
