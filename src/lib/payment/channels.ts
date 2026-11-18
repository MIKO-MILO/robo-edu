/**
 * Canonical payment channel catalog — the SINGLE SOURCE OF TRUTH for which
 * payment channels exist in the app (method, channel, label, group).
 *
 * This module is CLIENT-SAFE: it has no server-only imports, so both server
 * routes and client components (e.g. the admin `/admin/payment-settings` page)
 * can import the catalog. DB-reading helpers live in
 * `src/lib/payment/payment-methods-service.ts` (which is `"server-only"`) so
 * the DB client is never pulled into the browser bundle.
 *
 * Frontend display metadata (icon, color, bg) lives in the
 * `CheckoutPaymentMethodSelector` component, kept separate from this catalog
 * so adding/removing a channel here automatically updates which channels the
 * admin can toggle and which the public endpoint returns, without touching
 * UI rendering concerns.
 *
 * GoPay QRIS (`gopay`) and ShopeePay QRIS (`shopeepay`) are intentionally NOT in
 * this catalog — they have been removed as selectable payment methods. Any
 * unknown channel string (including `kredivo`, or a future channel not yet
 * added here) is rejected by `KNOWN_CHANNELS`.
 */

export interface PaymentChannelEntry {
  /** Midtrans `payment_type`, e.g. "bank_transfer", "credit_card", "qris". */
  method: string;
  /** Specific channel id, e.g. "bca_va", "qris", "dana". Must be unique. */
  channel: string;
  /** Human-readable label shown to customers and admins. */
  label: string;
  /** Display grouping for the selector ("Virtual Account", "Kartu", ...). */
  group: string;
}

export const CHANNEL_CATALOG: readonly PaymentChannelEntry[] = [
  // Virtual Account
  { method: "bank_transfer", channel: "bca_va",     label: "BCA Virtual Account",     group: "Virtual Account" },
  { method: "bank_transfer", channel: "bni_va",     label: "BNI Virtual Account",      group: "Virtual Account" },
  { method: "bank_transfer", channel: "bri_va",     label: "BRI Virtual Account",      group: "Virtual Account" },
  { method: "bank_transfer", channel: "mandiri_va", label: "Mandiri Virtual Account",  group: "Virtual Account" },
  { method: "bank_transfer", channel: "permata_va",  label: "Permata Virtual Account",  group: "Virtual Account" },
  { method: "bank_transfer", channel: "cimb_va",    label: "CIMB Virtual Account",     group: "Virtual Account" },
  // Kartu
  { method: "credit_card", channel: "credit_card", label: "Kartu Kredit / Debit", group: "Kartu" },
  // QRIS (generic QRIS only — GoPay QRIS & ShopeePay QRIS removed)
  { method: "qris", channel: "qris", label: "QRIS", group: "QRIS" },
  // E-Wallet
  { method: "dana", channel: "dana", label: "DANA", group: "E-Wallet" },
  { method: "ovo",  channel: "ovo",  label: "OVO",  group: "E-Wallet" },
  // Gerai
  { method: "cstore", channel: "alfamart",  label: "Alfamart",  group: "Gerai" },
  { method: "cstore", channel: "indomaret", label: "Indomaret", group: "Gerai" },
] as const;

/** Fast lookup for "is this a real channel?". Unknown channels are rejected. */
export const KNOWN_CHANNELS: ReadonlySet<string> = new Set(
  CHANNEL_CATALOG.map((c) => c.channel),
);

/**
 * Parse the `payment_methods_config` JSON blob from the settings table into a
 * flat `{ channel: boolean }` map.
 *
 * Robustness rules:
 *  - null / undefined / malformed JSON → `{}` (callers treat missing keys as
 *    active, so the safe default is "everything on").
 *  - Unknown channel keys (e.g. legacy `gopay`/`shopeepay`, or `kredivo`) are
 *    dropped so they can never reappear as "active".
 *  - Only an explicit `true` keeps a channel active; any other value (false,
 *    objects, strings) is treated as disabled. This makes the legacy object-
 *    shaped blob (the pre-fix admin bug, e.g. `{ gopay: { enabled: true } }`)
 *    coerce to disabled rather than silently active. The normalisation
 *    migration resets the blob to a clean flat-boolean value regardless.
 */
export function parseMethodsConfig(
  raw: string | null | undefined,
): Record<string, boolean> {
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!KNOWN_CHANNELS.has(key)) continue; // drop unknown channels
    result[key] = value === true;
  }
  return result;
}
