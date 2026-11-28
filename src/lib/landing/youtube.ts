/**
 * Helper untuk validasi & parsing URL YouTube.
 * Dipakai oleh:
 * - Editor Video Demo di admin (validasi sebelum simpan)
 * - PUT /api/admin/landing-config (validasi server-side)
 * - Komponen VideoDemo publik (embed popup)
 *
 * Format yang diterima:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtube.com/watch?v=VIDEO_ID
 *   https://m.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 */

/** Ekstrak video ID dari URL YouTube; null jika bukan URL YouTube valid. */
export function parseYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();

    // watch?v=VIDEO_ID (www / m / music)
    if (
      (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") &&
      u.pathname === "/watch"
    ) {
      const v = u.searchParams.get("v");
      return v && /^[a-zA-Z0-9_-]{6,20}$/.test(v) ? v : null;
    }

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }

    // /embed/VIDEO_ID
    if (
      (host === "www.youtube.com" || host === "youtube.com") &&
      /^\/embed\/[a-zA-Z0-9_-]{6,20}$/.test(u.pathname)
    ) {
      return u.pathname.split("/")[2];
    }
  } catch {
    // bukan URL valid
  }
  return null;
}

/** True jika string adalah URL YouTube yang valid. */
export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeId(url) !== null;
}

/** URL embed popup (dengan autoplay) — null jika bukan URL YouTube. */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = parseYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
}

/** URL thumbnail hq dari YouTube — null jika bukan URL YouTube. */
export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = parseYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
