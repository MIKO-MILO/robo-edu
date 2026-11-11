import { NextResponse } from "next/server";
import { getSetting } from "@/src/lib/services/settings-service";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Canonical channel catalog — the single source of truth for all 14 PRD §11.4
// channels. The frontend's `PaymentChannel` union and `PAYMENT_METHODS_FALLBACK`
// must stay in sync with this list.
// ---------------------------------------------------------------------------

export interface PaymentChannelEntry {
  method: string;
  channel: string;
  label: string;
  group: string;
}

export const CHANNEL_CATALOG: readonly PaymentChannelEntry[] = [
  // Virtual Account
  { method: "bank_transfer", channel: "bca_va",      label: "BCA Virtual Account",      group: "Virtual Account" },
  { method: "bank_transfer", channel: "bni_va",      label: "BNI Virtual Account",      group: "Virtual Account" },
  { method: "bank_transfer", channel: "bri_va",      label: "BRI Virtual Account",      group: "Virtual Account" },
  { method: "bank_transfer", channel: "mandiri_va",  label: "Mandiri Virtual Account",  group: "Virtual Account" },
  { method: "bank_transfer", channel: "permata_va",  label: "Permata Virtual Account",  group: "Virtual Account" },
  { method: "bank_transfer", channel: "cimb_va",     label: "CIMB Virtual Account",     group: "Virtual Account" },
  // Kartu
  { method: "credit_card",   channel: "credit_card", label: "Kartu Kredit / Debit",      group: "Kartu" },
  // QRIS
  { method: "gopay",         channel: "gopay",       label: "GoPay QRIS",               group: "QRIS" },
  { method: "shopeepay",     channel: "shopeepay",   label: "ShopeePay QRIS",           group: "QRIS" },
  { method: "qris",          channel: "qris",        label: "QRIS (semua dompet)",       group: "QRIS" },
  // E-Wallet
  { method: "dana",          channel: "dana",        label: "DANA",                    group: "E-Wallet" },
  { method: "ovo",           channel: "ovo",         label: "OVO",                     group: "E-Wallet" },
  // Gerai
  { method: "cstore",        channel: "alfamart",    label: "Alfamart",                group: "Gerai" },
  { method: "cstore",        channel: "indomaret",   label: "Indomaret",               group: "Gerai" },
] as const;

// ---------------------------------------------------------------------------
// GET /api/payment-methods
// ---------------------------------------------------------------------------

/**
 * Public endpoint — returns the list of active payment channels.
 *
 * Reads `payment_methods_config` (JSON) from the settings table. Each key in
 * the config is a channel string (matching `CHANNEL_CATALOG`); the value is a
 * boolean (`true` = active, `false` = disabled). Channels not present in the
 * config default to active. Inactive channels are filtered out server-side.
 *
 * No auth required — this is consumed by the checkout and membership payment
 * screens. The response shape matches what `CheckoutPaymentMethodSelector`
 * expects: `{ method, channel, label, is_active }` plus `group` for display.
 */
export async function GET() {
  const rawConfig = await getSetting("payment_methods_config");

  // Parse config; default to empty object (all channels active) on any error.
  let config: Record<string, boolean> = {};
  if (rawConfig) {
    try {
      const parsed = JSON.parse(rawConfig);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        config = parsed as Record<string, boolean>;
      }
    } catch {
      // Malformed JSON in settings — treat as all-active (safe default).
    }
  }

  // Filter: include channel only if config[channel] !== false.
  // Missing keys default to active (true).
  const activeChannels = CHANNEL_CATALOG.filter((entry) => {
    const flag = config[entry.channel];
    return flag !== false; // undefined → active, true → active, false → filtered
  }).map((entry) => ({
    method: entry.method,
    channel: entry.channel,
    label: entry.label,
    group: entry.group,
    is_active: true,
  }));

  return NextResponse.json({
    success: true,
    data: activeChannels,
  });
}
