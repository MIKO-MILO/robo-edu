import "server-only";

import crypto from "node:crypto";
// midtrans-client is a CommonJS module; the default import is the module object.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client") as {
  Snap: new (cfg: { isProduction: boolean; serverKey: string; clientKey?: string }) => {
    createTransaction: (payload: unknown) => Promise<{ token: string; redirect_url: string }>;
  };
  CoreApi: new (cfg: { isProduction: boolean; serverKey: string; clientKey?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charge: (payload: unknown) => Promise<any>;
  };
};

// ── Notification type (used by webhook) ──────────────────────────────────────

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

// ── PaymentInstruction union ──────────────────────────────────────────────────
// Shapes must match MockInstruction in components/user/payment/payment-instruction-page.tsx
// exactly so the frontend can cast the backend JSON without additional mapping.

export type PaymentInstruction =
  | { type: "va"; bank_code: string; va_number: string }
  | { type: "echannel"; company_code: string; bill_key: string }
  | { type: "cstore"; payment_code: string; store_name: string }
  | { type: "qr"; qr_string: string; deeplink_url: string }
  | { type: "dana"; deeplink_url: string }
  | { type: "ovo"; status_message: string }
  | { type: "credit_card"; redirect_url: string };

// ── Core API charge param / result ───────────────────────────────────────────

export type ChargeCoreApiParams = {
  paymentType: string;
  channel: string;
  midtransOrderId: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{ id: string; name: string; price: number; quantity: number }>;
  payerPhoneNumber?: string;
  cardToken?: string;
  expiry?: { duration: number; unit: "minutes" | "hour" };
};

export type ChargeCoreApiResult = {
  instruction: PaymentInstruction;
  expiryTime: Date | null;
  transactionStatus: string;
  raw: unknown;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");
  return serverKey;
}

function bankFromChannel(channel: string): string {
  const map: Record<string, string> = {
    bca_va: "bca",
    bni_va: "bni",
    bri_va: "bri",
    cimb_va: "cimb",
    permata_va: "permata",
  };
  return map[channel] ?? channel.replace("_va", "");
}

function bankCodeDisplay(bank: string): string {
  const map: Record<string, string> = {
    bca: "BCA",
    bni: "BNI",
    bri: "BRI",
    cimb: "CIMB",
    permata: "Permata",
  };
  return map[bank.toLowerCase()] ?? bank.toUpperCase();
}

// ── Clients ───────────────────────────────────────────────────────────────────

/**
 * Extract the QR code image URL/string from a Midtrans Core API response.
 *
 * Midtrans returns QR data in two forms depending on the payment type:
 *
 * 1. QRIS: `res.qr_string` = raw EMV QR string (scannable text, NOT an image URL).
 *    The PNG image URL lives in `actions` as "generate-qr-code" or "generate-qr-code-v2".
 *    We prefer the PNG URL so the frontend can render it with a plain <img> tag.
 *
 * 2. GoPay / ShopeePay: may expose `qr_string` as a base64-encoded image directly.
 *    If `actions` has a "generate-qr-code" URL we still prefer that (better quality),
 *    otherwise fall back to the base64.
 *
 * Reference: https://docs.midtrans.com/reference/qris
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qrStringFromResponse(res: Record<string, any>): string {
  // 1. Prefer the PNG image URL from the actions array — works for QRIS, GoPay, ShopeePay
  if (Array.isArray(res.actions)) {
    const preferred = res.actions.find(
      (a: { name?: string; url?: string }) =>
        a.name === "generate-qr-code" || a.name === "generate-qr-code-v2",
    );
    if (preferred?.url) return preferred.url;

    // Fallback: any action whose name contains "qr"
    const fallback = res.actions.find(
      (a: { name?: string; url?: string }) =>
        typeof a.name === "string" && a.name.toLowerCase().includes("qr"),
    );
    if (fallback?.url) return fallback.url;
  }

  // 2. qr_string at root — only use if it looks like a base64 image or URL,
  //    NOT if it's a raw EMV QR string (those start with "000201")
  if (typeof res.qr_string === "string" && res.qr_string) {
    const isRawEmv = res.qr_string.startsWith("000201");
    if (!isRawEmv) return res.qr_string;
    // For raw EMV strings: store as-is for deeplink use, but return empty for image src
    // (caller will use actions URL instead — if no actions URL found, return empty)
  }

  return "";
}

/**
 * Extract the deeplink URL for QR-based payments (GoPay, ShopeePay).
 * For QRIS, there is no meaningful deeplink — returns empty string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function qrDeeplinkFromResponse(res: Record<string, any>, fallback: string): string {
  if (Array.isArray(res.actions)) {
    const deeplink = res.actions.find(
      (a: { name?: string; url?: string }) =>
        typeof a.name === "string" && a.name.toLowerCase().includes("deeplink"),
    );
    if (deeplink?.url) return deeplink.url;

    // Mobile scheme URL (gojek://, shopee://, etc.)
    const mobile = res.actions.find(
      (a: { name?: string; url?: string }) =>
        typeof a.url === "string" &&
        !a.url.startsWith("https://") &&
        !a.url.startsWith("http://"),
    );
    if (mobile?.url) return mobile.url;
  }
  return fallback;
}

// ── Snap client (kept for membership checkout) ────────────────────────────────

export function getSnapClient() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: getServerKey(),
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

// ── Core API client ────────────────────────────────────────────────────────────

export function getCoreApiClient() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: getServerKey(),
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

// ── Core API charge ───────────────────────────────────────────────────────────

/**
 * Charge Midtrans Core API and return a normalised PaymentInstruction.
 * Throws on any Midtrans error — caller maps to PAYMENT_CHARGE_FAILED.
 */
