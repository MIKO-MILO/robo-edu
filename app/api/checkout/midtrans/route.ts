import { type NextRequest } from "next/server";
import { handleCheckout } from "@/src/lib/checkout/checkout-handler";

export const runtime = "nodejs";

/**
 * POST /api/checkout/midtrans
 *
 * Alias kept for backward-compatibility while the frontend migrates to
 * POST /api/checkout. Forwards directly to the shared checkout handler.
 *
 * Body: see handleCheckout in src/lib/checkout/checkout-handler.ts
 * Required header: Idempotency-Key
 */
export async function POST(request: NextRequest) {
  return handleCheckout(request);
}
