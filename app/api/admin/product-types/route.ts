import { NextRequest, NextResponse } from "next/server";
import { eq, like, or, desc, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/src/db";
import { productTypes } from "@/src/db/schema";
import { getSessionUserId } from "@/src/lib/auth/session";

export const runtime = "nodejs";

/**
 * GET /api/admin/product-types
 * Query params: search, is_active, page, limit
 */
export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";
  const isActiveParam = searchParams.get("is_active");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));
  const offset = (page - 1) * limit;

  const filters = [];
  if (search) {
    filters.push(or(like(productTypes.name, `%${search}%`), like(productTypes.slug, `%${search}%`))!);
  }
  if (isActiveParam !== null) {
    filters.push(eq(productTypes.isActive, isActiveParam === "true"));
  }

  const whereClause = filters.length > 0
    ? filters.reduce((a, b) => sql`${a} AND ${b}`)
    : undefined;

  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(productTypes)
    .where(whereClause);

  const rows = await db
    .select()
    .from(productTypes)
    .where(whereClause)
    .orderBy(desc(productTypes.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    success: true,
    data: rows.map((pt) => ({
      id: pt.id,
      name: pt.name,
      slug: pt.slug,
      description: pt.description ?? null,
      is_active: pt.isActive,
      created_at: pt.createdAt.toISOString(),
      updated_at: pt.updatedAt.toISOString(),
    })),
    meta: {
      current_page: page,
      per_page: limit,
      total_pages: Math.ceil(Number(total) / limit),
      total_count: Number(total),
    },
  });
}

/**
 * POST /api/admin/product-types
 * Body: { name, slug, description?, is_active? }
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Silakan login terlebih dahulu." },
      { status: 401 },
    );
  }

  let body: { name?: string; slug?: string; description?: string; is_active?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, message: "Body tidak valid." }, { status: 400 });
  }

  const { name, slug, description, is_active } = body;
  if (!name || !slug) {
    return NextResponse.json(
      { success: false, message: "Field name dan slug wajib diisi." },
      { status: 422 },
    );
  }

  const [dup] = await db.select({ id: productTypes.id }).from(productTypes)
    .where(eq(productTypes.slug, slug)).limit(1);
  if (dup) {
    return NextResponse.json({ success: false, message: "Slug sudah digunakan." }, { status: 422 });
  }

  const id = randomUUID();
  await db.insert(productTypes).values({
    id, name, slug,
    description: description ?? null,
    isActive: is_active ?? true,
  });

  const [created] = await db.select().from(productTypes).where(eq(productTypes.id, id)).limit(1);
  return NextResponse.json({
    success: true,
    data: {
      id: created.id, name: created.name, slug: created.slug,
      description: created.description ?? null, is_active: created.isActive,
      created_at: created.createdAt.toISOString(), updated_at: created.updatedAt.toISOString(),
    },
  }, { status: 201 });
}
