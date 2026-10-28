import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { categories } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";
type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!row) return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id: row.id, name: row.name, slug: row.slug,
      description: row.description ?? null, image_url: row.imageUrl ?? null,
      is_active: row.isActive, created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });

  let body: { name?: string; slug?: string; description?: string; is_active?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Body tidak valid." }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.is_active !== undefined) updateData.isActive = body.is_active;

  await db.update(categories).set(updateData).where(eq(categories.id, id));
  const [updated] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

  return NextResponse.json({
    success: true,
    data: {
      id: updated.id, name: updated.name, slug: updated.slug,
      description: updated.description ?? null, image_url: updated.imageUrl ?? null,
      is_active: updated.isActive, created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
  if (!existing) return NextResponse.json({ success: false, message: "Kategori tidak ditemukan." }, { status: 404 });

  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ success: true, data: { message: "Kategori berhasil dihapus." } });
}
