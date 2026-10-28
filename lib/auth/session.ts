import { cookies } from "next/headers";

// TODO(auth): Fungsi ini mock. Ganti createMockSession dengan response asli dari POST /auth/login, dan getSession dengan validasi token ke backend (lihat api.md §2).

export interface MockSessionPayload {
  sub: string;
  role: "ADMIN" | "CUSTOMER" | string;
  email: string;
  name: string;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Generate JWT dummy (base64url header.payload.signature)
 */
export function createMockSession(role: "ADMIN" | "CUSTOMER" = "ADMIN"): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload: MockSessionPayload = {
    sub: "mock-admin-id-123",
    role,
    email: role === "ADMIN" ? "admin@roboedu.id" : "user@roboedu.id",
    name: role === "ADMIN" ? "Admin RoboEdu" : "Customer RoboEdu",
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 hari
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = "mock_signature_key";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Baca cookie roboedu_session dari server, decode payload, & return user session
 */
export async function getSession(): Promise<MockSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("roboedu_session")?.value;

    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const jsonStr = base64UrlDecode(parts[1]);
    const payload: MockSessionPayload = JSON.parse(jsonStr);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
