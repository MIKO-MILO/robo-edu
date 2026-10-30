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

export async function getSessionUserId(request?: Request): Promise<string | null> {
  let token: string | undefined;
  if (request) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Called outside Next.js request scope (e.g. testing)
    }
  }
  return verifySessionToken(token)?.userId ?? null;
}

export async function getSession(request?: Request): Promise<{ userId: string; expiresAt: number } | null> {
  let token: string | undefined;
  if (request) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Called outside Next.js request scope (e.g. testing)
    }
  }
  return verifySessionToken(token);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
