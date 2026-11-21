import "server-only";

import { getSetting } from "@/src/lib/services/settings-service";
import {
  CHANNEL_CATALOG,
  KNOWN_CHANNELS,
  parseMethodsConfig,
  type PaymentChannelEntry,
} from "@/src/lib/payment/channels";

/**
 * Server-side helpers for the active-payment-channel feature.
 *
 * `payment_methods_config` is a JSON blob in the `settings` key-value table.
 * This module is the only server seam that reads it for the public endpoint
 * and for enforcement at the checkout/membership/retry entry points.
 *
 * The admin UI writes the blob via `PATCH /api/admin/settings`; whatever it
 * writes is visible here immediately (no cache) — same as `membership_plus_price`.
 */

/** Thrown by {@link assertChannelActive} when a channel is unknown or disabled. */
export class PaymentChannelUnavailableError extends Error {
  constructor() {
    super("PAYMENT_CHANNEL_UNAVAILABLE");
    this.name = "PaymentChannelUnavailableError";
  }
}

/**
 * Read `payment_methods_config` from the DB and return the catalog channels
 * that are currently active (those not explicitly set to `false`).
 *
 * Missing keys default to active — a fresh install with no config row returns
 * every channel. This matches the public `GET /api/payment-methods` contract.
 */
export async function getActiveChannels(): Promise<PaymentChannelEntry[]> {
  const raw = await getSetting("payment_methods_config");
  const config = parseMethodsConfig(raw);
  return CHANNEL_CATALOG.filter((entry) => config[entry.channel] !== false);
}

/**
 * Whether a single channel is currently selectable. Unknown channels are
 * always `false`; known channels default to active unless explicitly disabled.
 */
export async function isChannelActive(channel: string): Promise<boolean> {
  if (!KNOWN_CHANNELS.has(channel)) return false;
  const raw = await getSetting("payment_methods_config");
  const config = parseMethodsConfig(raw);
  return config[channel] !== false;
}

/**
 * Assert that `channel` is a known, currently-active payment channel.
 *
 * Throws {@link PaymentChannelUnavailableError} otherwise — the caller maps it
 * to a 422 response. This is the server-side enforcement that backs the
 * admin toggle: even if a client POSTs a disabled channel directly to the
 * checkout/membership/retry endpoints, the request is rejected here.
 *
 * Use at every entry point that accepts a user-chosen `payment_channel`.
 */
export async function assertChannelActive(channel: string): Promise<void> {
  if (!KNOWN_CHANNELS.has(channel)) throw new PaymentChannelUnavailableError();
  const raw = await getSetting("payment_methods_config");
  const config = parseMethodsConfig(raw);
  if (config[channel] === false) throw new PaymentChannelUnavailableError();
}
