import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import { shippingProviders } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/require-admin";
import {
  getAllSettings,
  upsertSettings,
} from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

/**
 * Admin-managed store / membership / shipping settings.
 *
 * The `settings` table is a flat key-value store (all values TEXT). This route
 * exposes it as a single flat object and lets admins PATCH a partial update —
 * only the sent keys are written, the rest are left untouched.
 *
 * Because `membership_plus_price` lives here and is read at request time by the
 * membership checkout (via `settings-service`), changing it from the admin UI
 * changes what `POST /api/checkout/membership` charges with no redeploy.
 */

/** Settings whose value is free-form text. */
const STRING_KEYS = new Set([
  "store_name",
  "store_phone",
  "store_email",
  "store_address",
  "shipping_default_provider_id",
]);

/** Settings stored as a non-negative number (price in rupiah, months, grams). */
const NUMBER_KEYS = new Set([
  "membership_plus_price",
  "membership_plus_duration_months",
  "shipping_min_weight",
  "shipping_cost",
]);

/** Settings that must be a positive integer (whole months). */
const POSITIVE_INT_KEYS = new Set(["membership_plus_duration_months"]);

const ALLOWED_KEYS = new Set([...STRING_KEYS, ...NUMBER_KEYS]);

// Light email shape check — we don't aim to be a full RFC 5322 validator.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize + validate a single field from the PATCH body into the string
 * value to persist. Returns `[value, error]`; on `error` the caller should
 * reject the whole request with that message.
 */
async function normalizeField(
  key: string,
  raw: unknown,
): Promise<[string, null] | [null, string]> {
  if (raw === null || raw === undefined || Number.isNaN(raw)) {
    return [null, `Nilai untuk \`${key}\` tidak boleh kosong.`];
  }

  if (NUMBER_KEYS.has(key)) {
    const num = typeof raw === "number" ? raw : Number(String(raw).trim());
    if (!Number.isFinite(num)) {
      return [null, `\`${key}\` harus berupa angka yang valid.`];
    }
    if (num < 0) {
      return [null, `\`${key}\` tidak boleh negatif.`];
    }
    if (POSITIVE_INT_KEYS.has(key)) {
      if (!Number.isInteger(num) || num < 1) {
        return [null, `\`${key}\` harus berupa bilangan bulat positif.`];
      }
    }
    return [String(num), null];
  }

  // String keys
  const value = typeof raw === "string" ? raw.trim() : String(raw).trim();

  if (key === "store_email" && value && !EMAIL_RE.test(value)) {
    return [null, `\`${key}\` harus berupa alamat email yang valid.`];
  }

  // shipping_default_provider_id references shipping_providers.id. Only
  // validate the FK when a non-empty value is supplied (empty clears it).
  if (key === "shipping_default_provider_id" && value) {
    const [provider] = await db
      .select({ id: shippingProviders.id })
      .from(shippingProviders)
      .where(eq(shippingProviders.id, value))
      .limit(1);
    if (!provider) {
      return [null, "Provider pengiriman tidak ditemukan."];
    }
  }

  return [value, null];
}

/**
 * GET /api/admin/settings
 * Returns every setting as a flat `{ key: value }` object.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    success: true,
    data: await getAllSettings(),
  });
}

/**
 * PATCH /api/admin/settings
 * Body: a partial object, e.g. `{ store_name, membership_plus_price }`.
 * Only the sent keys are updated; the response returns the full updated state.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body tidak valid (harus JSON)." },
      { status: 400 },
    );
  }

  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { success: false, message: "Body harus berupa object." },
      { status: 400 },
    );
  }

  const entries = body as Record<string, unknown>;
  const sentKeys = Object.keys(entries);

  if (sentKeys.length === 0) {
    return NextResponse.json(
      { success: false, message: "Tidak ada field yang dikirim." },
      { status: 422 },
    );
  }

  const unknown = sentKeys.filter((k) => !ALLOWED_KEYS.has(k));
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Field tidak dikenal: ${unknown.join(", ")}.`,
        allowed_keys: [...ALLOWED_KEYS],
      },
      { status: 422 },
    );
  }

  const toWrite: Record<string, string> = {};
  for (const key of sentKeys) {
    const [value, error] = await normalizeField(key, entries[key]);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 422 },
      );
    }
    toWrite[key] = value!;
  }

  await upsertSettings(toWrite);

  return NextResponse.json({
    success: true,
    message: "Pengaturan berhasil diperbarui.",
    data: await getAllSettings(),
  });
}
