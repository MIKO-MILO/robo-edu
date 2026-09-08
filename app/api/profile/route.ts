import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { removeProfileAvatar, saveProfileAvatar } from "@/src/lib/storage/profile-avatar";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

function profileResponse(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    gender: user.gender ?? "",
    taxIdentificationNumber: user.taxIdentificationNumber ?? "",
    taxIdentificationCountry: user.taxIdentificationCountry ?? "",
    residentialAddress: user.residentialAddress ?? "",
    avatarUrl: user.avatarKey ? "/api/profile/avatar" : null,
  };
}

async function currentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user?.isActive ? user : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  return NextResponse.json({ success: true, data: profileResponse(user) });
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const gender = body.gender === "male" || body.gender === "female" ? body.gender : null;
    const taxIdentificationNumber = typeof body.taxIdentificationNumber === "string" ? body.taxIdentificationNumber.trim() : "";
    const taxIdentificationCountry = typeof body.taxIdentificationCountry === "string" ? body.taxIdentificationCountry.trim() : "";
    const residentialAddress = typeof body.residentialAddress === "string" ? body.residentialAddress.trim() : "";
    if (
      !name || name.length > 150 || (phone !== null && phone.length > 30) ||
      taxIdentificationNumber.length > 100 || taxIdentificationCountry.length > 100
    ) {
      return NextResponse.json({ success: false, message: "Data profil tidak valid." }, { status: 400 });
    }

    const profile = {
      name,
      phone: phone || null,
      gender,
      taxIdentificationNumber: taxIdentificationNumber || null,
      taxIdentificationCountry: taxIdentificationCountry || null,
      residentialAddress: residentialAddress || null,
    };
    await db.update(users).set(profile).where(eq(users.id, user.id));
    return NextResponse.json({ success: true, data: profileResponse({ ...user, ...profile }) });
  } catch {
    return NextResponse.json({ success: false, message: "Data profil tidak valid." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar");
    if (!(file instanceof File)) return NextResponse.json({ success: false, message: "Pilih file foto terlebih dahulu." }, { status: 400 });
    if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type) || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Foto harus JPG, PNG, atau WebP dan maksimal 5 MB." }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
    const avatarKey = await saveProfileAvatar(user.id, file);
    await db.update(users).set({ avatarKey }).where(eq(users.id, user.id));
    if (user.avatarKey) removeProfileAvatar(user.avatarKey).catch(() => undefined);

    return NextResponse.json({ success: true, data: { avatarUrl: `/api/profile/avatar?updated=${Date.now()}` } });
  } catch (error) {
    console.error("POST /api/profile avatar error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengunggah foto profil." }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ success: false, message: "Silakan login terlebih dahulu." }, { status: 401 });
  await db.update(users).set({ avatarKey: null }).where(eq(users.id, user.id));
  if (user.avatarKey) removeProfileAvatar(user.avatarKey).catch(() => undefined);
  return NextResponse.json({ success: true });
}