export async function chargeCoreApi(
  params: ChargeCoreApiParams,
): Promise<ChargeCoreApiResult> {
  const {
    paymentType,
    channel,
    midtransOrderId,
    grossAmount,
    customerDetails,
    itemDetails,
    payerPhoneNumber,
    cardToken,
    expiry,
  } = params;

  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost").replace(/\/$/, "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const basePayload: Record<string, any> = {
    transaction_details: { order_id: midtransOrderId, gross_amount: grossAmount },
    customer_details: customerDetails,
    item_details: itemDetails,
  };

  if (expiry) {
    basePayload.expiry = {
      start_time: new Date()
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, " +0700"),
      unit: expiry.unit,
      duration: expiry.duration,
    };
  }

  const coreApi = getCoreApiClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let res: Record<string, any>;

  switch (paymentType) {
    case "bank_transfer": {
      const bank = bankFromChannel(channel);
      if (channel === "permata_va") {
        basePayload.payment_type = "permata";
        basePayload.permata = {};
      } else {
        basePayload.payment_type = "bank_transfer";
        basePayload.bank_transfer = { bank };
      }
      res = await coreApi.charge(basePayload);
      let vaNumber = "";
      if (Array.isArray(res.va_numbers) && res.va_numbers.length > 0) {
        vaNumber = String(res.va_numbers[0].va_number ?? "");
      } else if (typeof res.permata_va_number === "string") {
        vaNumber = res.permata_va_number;
      }
      return {
        instruction: { type: "va", bank_code: bankCodeDisplay(bank), va_number: vaNumber },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "echannel": {
      basePayload.payment_type = "echannel";
      basePayload.echannel = {
        bill_info1: "RoboEdu",
        bill_info2: `Order ${midtransOrderId}`,
      };
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "echannel",
          company_code: String(res.biller_code ?? res.bill_key_code ?? "70012"),
          bill_key: String(res.bill_key ?? ""),
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "cstore": {
      basePayload.payment_type = "cstore";
      basePayload.cstore = { store: channel };
      res = await coreApi.charge(basePayload);
      const storeName = channel === "alfamart" ? "Alfamart" : "Indomaret";
      return {
        instruction: {
          type: "cstore",
          payment_code: String(res.payment_code ?? ""),
          store_name: storeName,
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "gopay": {
      basePayload.payment_type = "gopay";
      basePayload.gopay = {
        enable_callback: true,
        callback_url: `${APP_URL}/payment/callback`,
      };
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "qr",
          qr_string: qrStringFromResponse(res),
          deeplink_url: qrDeeplinkFromResponse(res, `gojek://gopay/pay?token=${midtransOrderId}`),
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "shopeepay": {
      basePayload.payment_type = "shopeepay";
      basePayload.shopeepay = { callback_url: `${APP_URL}/payment/callback` };
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "qr",
          qr_string: qrStringFromResponse(res),
          deeplink_url: qrDeeplinkFromResponse(res, `shopee://wallet/pay?token=${midtransOrderId}`),
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "qris": {
      basePayload.payment_type = "qris";
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "qr",
          qr_string: qrStringFromResponse(res),
          // QRIS has no deeplink — empty string means the "Buka Aplikasi" button
          // won't be shown on mobile (frontend guards on deeplink_url being truthy)
          deeplink_url: qrDeeplinkFromResponse(res, ""),
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "dana": {
      basePayload.payment_type = "dana";
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "dana",
          deeplink_url:
            qrDeeplinkFromResponse(res, `dana://pay?amount=${grossAmount}`),
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "ovo": {
      if (!payerPhoneNumber) {
        throw new Error("payerPhoneNumber is required for OVO payments");
      }
      basePayload.payment_type = "ovo";
      basePayload.ovo = { phone: payerPhoneNumber };
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "ovo",
          status_message:
            typeof res.status_message === "string"
              ? res.status_message
              : "Periksa notifikasi push di aplikasi OVO Anda.",
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    case "credit_card": {
      if (!cardToken) {
        throw new Error("cardToken is required for credit card payments");
      }
      basePayload.payment_type = "credit_card";
      basePayload.credit_card = { token_id: cardToken, authentication: true };
      res = await coreApi.charge(basePayload);
      return {
        instruction: {
          type: "credit_card",
          redirect_url:
            typeof res.redirect_url === "string"
              ? res.redirect_url
              : "/payment/3ds-placeholder",
        },
        expiryTime: res.expiry_time ? new Date(res.expiry_time) : null,
        transactionStatus: res.transaction_status ?? "pending",
        raw: res,
      };
    }

    default:
      throw new Error(`Unsupported paymentType: ${paymentType}`);
  }
}

// ── Signature validation ──────────────────────────────────────────────────────

/** Midtrans signs notifications with SHA-512(order_id + status_code + gross_amount + server_key). */
export function isValidMidtransSignature(
  notification: MidtransNotification,
  signatureKey: unknown,
) {
  if (typeof signatureKey !== "string") return false;

  const expected = crypto
    .createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${getServerKey()}`,
    )
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signatureKey, "hex");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
