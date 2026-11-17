import { NextResponse } from "next/server";
import { getActiveChannels } from "@/src/lib/payment/payment-methods-service";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// GET /api/payment-methods
// ---------------------------------------------------------------------------

/**
 * Public endpoint — returns the list of active payment channels.
 *
 * Reads `payment_methods_config` (JSON) from the settings table via the shared
 * {@link getActiveChannels} helper, which uses the canonical
 * `CHANNEL_CATALOG` (`src/lib/payment/channels.ts`) as the single source of
 * truth. Each key in the config is a channel string; the value is a boolean
 * (`true` = active, `false` = disabled). Channels not present in the config
 * default to active. Inactive channels are filtered out server-side.
 *
 * No auth required — this is consumed by the checkout and membership payment
 * screens. The response shape matches what `CheckoutPaymentMethodSelector`
 * expects: `{ method, channel, label, group, is_active }`.
 */
export async function GET() {
  const activeChannels = await getActiveChannels();

  return NextResponse.json({
    success: true,
    data: activeChannels.map((entry) => ({
      method: entry.method,
      channel: entry.channel,
      label: entry.label,
      group: entry.group,
      is_active: true,
    })),
  });
}
