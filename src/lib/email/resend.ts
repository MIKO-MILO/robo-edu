import "server-only";

import { Resend } from "resend";

function getResendApiKey() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return key;
}

export function getResendClient() {
  return new Resend(getResendApiKey());
}

export function getEmailFrom() {
  const name = process.env.EMAIL_FROM_NAME ?? "RoboEdu";
  const address = process.env.EMAIL_FROM ?? "no-reply@roboedu.id";
  return `${name} <${address}>`;
}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost").replace(/\/$/, "");
}
