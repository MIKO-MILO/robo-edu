import "server-only";

import crypto from "node:crypto";
import midtransClient from "midtrans-client";

type MidtransNotification = {
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

function getServerKey() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");
  return serverKey;
}

export function getSnapClient() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: getServerKey(),
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

/** Midtrans signs notifications with SHA-512(order_id + status_code + gross_amount + server_key). */
export function isValidMidtransSignature(
  notification: MidtransNotification,
  signatureKey: unknown,
) {
  if (typeof signatureKey !== "string") return false;

  const expected = crypto
    .createHash("sha512")
    .update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${getServerKey()}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signatureKey, "hex");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export type { MidtransNotification };
