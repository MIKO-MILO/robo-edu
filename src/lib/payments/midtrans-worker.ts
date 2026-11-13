/**
 * midtrans-worker.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Worker-safe Midtrans helpers — identical to midtrans.ts but WITHOUT the
 * `import "server-only"` guard so this file can be imported by the BullMQ
 * worker process (src/workers/index.ts), which is a plain Node.js process
 * and not a Next.js context.
 *
 * Only expose the subset of helpers needed by background jobs:
 *   - getCoreApiClient()
 *   - cancelCoreApi()
 *   - getTransactionStatusCoreApi()
 *
 * Do NOT import this file from Next.js Route Handlers or Server Components.
 * They should import from midtrans.ts (which has the server-only guard).
 */

// midtrans-client is a CommonJS module; the default import is the module object.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client") as {
  CoreApi: new (cfg: {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charge: (payload: unknown) => Promise<any>;
    transaction: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cancel: (orderId: string) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (orderId: string) => Promise<any>;
    };
  };
};

// ── MidtransNotification (mirrored from midtrans.ts) ─────────────────────────

export type MidtransNotification = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_id: string;
  transaction_status: string;
  payment_type: string;
  fraud_status?: string;
  transaction_time?: string;
  settlement_time?: string;
  expiry_time?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getServerKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY is not configured");
  return key;
}

export function getCoreApiClient() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: getServerKey(),
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

// ── Cancel API ────────────────────────────────────────────────────────────────

/**
 * Cancel a pending Midtrans Core API transaction.
 *
 * Idempotent: swallows 412 / "already terminal" errors so callers don't need
 * to guard against double-cancels.
 */
export async function cancelCoreApi(midtransOrderId: string): Promise<void> {
  const coreApi = getCoreApiClient();
  try {
    await coreApi.transaction.cancel(midtransOrderId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("412") ||
      msg.toLowerCase().includes("already") ||
      msg.toLowerCase().includes("denied") ||
      msg.toLowerCase().includes("not found")
    ) {
      return; // already terminal — safe to continue
    }
    throw err;
  }
}

// ── Get Transaction Status API ────────────────────────────────────────────────

/**
 * Fetch the current transaction status from Midtrans for a given
 * midtrans_order_id (or midtrans transaction ID — Midtrans accepts both).
 *
 * Returns a MidtransNotification-shaped object on success.
 * Throws on network errors; callers should catch and handle (e.g. log + skip).
 */
export async function getTransactionStatusCoreApi(
  midtransOrderId: string,
): Promise<MidtransNotification> {
  const coreApi = getCoreApiClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await coreApi.transaction.status(midtransOrderId);
  return res as MidtransNotification;
}

// ── Status resolution (mirrored from webhook handler) ────────────────────────

type PaymentState = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";

/** Terminal payment states — once reached, no further update is applied. */
export const TERMINAL_PAYMENT_STATES = new Set<PaymentState>([
  "PAID",
  "FAILED",
  "EXPIRED",
  "REFUNDED",
]);

/**
 * Map a Midtrans transaction_status + optional fraud_status to our internal
 * PaymentState. Returns null for `chargeback` (no status change needed).
 */
export function resolvePaymentState(
  notification: MidtransNotification,
): PaymentState | null {
  switch (notification.transaction_status) {
    case "settlement":
      return "PAID";
    case "capture":
      return notification.fraud_status === "accept" ? "PAID" : "PENDING";
    case "expire":
      return "EXPIRED";
    case "cancel":
    case "deny":
    case "failure":
      return "FAILED";
    case "refund":
    case "partial_refund":
      return "REFUNDED";
    case "chargeback":
      return null;
    default:
      return "PENDING";
  }
}
