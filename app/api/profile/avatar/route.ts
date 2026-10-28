import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { readProfileAvatar } from "@/src/lib/storage/profile-avatar";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return new NextResponse(null, { status: 401 });
  const [user] = await db.select({ avatarKey: users.avatarKey, isActive: users.isActive }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isActive) return new NextResponse(null, { status: 401 });
  if (!user.avatarKey) return new NextResponse(null, { status: 404 });

  try {
    const { stream, contentType } = await readProfileAvatar(user.avatarKey);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
