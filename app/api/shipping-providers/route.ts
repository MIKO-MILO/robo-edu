import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { shippingProviders } from "@/src/db/schema";

export const runtime = "nodejs";

/**
 * Shipping service definitions.
 * Cost is a flat rate in Rupiah. In production this would come from a
 * courier API (RajaOngkir, etc.) keyed on origin + destination postal code.
 */
const SERVICES = [
  {
    service: "REG",
    service_label: "Reguler (EZ)",
    badge: "Paling Populer",
    badge_variant: "green" as const,
    estimate: "2 – 3 Hari Kerja",
    cost: 20_000,
    note: "Langsung antar ke alamat",
  },
  {
    service: "YES",
    service_label: "Fast / Next Day Super",
    badge: "Prioritas Lab",
    badge_variant: "yellow" as const,
    estimate: "1 – 2 Hari Kerja",
    cost: 35_000,
    note: "Garansi tepat waktu",
  },
];

/**
 * GET /api/shipping-providers
 * Returns active shipping providers joined with their available service options.
 * If no providers are seeded yet, falls back to a built-in J&T entry so the
 * checkout page is never empty.
 */
export async function GET() {
  try {
    const providers = await db
      .select({ id: shippingProviders.id, name: shippingProviders.name })
      .from(shippingProviders)
      .where(eq(shippingProviders.isActive, true));

    // Use the first active provider; fall back to a stub if the table is empty.
    const provider = providers[0] ?? { id: "jnt-default", name: "J&T" };

    const options = SERVICES.map((svc) => ({
      provider_id: provider.id,
      provider_name: provider.name,
      ...svc,
    }));

    return NextResponse.json({ success: true, data: options });
  } catch (error) {
    console.error("GET /api/shipping-providers error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil opsi pengiriman." },
      { status: 500 },
    );
  }
}
