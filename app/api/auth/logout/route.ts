import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/src/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the session cookie by setting it to empty with maxAge 0
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
