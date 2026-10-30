import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "roboedu_session";

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be configured with at least 32 characters");
  return secret;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string, rememberMe: boolean) {
  const expiresAt = Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt } satisfies SessionPayload)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length) return null;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded || typeof decoded !== "object") return null;
    const { userId, expiresAt } = decoded as SessionPayload;
    return typeof userId === "string" && userId && typeof expiresAt === "number" && expiresAt > Date.now()
      ? { userId, expiresAt }
      : null;
  } catch {
    return null;
  }
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)?.userId ?? null;
}

export async function getSession(): Promise<{ userId: string; expiresAt: number } | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Read the session user ID directly from a Web API `Request` object's Cookie
 * header. Use this in route handlers that already receive a `Request` (or
 * `NextRequest`) and want to avoid calling the Next.js `cookies()` API — which
 * requires the Next async-context and is not available in plain-Node tests.
 */
export function getUserIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  // Parse a semicolon-separated cookie string; each pair is "name=value".
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const name = part.slice(0, eqIdx).trim();
    if (name !== SESSION_COOKIE_NAME) continue;
    const value = part.slice(eqIdx + 1).trim();
    return verifySessionToken(value)?.userId ?? null;
  }
  return null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
