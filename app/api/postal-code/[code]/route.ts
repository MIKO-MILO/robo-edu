import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface PostalCodeResult {
  code: number;
  village: string;
  district: string;
  regency: string;
  province: string;
}

interface PostalCodeApiResponse {
  statusCode: number;
  data: PostalCodeResult[];
}

/**
 * GET /api/postal-code/[code]
 * Proxy ke kodepos.vercel.app agar tidak kena CORS dari browser.
 * Returns array of matches (satu kode pos bisa punya beberapa kelurahan).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!/^\d{5}$/.test(code)) {
    return NextResponse.json({ success: false, message: "Kode pos harus 5 digit angka." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://kodepos.vercel.app/search/?q=${code}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 86400 }, // cache 24 jam — data kode pos jarang berubah
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: "Gagal mengambil data kode pos." }, { status: 502 });
    }

    const json: PostalCodeApiResponse = await res.json();

    // Filter hanya yang kode-nya persis sama (API bisa return hasil fuzzy)
    const matches = (json.data ?? []).filter((d) => String(d.code) === code);

    if (matches.length === 0) {
      return NextResponse.json({ success: false, message: "Kode pos tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: matches.map((d) => ({
        postalCode: String(d.code),
        village: d.village,
        district: d.district,
        city: d.regency,
        province: d.province,
      })),
    });
  } catch (err) {
    console.error("GET /api/postal-code error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghubungi layanan kode pos." }, { status: 500 });
  }
}
